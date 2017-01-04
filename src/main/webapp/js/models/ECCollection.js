/* jslint browser: true */

define([
	'loglevel',
	'module',
	'underscore',
	'jquery',
	'moment',
	'backbone',
	'Config',
	'utils/VariableParameter',
	'utils/geoSpatialUtils',
	'models/BaseDatasetCollection',
	'models/BaseVariableCollection'
], function(log, module, _, $, moment, Backbone, Config, VariableParameter, geoSpatialUtils, BaseDatasetCollection, BaseVariableCollection) {
	"use strict";

	var ENDPOINT = 'http://dd.weather.gc.ca/hycrometric/doc/hydrometric_StationList.csv';
	// STATION_PROPS should match the columns found in ENDPOINT's csv
	var STATION_PROPS = ['id', 'name', 'latitude', 'longitude', 'prov', 'timezone'];
	var DATASET_NAME = 'EC';


	var collection = BaseDatasetCollection.extend({

		_getModelsInBoundingBox : function(boundingBox) {
			var endDate = moment();
			var startDateDaily = endDate.subtract(30, 'days');
			var startDateHourly = endDate.subtract(2, 'days');

			/*
			 * @param {Object} site
			 * @param {Boolean} isHourly - True if hourly variable, otherwise Daily
			 * @param {String} varValue - string which identifies the variable
			 * @param {String} colName - string which will be concated with the site.id to form colName
			 */
			var getVariable = function(site, isHourly, varValue, colName) {
				return {
					startDate: isHourly ? startDateHourly: startDateDaily,
					endDate : endDate,
					variableParameter : new VariableParameter({
						name: DATASET_NAME,
						value: site.id + ':' + site.prov + ':' + varValue,
						colName: colName + ':' + site.id
					})
				};
			};


			return _.chain(this.allSites)
				.find(function(site) {
					return geoSpatialUtils.isInBoundingBox(site.latitude, site.longitude, boundingBox);
				})
				.map(function(site) {
					var variables = [
						getVariable(site, true, 'hourly_water_level', 'Hourly Water Level (m)'),
						getVariable(site, true, 'hourly_discharge', 'Hourly Discharge (cms)'),
						getVariable(site, false, 'daily_water_level', 'Daily Water Level (m)'),
						getVaraibel(site, false, 'daily_discharge', 'Daily Discharge (cms)')
					];
					return new Backbone.Model({
						siteId : site.id,
						name: site.name,
						lat: site.latitude,
						lon: site.longitude,
						elevation: null,
						elevationUnit: null,
						datasetName: DATASET_NAME,
						prov: site.prov,
						variables: new BaseVariableCollection(variables)
					});
				});
		},

		/*
		 * @param {Object with properties west, east, south, north} boundingBox
		 * @returns {Jquery promise}
		 *		@resolved when the EC sites have been fetched and filtered by bounding box
		 *			and the collection reset with the new data.
		 *		@rejected with the jqXHR object if the fetch failed. The collection is cleared.
		 */
		fetch : function(boundingBox) {
			var deferred = $.Deferred();

			if (!_.has(this, 'allSites')) {
				$.ajax({
					url : ENDPOINT,
					success : function(response) {
						var rows = response.split('\n').splice(0,1);
						this.allSites = _.map(rows, function(row) {
							return _.object(STATION_PROPS, row.split(','));
						});

						this.reset(getModelsInBoundingBox(boundingBox));
						deferred.resolve();
					},
					error : function(jqXHR) {
						this.reset();
						deferred.reject(jqXHR);
					}
				});
			} else {
				this.reset(getModelsInBoundingBox(boundingBox));
				deferred.resolve();
			}

			return deferred.promise();
		}
	});

	return collection;
});


