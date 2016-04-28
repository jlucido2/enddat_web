/* jslint browser: true */

define([
	'jquery',
	'underscore',
	'moment',
	'loglevel',
	'module',
	'models/BaseDatasetCollection',
	'utils/rdbUtils',
	'utils/dateUtils'
], function ($, _, moment, log, module, BaseDatasetCollection, rdbUtils, dateUtils) {
	"use strict";

	var parameterCodesPath = module.config().parameterCodesPath;

	var DATE_FORMAT = 'YYYY-MM-DD';

	var collection = BaseDatasetCollection.extend({

		url: '',

		initialize: function(models, options) {
			BaseDatasetCollection.prototype.initialize.apply(this, arguments);

			this.pCodePromise = this.getParameterCodes();
			this.sCodePromise = this.getStatisticCodes();
		},

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
						var lines = data.split("\n");
						var importantColumns = {
							"site_no" : null,
							"station_nm" : null,
							"dec_lat_va" : null,
							"dec_long_va" : null,
							"parm_cd" : null,
							"stat_cd" : null,
							"loc_web_ds" : null,
							"begin_date" : null,
							"end_date" : null,
							"count_nu" : null
						};
						var parsedSites = rdbUtils.parseRDB(lines, importantColumns);
						// Group the parse site information by site id
						var siteDataBySiteNo = _.groupBy(parsedSites, function(site) {
							return site.site_no;
						});

						var getParameterArrayForSite = function(parametersForSite) {
							var getParameter = function(parameter) {
								var name = '';
								var pName, sName;
								var statCd = parameter.stat_cd;
								if ((self.parameterCodes) && (parameter.parm_cd)) {
									var pName = self.parameterCodes[parameter.parm_cd];
									name = (pName ? pName : "PCode " + parameter.parm_cd);
									name += ((parameter.loc_web_ds) ?" (" + parameter.loc_web_ds + ")" : "");
								}
								else {
									name = 'Unknown parameter ' + parameter.parm_cd;
								}
								if (self.statisticCodes) {
									if (statCd) {
										var sName = self.statisticCodes[statCd];
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
									name : name,
									parameterCd : parameter.parm_cd,
									statCd : statCd,
									startDate : moment(parameter.begin_date, DATE_FORMAT),
									endDate : moment(parameter.end_date, DATE_FORMAT),
									count : parameter.count_nu
								};
							};
							return _.map(parametersForSite, getParameter);
						};

						var sites = _.map(siteDataBySiteNo, function(siteParameterData) {
							var parameters = getParameterArrayForSite(siteParameterData)

							var startDates = _.pluck(parameters, 'startDate');
							var endDates = _.pluck(parameters, 'endDate');

							var result= {
								siteNo : siteParameterData[0].site_no,
								name : siteParameterData[0].station_nm,
								lat : siteParameterData[0].dec_lat_va,
								lon : siteParameterData[0].dec_long_va,
								startDate : moment.min(startDates),
								endDate : moment.max(endDates),
								parameters : parameters
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
							sitesDeferred.resolve();
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
				url : parameterCodesPath + 'pmcodes?radio_pm_search=param_group&pm_group=Physical&format=rdb&show=parameter_nm',
				dataType: 'text',
				success: function(data) {
					var parsedParams = [];
					var lines = data.split("\n");
					var columns = {
						"parameter_cd" : null,
						"parameter_nm" : null
					};

					self.parameterCodes = {};
					parsedParams = rdbUtils.parseRDB(lines, columns);
					_.each(parsedParams, function(el, index) {
						self.parameterCodes[el.parameter_cd] = el.parameter_nm;
					});
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
				url : 'stcodes?read_file=stat&format=rdb',
				dataType: 'text',
				success: function(data) {
					var parsedStats = [];
					var lines = data.split("\n");
					var columns = {
						stat_CD : null,
						stat_NM : null,
						stat_DS : null
					};

					self.statisticCodes = {};
					parsedStats = rdbUtils.parseRDB(lines, columns);
					_.each(parsedStats, function(el) {
						self.statisticCodes[el.stat_CD] = rdbUtils.toTitleCase(el.stat_NM);
					});
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