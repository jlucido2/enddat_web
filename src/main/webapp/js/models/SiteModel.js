/* jslint browser: true */

define([        
	'jquery',
	'backbone',
	'loglevel',
	'module',
	'utils/rdbUtils',
	'utils/geoSpatialUtils'
], function ($, Backbone, log, module, rdbUtils, geoSpatialUtils) {
	"use strict";

	var model = Backbone.Model.extend({

		url: '',
		
		initialize: function() {
			this.pCodePromise = this.getParameterCodes();
			this.sCodePromise = this.getStatisticCodes();			
		},

		fetch: function(location, radius) {
			var bbox = geoSpatialUtils.getBoundingBox(
					location.latitude,
					location.longitude,
					radius);
			this.url = 'waterService/?format=rdb&bBox=' +
				bbox.west.toFixed(6) + ',' +
				bbox.south.toFixed(6) + ',' +
				bbox.east.toFixed(6) + ',' +
				bbox.north.toFixed(6) +
				'&outputDataTypeCd=iv,dv&hasDataTypeCd=iv,dv&siteType=OC,LK,ST,SP,AS,AT';

			var self = this;
			var sitesDeferred = $.Deferred();
			$.when(this.pCodePromise, this.sCodePromise).done(function() {
				$.ajax({
					type: "GET",
					url: self.url,
					dataType: 'text',
					success: function(data){
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
						_.each(parsedSites, function(el, index) {
							var site;
							//Add the info to the sites
							if (!_.has(siteData, (el["site_no"]))) {
								site = {};
								site.name = el["station_nm"];
								site.lat = el["dec_lat_va"];
								site.lon = el["dec_long_va"];
								site.parameters = [];
							} else {
								site = siteData[el["site_no"]];
							}

							var name = "Unknown parameter " + el["parm_cd"] + " " + el["stat_cd"];
							if (self.has("parameterCodes") && self.has("statisticCodes")) {
								if (el["parm_cd"]) {
									var pName = self.get("parameterCodes")[el["parm_cd"]];
									name = (pName?pName:"PCode " + el["parm_cd"]);
									name += ((el["loc_web_ds"])?" (" + el["loc_web_ds"] + ")":"");
								}
								if (el["stat_cd"]) {
									var sName = self.get("statisticCodes")[el["stat_cd"]];
									name += " Daily " + (sName?sName:el["stat_cd"]);
								} else {
									name += " Instantaneous";
									el["stat_cd"] = "00000";
								}
							}

							site.parameters.push({
								name : name,
								parameterCd : el["parm_cd"],
								statCd : el["stat_cd"],
								startDate : el["begin_date"],
								endDate : el["end_date"],
								count : el["count_nu"]
							});

							siteData[el["site_no"]] = site;

						});
						
						self.set({sites: siteData});
						log.debug('Fetched sites ' + _.size(siteData));
						sitesDeferred.resolve();
						self.trigger('sync', self);
					},
					error: function(jqXHR, textStatus, errorThrown) {
						if (404 === jqXHR.status) {
							log.debug('No NWIS data available: ' + textStatus);
							sitesDeferred.resolve();
						} else {
							log.debug('Error in loading NWIS data: ' + textStatus);
							sitesDeferred.reject();
						}
					}
				});			
			});
			return sitesDeferred.promise();
		},

		getParameterCodes : function() {
			var self = this;
			return $.ajax({
				type : "GET",
				url : 'pmcodes?radio_pm_search=param_group&pm_group=Physical&format=rdb&show=parameter_nm',
				dataType: 'text',
				success: function(data) {
					var parsedParams = [];
					var paramCodes = {};
					var lines = data.split("\n");
					var columns = {
						"parameter_cd" : null,
						"parameter_nm" : null
					};

					parsedParams = rdbUtils.parseRDB(lines, columns);
					_.each(parsedParams, function(el, index) {
						paramCodes[el["parameter_cd"]] = el["parameter_nm"];
					});
					self.set({parameterCodes: paramCodes});
					log.debug('Fetched parameter codes ' + _.size(paramCodes));
				},
				error : function(jqXHR, textStatus, error) {
					log.debug('Error in loading NWIS Parameter definitions: ' + textStatus);
				}			
			});
		},

		getStatisticCodes : function() {
			var self = this;
			return $.ajax({
				type : "GET",
				url : 'stcodes?read_file=stat&format=rdb',
				dataType: 'text',
				success: function(data) {
					var parsedStats = [];
					var statCodes = {};
					var lines = data.split("\n");
					var columns = {
						stat_CD : null,
						stat_NM : null,
						stat_DS : null
					};

					parsedStats = rdbUtils.parseRDB(lines, columns);
					_.each(parsedStats, function(el, index) {
						statCodes[el["stat_CD"]] = el["stat_NM"];
					});
					self.set({statisticCodes: statCodes});
					log.debug('Fetched statistic codes ' + _.size(statCodes));
				},
				error : function(jqXHR, textStatus, error) {
					log.debug('Error in loading NWIS stat definitions: ' + textStatus);
				}
			});				
		}

	});

	return model;
});