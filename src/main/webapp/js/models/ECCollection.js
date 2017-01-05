/* jslint browser: true */

define([
	'loglevel',
	'underscore',
	'jquery',
	'moment',
	'backbone',
	'utils/VariableParameter',
	'utils/geoSpatialUtils',
	'models/BaseDatasetCollection',
	'models/BaseVariableCollection'
], function(log, _, $, moment, Backbone, VariableParameter, geoSpatialUtils, BaseDatasetCollection, BaseVariableCollection) {
	"use strict";

	// STATION_PROPS should match the columns found in ENDPOINT's csv
	var STATION_PROPS = ['id', 'name', 'latitude', 'longitude', 'prov', 'timezone'];
	var DATASET_NAME = 'EC';


	var collection = BaseDatasetCollection.extend({

		_getModelsInBoundingBox : function(boundingBox) {
			var endDate = moment();
			var startDateDaily = moment().subtract(31, 'days');
			var startDateHourly = moment().subtract(2, 'days');

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
					}),
					description: colName
				};
			};

			return _.chain(this.allSites)
				.filter(function(site) {
					return geoSpatialUtils.isInBoundingBox(site.latitude, site.longitude, boundingBox);
				})
				.map(function(site) {
					var variables = [
						getVariable(site, true, 'hourly:water', 'Hourly Water Level (m)'),
						getVariable(site, true, 'hourly:discharge', 'Hourly Discharge (cms)'),
						getVariable(site, false, 'daily:water', 'Daily Water Level (m)'),
						getVariable(site, false, 'daily:discharge', 'Daily Discharge (cms)')
					];
					return new Backbone.Model({
						siteId : site.id,
						name: site.name.replace(/"/g, ''),
						lat: site.latitude,
						lon: site.longitude,
						elevation: null,
						elevationUnit: null,
						datasetName: DATASET_NAME,
						prov: site.prov,
						variables: new BaseVariableCollection(variables)
					});
				})
				.value();
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
					url : 'ecan/doc/hydrometric_StationList.csv',
					success : function(response) {
						var rows = response.split('\n').slice(1);
						this.allSites = _.map(rows, function(row) {
							return _.object(STATION_PROPS, row.split(','));
						});

						this.reset(this._getModelsInBoundingBox(boundingBox));
						log.debug('There are ' + this.length + ' EC sites');
						deferred.resolve();
					},
					error : function(jqXHR) {
						log.error('Unable to connect to the EC site');
						this.reset();
						deferred.reject(jqXHR);
					},
					context : this
				});
			} else {
				this.reset(this._getModelsInBoundingBox(boundingBox));
				log.debug('There are ' + this.length + ' EC sites');
				deferred.resolve();
			}

			return deferred.promise();
		}
	});

	return collection;
});


