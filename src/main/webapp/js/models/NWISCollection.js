/* jslint browser: true */

define([
	'jquery',
	'underscore',
	'moment',
	'loglevel',
	'module',
	'utils/VariableParameter',
	'utils/rdbUtils',
	'utils/stringUtils',
	'models/BaseDatasetCollection',
	'models/BaseVariableCollection'
], function ($, _, moment, log, module, VariableParameter, rdbUtils, stringUtils, BaseDatasetCollection, BaseVariableCollection) {
	"use strict";

	var DATE_FORMAT = 'YYYY-MM-DD';

	var collection = BaseDatasetCollection.extend({

		url: '',

		initialize: function(models, options) {
			BaseDatasetCollection.prototype.initialize.apply(this, arguments);

			this.pCodePromise = this.getParameterCodes();
			this.sCodePromise = this.getStatisticCodes();
		},

		/*
		 * @param {Object with properties west, east, south, north} boundingBox
		 * @returns {Jquery promise}
		 *		@resolved with the JqXHR object when the NWIS sites for boundingBox have been fetched, parsed
		 *			and the collection reset with the new data.
		 *		@rejected with the jqXHR object if the fetch failed. The collection is cleared.
		 */
		fetch: function(boundingBox) {
			var self = this;
			var sitesDeferred = $.Deferred();

			this.url = 'waterService/?format=rdb&bBox=' +
				boundingBox.west.toFixed(6) + ',' +
				boundingBox.south.toFixed(6) + ',' +
				boundingBox.east.toFixed(6) + ',' +
				boundingBox.north.toFixed(6) +
				'&outputDataTypeCd=iv,dv&hasDataTypeCd=iv,dv&siteType=OC,LK,ST,SP,AS,AT';

			$.when(this.pCodePromise, this.sCodePromise).done(function() {
				$.ajax({
					type: "GET",
					url: self.url,
					dataType: 'text',
					success: function(data, textStatus, jqXHR){
						var parsedSites = rdbUtils.parseRDB(data);
						// Group the parse site information by site id
						var siteDataBySiteNo = _.groupBy(parsedSites, function(site) {
							return site.site_no;
						});
						var datasetName = 'NWIS';
						
						var parseVariables = function(rawVariables) {
							var parseVariable = function(variable) {
								var name = '';
								var siteNumber = variable.site_no;
								var pName, sName;
								var statCd = variable.stat_cd;
								var pUnits = '';
								var variableCode = undefined;
								if ((self.parameterCodes) && (variable.parm_cd)) {
									variableCode = self.parameterCodes[variable.parm_cd];
									if (variableCode) {
										pName = self.parameterCodes[variable.parm_cd].parameter_nm;
										pUnits = self.parameterCodes[variable.parm_cd].parameter_units;
									}
									else {
										pName = undefined;
										pUnits = undefined;
									}
									name = (pName ? pName : "PCode " + variable.parm_cd);
									name += ((variable.loc_web_ds) ?" (" + variable.loc_web_ds + ")" : "");
								}
								else {
									name = 'Unknown parameter ' + variable.parm_cd;
									pUnits = 'Unknown units';
								}
								if (self.statisticCodes) {
									if (statCd) {
										sName = self.statisticCodes[statCd];
										name += " Daily " + (sName ? sName : statCd);
									}
									else {
										name += " Instantaneous";
										statCd = "00000";
									}
								}
								else {
									name += ' ' + statCd;
								}
								return {
									datasetName : datasetName,
									name : name,
									parameterCd : variable.parm_cd,
									statCd : statCd,
									startDate : moment(variable.begin_date, DATE_FORMAT),
									endDate : moment(variable.end_date, DATE_FORMAT),
									count : variable.count_nu,
									variableUnit : pUnits,
									variableParameter : new VariableParameter({
										name : datasetName,
										siteNo: variable.site_no,
										value : variable.site_no + ':' + variable.parm_cd + ':' +  statCd,
										colName : name + ':' + variable.site_no
									})
								};
							};
							return _.map(rawVariables, parseVariable);
						};

						var sites = _.map(siteDataBySiteNo, function(siteParameterData) {
							var variables = parseVariables(siteParameterData);

							var result= {
								datasetName : datasetName,
								siteNo : siteParameterData[0].site_no,
								name : siteParameterData[0].station_nm,
								lat : siteParameterData[0].dec_lat_va,
								lon : siteParameterData[0].dec_long_va,
								elevation : siteParameterData[0].alt_va,
								elevationUnit : 'ft',
								variables : new BaseVariableCollection(variables)
							};
							return result;
						});

						self.reset(sites);

						log.debug('Fetched sites ' + self.length);
						sitesDeferred.resolve(jqXHR);
					},
					error: function(jqXHR, textStatus, errorThrown) {
						if (404 === jqXHR.status) {
							log.debug('No NWIS data available: ' + textStatus);
							self.reset([]);
							sitesDeferred.resolve(jqXHR);
						} else {
							log.debug('Error in loading NWIS data: ' + textStatus);
							self.reset([]);
							sitesDeferred.reject(jqXHR);
						}
					}
				});
			});
			return sitesDeferred.promise();
		},

		/*
		 * Retrieves the parameter codes and set the parameterCodes property on the collection. If
		 * the fetch fails the parameterCodes property is assigned undefined.
		 * @returns promise which is resolved when the fetch finishes, regardless of whether it was successful or not.
		 */
		getParameterCodes : function() {
			var self = this;
			var deferred = $.Deferred();
			$.ajax({
				type : "GET",
				url : 'pmcodes/?radio_pm_search=param_group&pm_group=Physical&format=rdb&show=parameter_nm&show=parameter_units', // output is a bit cleaner than show=parameter_nm,parameter_units
				dataType: 'text',
				success: function(data) {
					var parsedParams = rdbUtils.parseRDB(data);
					self.parameterCodes = _.object(_.pluck(parsedParams, 'parameter_cd'), _.map(parsedParams, function(parsedParam) {
						return { 'parameter_nm' : parsedParam.parameter_nm, 'parameter_units' : parsedParam.parameter_units };
					})
					);
					log.debug('Fetched parameter codes ' + _.size(self.parameterCodes));
					deferred.resolve();
				},
				error : function(jqXHR, textStatus, error) {
					log.debug('Error in loading NWIS Parameter definitions: ' + textStatus);
					self.parameterCodes = undefined;
					deferred.resolve();
				}
			});
			return deferred.promise();
		},

		/*
		 * Retrieves the statistic codes and set the statisticCodes property on the collection. If
		 * the fetch fails the statisticsCodes property is assigned undefined.
		 * @returns promise which is resolved when the fetch finishes, regardless of whether it was successful or not.
		 */
		getStatisticCodes : function() {
			var self = this;
			var deferred = $.Deferred();
			$.ajax({
				type : "GET",
				url : 'stcodes/?fmt=rdb',
				dataType: 'text',
				success: function(data) {
					var parsedStats = rdbUtils.parseRDB(data);

					self.statisticCodes = _.object(
						_.pluck(parsedStats, 'stat_CD'),
						_.map(_.pluck(parsedStats, 'stat_NM'), stringUtils.toTitleCase)
					);
					log.debug('Fetched statistic codes ' + _.size(self.statisticCodes));
					deferred.resolve();
				},
				error : function(jqXHR, textStatus, error) {
					self.statisticCodes = undefined;
					log.debug('Error in loading NWIS stat definitions: ' + textStatus);
					deferred.resolve();
				}
			});
			return deferred.promise();
		}

	});

	return collection;
});