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
		{dataset : 0, code : 'ci', description : 'Ice Concentration (fraction)', variableUnit : 'fraction'},
		{dataset : 0, code : 'depth', description : 'Bathymetry (meters)', variableUnit : 'm'},
		{dataset : 0, code : 'eta', description : 'Height Above Model Sea Level (meters)', variableUnit : 'm'},
		{dataset : 0, code : 'hi', description : 'Ice Thickness (meters)', variableUnit : 'm'},
		{dataset : 0, code : 'uc', description : 'Eastward Water Velocity at Surface (m/s)', variableUnit : 'm/s'},
		{dataset : 0, code : 'ui', description : 'Ice u-velocity (m/s)', variableUnit : 'm/s'},
		{dataset : 0, code : 'utm', description : 'Depth-Averaged Eastward Water Velocity (m/s)', variableUnit : 'm/s'},
		{dataset : 0, code : 'vc', description : 'Northward Water Velocity at Surface (m/s)', variableUnit : 'm/s'},
		{dataset : 0, code : 'vi', description : 'Ice v-velocity (m/s)', variableUnit : 'm/s'},
		{dataset : 0, code : 'vtm', description : 'Depth-Averaged Northward Water Velocity (m/s)', variableUnit : 'm/s'},
		{dataset : 0, code : 'wvd', description : 'Wave Direction (Degrees, Oceanographic Convention, 0=toward N, 90=toward E)', variableUnit : 'Degrees, Oceanographic Convention, 0=toward N, 90=toward E'},
		{dataset : 0, code : 'wvh', description : 'Significant Wave Height (meters)', variableUnit : 'm'},
		{dataset : 0, code : 'wvp', description : 'Wave Period (seconds)', variableUnit : 's'},
		{dataset : 1, code : 'air_u', description : 'Eastward Air Velocity (m/s)', variableUnit : 'm/s'},
		{dataset : 1, code : 'air_v', description : 'Northward Air Velocity (m/s)', variableUnit : 'm/s'},
		{dataset : 1, code : 'at', description : 'Air Temperature (Celsius)', variableUnit : 'C'},
		{dataset : 1, code : 'cl', description : 'Cloud Cover (fraction)', variableUnit : 'fraction'},
		{dataset : 1, code : 'depth', description : 'Bathymetry (meters)', variableUnit : 'm'},
		{dataset : 1, code : 'dp', description : 'Dew Point (Celsius)', variableUnit : 'C'}
	];

	var getInteger = function(str) {
		return str.split('.')[0];
	};

	var collection = BaseDatasetCollection.extend({

		initialize : function(attributes, options) {
			BaseDatasetCollection.prototype.initialize.apply(this, arguments);
			this.lake = ((options) && options.lake) ? options.lake : '';
		},

		setLake : function(lake) {
			if (this.lake !== lake) {
				this.reset([]);
			}
			this.lake = lake;
		},

		getLake : function() {
			return this.lake;
		},

		/* Parse the xml document and returns a json object which can be used to create the collection.
		 * @param {Document} xml
		 * @returns {Array of Objects}
		 */
		parse : function(xml) {
			var result = [];
			var today = moment();
			var datasetName = 'GLCFS';

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
					var sigma = -1; // not using any 3D datasets currently
					var vectorOpts = ':::0'; // not doing any vector options currently
					siteVar.variableParameter = new VariableParameter({
						name : datasetName,
						siteNo : y + ':' + x,
						value : y + ':' + x + ':' + sigma + ':' + siteVar.dataset + ':' + siteVar.code + vectorOpts,
						colName : siteVar.description + ': [' + x + ',' + y + ']'
					});
					return siteVar;
				});

				result.push({
					lon : $utils.xmlFind($this, 'sb', 'X1').text(),
					lat : $utils.xmlFind($this, 'sb', 'X2').text(),
					elevation : null,
					elevationUnit : null,
					siteNo : y + ':' + x,
					name : y + ':' + x,
					datasetName : datasetName,
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