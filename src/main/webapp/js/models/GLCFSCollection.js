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
							startDate : START_DATE,
							endDate : today,

//http://tds.glos.us/thredds/dodsC/glos/glcfs/archivecurrent/michigan/ncfmrc-2d/Lake_Michigan_-_Nowcast_-_2D_-_Current_Year_best.ncd.html
//	ci (fraction) = Ice concentration = ice_concentration
//	depth (meters) = Bathymetry = depth
//	eta (meters) = Height Above Model Sea Level = sea_surface_elevation
//	hi (meters) = Ice thickness = ice_thickness
//	uc (m/s) = Eastward Water Velocity at Surface = eastward_sea_water_velocity
//	ui (m/s) = Ice u-velocity = ice_u_veloctiy
//	utm (m/s) = Depth-Averaged Eastward Water Velocity = eastward_sea_water_velocity
//	vc (m/s) = Northward Water Velocity at Surface = northward_sea_water_velocity
//	vi (m/s) = Ice v-velocity = ice_v_veloctiy
//	vtm (m/s) = Depth-Averaged Northward Water Velocity = northward_sea_water_velocity
//	wvd (Degrees, Oceanographic Convention, 0=toward N, 90=toward E) = Wave Direction = wave_direction_to
//	wvh (meters) = Significant Wave Height = wave_height
//	wvp (seconds) = Wave Period = wave_period

//http://tds.glos.us/thredds/dodsC/glos/glcfs/archivecurrent/michigan/nowcast-forcing-fmrc-2d/Lake_Michigan_-_Nowcast_Forcing_-_2D_-_Current_Year_best.ncd.html
//	air_u (m/s) = Eastward Air Velocity = eastward_wind
//	air_v (m/s) = Northward Air Velocity = northward_wind
//	at (Celsius) = Air Temperature = air_temperature
//	cl (fraction) = Cloud cover = cloud_cover
//	depth (meters) = Bathymetry = depth
//	dp (Celsius) = Dew Point = dew_point

							variableParameter : new VariableParameter({
								name : 'A GLCFS Variable',
								value : y + ':' + x + ':' + self.timeBounds + ':variableId',
								colName : 'columnName [' + y + ',' + x + ']',
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