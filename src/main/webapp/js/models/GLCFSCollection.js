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

	var GLCFS_WFS_GETFEATURE_URLS = module.config().glcfsWFSGetFeatureUrls;
	var GLCFS_DDS_URL = 'glosthredds/' + module.config().glosThreddsGLCFSData;
	var START_DATE = moment('2006-01-01', 'YYYY-MM-DD');
	
	/* The dataset property is hard coded in the services to know which thredds endpoint to hit for that data
	 * 
	 * dataset 0
	 * http://tds.glos.us/thredds/dodsC/glos/glcfs/archivecurrent/michigan/ncfmrc-2d/Lake_Michigan_-_Nowcast_-_2D_-_Current_Year_best.ncd.html
	 * 
	 * dataset 1
	 * http://tds.glos.us/thredds/dodsC/glos/glcfs/archivecurrent/michigan/nowcast-forcing-fmrc-2d/Lake_Michigan_-_Nowcast_Forcing_-_2D_-_Current_Year_best.ncd.html 
	 */
	var DATA_VARS = [
		{dataset : 0, code : 'ci', description : 'Ice Concentration (fraction)'},
		{dataset : 0, code : 'depth', description : 'Bathymetry (meters)'},
		{dataset : 0, code : 'eta', description : 'Height Above Model Sea Level (meters)'},
		{dataset : 0, code : 'hi', description : 'Ice Thickness (meters)'},
		{dataset : 0, code : 'uc', description : 'Eastward Water Velocity at Surface (m/s)'},
		{dataset : 0, code : 'ui', description : 'Ice u-velocity (m/s)'},
		{dataset : 0, code : 'utm', description : 'Depth-Averaged Eastward Water Velocity (m/s)'},
		{dataset : 0, code : 'vc', description : 'Northward Water Velocity at Surface (m/s)'},
		{dataset : 0, code : 'vi', description : 'Ice v-velocity (m/s)'},
		{dataset : 0, code : 'vtm', description : 'Depth-Averaged Northward Water Velocity (m/s)'},
		{dataset : 0, code : 'wvd', description : 'Wave Direction (Degrees, Oceanographic Convention, 0=toward N, 90=toward E)'},
		{dataset : 0, code : 'wvh', description : 'Significant Wave Height (meters)'},
		{dataset : 0, code : 'wvp', description : 'Wave Period (seconds)'},
		{dataset : 1, code : 'air_u', description : 'Eastward Air Velocity (m/s)'},
		{dataset : 1, code : 'air_v', description : 'Northward Air Velocity (m/s)'},
		{dataset : 1, code : 'at', description : 'Air Temperature (Celsius)'},
		{dataset : 1, code : 'cl', description : 'Cloud Cover (fraction)'},
		{dataset : 1, code : 'depth', description : 'Bathymetry (meters)'},
		{dataset : 1, code : 'dp', description : 'Dew Point (Celsius)'}
	];

	var getInteger = function(str) {
		return str.split('.')[0];
	};

	var getTimeBounds = function(ddsText) {
		var lines = ddsText.split('\n');
		var timeBoundsLine = lines[11];
		var timeBounds = /(\d+])/.exec(timeBoundsLine)[0];
		return timeBounds.replace(/]/, '');
	};

	var collection = BaseDatasetCollection.extend({

		initialize : function(attributes, options) {
			Backbone.Collection.prototype.initialize.apply(this, arguments);
			this.lake = options.lake;
		},
		
		
		/* Parse the xml document and returns a json object which can be used to create the collection.
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
				
				var variables = _.map(DATA_VARS, function(dataVar) {
					var siteVar = _.clone(dataVar);
					siteVar.startDate = START_DATE;
					siteVar.endDate = today;
					siteVar.x = x;
					siteVar.y = y;
//					self.timeBounds;
					siteVar.variableParameter = new VariableParameter({
						name : 'GRID',
						value : y + ':' + x + ':' + siteVar.dataset + ':' + siteVar.code,
						colName : siteVar.description
					});
					return siteVar;
				});
				
				result.push({
					lon : $utils.xmlFind($this, 'sb', 'X1').text(),
					lat : $utils.xmlFind($this, 'sb', 'X2').text(),
					variables : new BaseVariableCollection(variables)
				});
			});

			return result;
		},
		
		/* Fetches the GLCFS grid data for the specified bounding box and updates the collection contents.
		 * If the fetch fails the collection is reset.
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
				url : GLCFS_WFS_GETFEATURE_URLS[this.lake],
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

			$.ajax({
				url : GLCFS_DDS_URL,
				success : function (response, textStatus, jqXHR) {
					self.timeBounds = getTimeBounds(response);
					fetchDDSDeferred.resolve(jqXHR);
				},
				error : function(jqXHR) {
					log.debug('Unable to retrieve the GLCFS service\'s dds');
					fetchDDSDeferred.reject(jqXHR);
				}
			});

			$.when(fetchSiteDataDeferred, fetchDDSDeferred)
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