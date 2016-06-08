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

	var startDate = moment('2016-01-01', 'YYYY-MM-DD');
	var glcfsWFSGetFeatureUrls = module.config().glcfsWFSGetFeatureUrls;
	
	var variableId = 'glcfstempVariableId';
	var variableName = 'GLCFStemp';

	var getInteger = function(str) {
		return str.split('.')[0];
	};

	var getDDSURL = function(lake) {
		var url = 'glosthredds/' + module.config().glosThreddsGLCFSData + lake.toLowerCase() + '/fcfmrc-2d/Lake_' + lake + '_-_2D_best.ncd.dds'
		return url;
	};

	var collection = BaseDatasetCollection.extend({

		initialize : function(attributes, options) {
			Backbone.Collection.prototype.initialize.apply(this, arguments);
			this.lake = options.lake;
		},
		
		/*
		 * Parse the xml document and returns a json object which can be used to create the collection.
		 * @param {Document} xml
		 * @returns {Array of Objects}
		 */
		parse : function(xml) {
			var result = [];
			var today = moment();
			var self = this;

			$utils.xmlFind($(xml), 'wfs', 'member').each(function() {
				var $this = $(this);
				var x = getInteger($utils.xmlFind($this, 'sb', 'nx').text());
				var y = getInteger($utils.xmlFind($this, 'sb', 'ny').text());

				result.push({
					lon : $utils.xmlFind($this, 'sb', 'X1').text(),
					lat : $utils.xmlFind($this, 'sb', 'X2').text(),
					variables : new BaseVariableCollection([
						{
							x : x,
							y : y,
							startDate : startDate,
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
		 * Fetches the GLCFS grid data for the specified bounding box and updates the collection contents.
		 * If the fetch fails the collection is reset.
		 * @param {Object} boundingBox - west, east, north, and south properties
		 * @returns a promise. Both rejected and resolved return the original jqXHR
		 */
		fetch : function (boundingBox) {
			var self = this;
			var fetchSiteDataDeferred = $.Deferred();
			var fetchDeferred = $.Deferred();
			var xmlResponse;

			$.ajax({
				url : glcfsWFSGetFeatureUrls[this.lake],
				data : {
					typeName : 'sb:' + this.lake.toLowerCase(),
					srsName : 'EPSG:4269',
					bbox : [boundingBox.south, boundingBox.west, boundingBox.north, boundingBox.east].join(',')
				},
				success : function(xml, textStatus, jqXHR) {
					if ($utils.xmlFind($(xml), 'ows', 'ExceptionReport').length > 0) {
						log.debug('GLCFS GetFeature fetch failed with Exception from service');
						fetchSiteDataDeferred.reject(jqXHR);
					}
					else {
						xmlResponse = xml;
						fetchSiteDataDeferred.resolve(jqXHR);
					}
				},
				error : function(jqXHR) {
					log.debug('GLCFS GetFeature fetch failed');
					fetchSiteDataDeferred.reject(jqXHR);
				}
			});

			$.when(fetchSiteDataDeferred)
				.done(function() {
					self.reset(self.parse(xmlResponse));
					log.debug('GLCFS fetch succeeded, fetched ' + self.length + ' grid');
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