/* jslint browser: true */

define([
	'loglevel',
	'module',
	'jquery',
	'underscore',
	'moment',
	'utils/VariableParameter',
	'models/BaseDatasetCollection',
	'models/BaseVariableCollection',
	'utils/jqueryUtils'
], function(log, module, $, _, moment, VariableParameter, BaseDatasetCollection, BaseVariableCollection, $utils) {
	"use strict";

	var GET_FEATURE_URL = module.config().GLCFSWFSGetFeatureUrl;
	var GLCFS_DATA_DDS_URL = 'glosthredds/' + module.config().glosThreddsGLCFSData + '.dds';

	var variableId = 'glcfstempVariableId';
	var variableName = 'GLCFStemp';

	var getTimeBounds = function(ddsText) {
		var lines = ddsText.split('\n');
		var timeBoundsLine = lines[18];
		var timeBounds = /(\d+])/.exec(timeBoundsLine)[0];
		return timeBounds.replace(/]/, '');
	};

	var collection = BaseDatasetCollection.extend({

		initialize : function(attributes, options) {
			Backbone.Collection.prototype.initialize.apply(this, arguments);
			this.lake = options.lake;
		},
		
		/*
		 * Parse the xml document and returns a json object which can be used to create the collection.
		 * Each precipitation site represents a single variable so the variables property will
		 * contain a collection with a single model.
		 * @param {Document} xml
		 * @returns {Array of Objects}
		 */
		parse : function(xml) {
			var result = [];
			var today = moment();
			var self = this;

			$utils.xmlFind($(xml), 'wfs', 'member').each(function() {
				var $this = $(this);
				var x = getInteger($utils.xmlFind($this, 'sb', 'x').text());
				var y = getInteger($utils.xmlFind($this, 'sb', 'y').text());

				result.push({
					lon : $utils.xmlFind($this, 'sb', 'X1').text(),
					lat : $utils.xmlFind($this, 'sb', 'X2').text(),
					variables : new BaseVariableCollection([
						{
							x : x,
							y : y,
							startDate : START_DATE,
							endDate : today,
							variableParameter : new VariableParameter({
								name : 'GLCFS',
								value : y + ':' + x + ':' + self.timeBounds + ':' + variableId,
								colName : variableName + ' [' + y + ',' + x + ']',
							})
						}
					])
				});
			});
			return result;
		},
		
		/*
		 * Fetches the precipitation grid data for the specified bounding box and updates the collection contents.
		 * If the fetch fails the collection is reset. The .dds document is also fetched using the precipitation service
		 * to determine the time_bounds parameter
		 * @param {Object} boundingBox - west, east, north, and south properties
		 * @returns a promise. Both rejected and resolved return the original jqXHR
		 */
		fetch : function (boundingBox) {
			var self = this;
			var fetchSiteDataDeferred = $.Deferred();
			var fetchDDSDeferred = $.Deferred();
			var fetchDeferred = $.Deferred();
			var xmlResponse;

			$.ajax({
				url : GET_FEATURE_URL,
				data : {
					typeName : this.lake.toLowerCase(),
					srsName : 'EPSG:4269',
					bbox : [boundingBox.south, boundingBox.west, boundingBox.north, boundingBox.east].join(',')
				},
				success : function(xml, textStatus, jqXHR) {
					if ($utils.xmlFind($(xml), 'ows', 'ExceptionReport').length > 0) {
						log.debug('CLCFS GetFeature fetch failed with Exception from service');
						fetchSiteDataDeferred.reject(jqXHR);
					}
					else {
						xmlResponse = xml;
						fetchSiteDataDeferred.resolve(jqXHR);
					}
				},
				error : function(jqXHR) {
					log.debug('CLCFS GetFeature fetch failed');
					fetchSiteDataDeferred.reject(jqXHR);
				}
			});

			$.ajax({
				url : GLCFS_DATA_DDS_URL + this.lake.toLowerCase() + '/fcfmrc-2d/Lake_' + this.lake + '_-_2D_best.ncd.dds',
				success : function (response, textStatus, jqXHR) {
					self.timeBounds = getTimeBounds(response);
					fetchDDSDeferred.resolve(jqXHR);
				},
				error : function(jqXHR) {
					log.debug('Unable to retrieve the glcfs service\'s dds');
					fetchDDSDeferred.reject(jqXHR);
				}
			});

			$.when(fetchSiteDataDeferred, fetchDDSDeferred)
				.done(function() {
					self.reset(self.parse(xmlResponse));
					log.debug('CLCFS fetch succeeded, fetched ' + this.length + ' grid');
					fetchDeferred.resolve();
				})
				.fail(function() {
					self.reset([]);
					fetchDeferred.reject();
				});

			return fetchDeferred.promise();
		}

	});

	return collection;
});