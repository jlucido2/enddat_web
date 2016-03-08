/* jslint browser: true */

define([        
	'jquery',
	'backbone',
	'loglevel',
	'util/utils',
	'util/geoSpatialUtils'
], function ($, Backbone, log, utils, geoSpatialUtils) {
	"use strict";

	var collection = Backbone.Collection.extend({

		url: '',
		
		initialize: function(attributes, options) {
			var workflowModel = options.workflowModel;
			var bbox = geoSpatialUtils.getBoundingBox(
					workflowModel.attributes.location.latitude, 
					workflowModel.attributes.location.longitude, 
					workflowModel.attributes.radius);
			this.url = 'waterService/?format=rdb&bBox=' +
				bbox.west.toFixed(6) + ',' +
				bbox.south.toFixed(6) + ',' +
				bbox.east.toFixed(6) + ',' +
				bbox.north.toFixed(6) + 
				'&outputDataTypeCd=iv,dv&hasDataTypeCd=iv,dv&siteType=OC,LK,ST,SP,AS,AT';
		},

		fetch: function(options) {
			var self = this;
			return $.ajax({
				type: "GET",
				url: self.url,
				dataType: 'text',
				success: function(data){
					var site;
					var siteElement;
					var lastSite = null;
					var siteCollection = [];
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
					
					utils.parseRDB(lines, importantColumns, function(colVals) {
						/* 
						 * There can be multiple lines with same site_no but
						 * different parameter codes.  This function will be
						 * invoked for each line and a site model is created
						 * for each unique site_no, aggregating parameter codes.
						 */
						//first line
						if(null == lastSite) {
							siteElement = {};
							lastSite = colVals["site_no"];
						}
						//after first line when new site_no, push last site model onto collection
						else if(colVals["site_no"] != lastSite) {
							siteCollection.push(new Backbone.Model(siteElement));							
							siteElement = {};	
							lastSite = colVals["site_no"];
						}
						//first time with new site_no
						if (!_.has(siteElement, (colVals["site_no"]))) {
							site = {};
							site.name = colVals["station_nm"];
							site.lat = colVals["dec_lat_va"];
							site.lon = colVals["dec_long_va"];
							site.parameters = [];
						//another line with same site_no
						} else {
							site = siteElement[colVals["site_no"]];
						}

						var name = "Unknown parameter " + colVals["parm_cd"] + " " + colVals["stat_cd"];
						if (options.parameterCodes && options.statisticCodes) {
							if (colVals["parm_cd"]) {
								var pCode = options.parameterCodes.find(function(model) {
									return model.get(colVals["parm_cd"]);
								});
								var pName = pCode.get(colVals["parm_cd"]);
								name = (pName?pName:"PCode " + colVals["parm_cd"]);
								name += ((colVals["loc_web_ds"])?" (" + colVals["loc_web_ds"] + ")":"");
							}
							if (colVals["stat_cd"]) {
								var sCode = options.statisticCodes.find(function(model) {
									return model.get(colVals["stat_cd"]);
								});
								var sName = sCode.get(colVals["stat_cd"]);
								name += " Daily " + (sName?sName:colVals["stat_cd"]);
							} else {
								name += " Instantaneous";
								colVals["stat_cd"] = "00000";
							}
						}

						site.parameters.push({
							name : name,
							parameterCd : colVals["parm_cd"],
							statCd : colVals["stat_cd"],
							startDate : colVals["begin_date"],
							endDate : colVals["end_date"],
							count : colVals["count_nu"]
						});

						siteElement[colVals["site_no"]] = site;
						
					});
					//add last unique site_no model to collection
					siteCollection.push(new Backbone.Model(siteElement));							
					self.set(siteCollection)
				},
				error: function(jqXHR, textStatus, errorThrown) {
					if (404 === jqXHR.status) {
						log.debug('NWIS data available: ' + textStatus);
					} else {
						log.debug('Error in loading NWIS data: ' + textStatus);
					}
				}
			});			
		}

	});

	return collection;
});