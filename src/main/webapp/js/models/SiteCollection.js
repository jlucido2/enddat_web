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

	var config = module.config();
	var parameterCodesPath = config.parameterCodesPath;

	var model = BaseDatasetCollection.extend({

		url: '',

		initialize: function(models, options) {
			Backbone.Collection.prototype.initialize.apply(this, arguments);

			this.pCodePromise = this.getParameterCodes();
			this.sCodePromise = this.getStatisticCodes();
		},

		fetch: function(boundingBox) {
			this.url = 'waterService/?format=rdb&bBox=' +
				boundingBox.west.toFixed(6) + ',' +
				boundingBox.south.toFixed(6) + ',' +
				boundingBox.east.toFixed(6) + ',' +
				boundingBox.north.toFixed(6) +
				'&outputDataTypeCd=iv,dv&hasDataTypeCd=iv,dv&siteType=OC,LK,ST,SP,AS,AT';

			var self = this;
			var sitesDeferred = $.Deferred();
			$.when(this.pCodePromise, this.sCodePromise).done(function() {
				$.ajax({
					type: "GET",
					url: self.url,
					dataType: 'text',
					success: function(data, textStatus, jqXHR){
						var parsedSites = [];
						var siteData = {};
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

						parsedSites = rdbUtils.parseRDB(lines, importantColumns);

						/* The parsedSites array contains elements that correspond
						 * to rows from an rdb file, which represents one or more
						 * parameter codes available for a site.  So multiple rows
						 * may have the same site_no but different parm_cd.  These
						 * rows are being merged here into an object where key is the
						 * site_no and the value is an object with all of the data
						 * for the site, including an array of one or more parameters.
						 */
						_.each(parsedSites, function(el, index) {
							var site;

							// Grab the currently collected data for el.site_no if it exists, otherwise, initialize a site data object
							if (_.has(siteData, (el.site_no))) {
								site = siteData[el.site_no];
							}
							else {
								site = {
									name : el.station_nm,
									lat : el.dec_lat_va,
									lon : el.dec_long_va,
									parameters : []
								};
							}

							// Create the name for the parameter and then push the parameter data onto the site data
							var name = "Unknown parameter " + el.parm_cd + " " + el.stat_cd;
							if (self.parameterCodes && self.statisticCodes) {
								if (el.parm_cd) {
									var pName = self.parameterCodes[el.parm_cd];
									name = (pName?pName:"PCode " + el.parm_cd);
									name += ((el.loc_web_ds) ?" (" + el.loc_web_ds + ")" : "");
								}
								if (el.stat_cd) {
									var sName = self.statisticCodes[el.stat_cd];
									name += " Daily " + (sName ? sName : el.stat_cd);
								} else {
									name += " Instantaneous";
									el.stat_cd = "00000";
								}
							}

							site.parameters.push({
								name : name,
								parameterCd : el.parm_cd,
								statCd : el.stat_cd,
								startDate : el.begin_date,
								endDate : el.end_date,
								count : el.count_nu
							});

							siteData[el.site_no] = site;

						});

						self.reset(_.map(siteData, function(data, siteNo) {
							var result = _.clone(data);
							result.siteNo = siteNo;
							return result;
						}));

						log.debug('Fetched sites ' + _.size(siteData));
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

	return model;
});