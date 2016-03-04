/* jslint browser: true */

define([        
	'jquery',
	'backbone',
	'util/utils',
	'util/geoSpatialUtils',
	'models/ParameterCodes',
	'models/StatisticCodes'
], function ($, Backbone, utils, geoSpatialUtils, ParameterCodes, StatisticCodes) {
	"use strict";

	DEFAULT_RADIUS : 5;

	var model = Backbone.Model.extend({});

	var collection = Backbone.Collection.extend({
		
		model: model,
		
		url: '',
		
		initialize: function(attributes, options) {
			var projectModel = options.projectModel;
			if(projectModel.attributes.radius === null) {
				projectModel.attributes.radius = DEFAULT_RADIUS
			}
			var bbox = geoSpatialUtils.getBoundingBox(
					projectModel.attributes.location.latitude, 
					projectModel.attributes.location.longitude, 
					projectModel.attributes.radius);
			this.url = 'waterService/?format=rdb&bBox=' +
				bbox.west.toFixed(6) + ',' +
				bbox.south.toFixed(6) + ',' +
				bbox.east.toFixed(6) + ',' +
				bbox.north.toFixed(6) + 
				'&outputDataTypeCd=iv,dv&hasDataTypeCd=iv,dv&siteType=OC,LK,ST,SP,AS,AT';
		},

		fetch: function() {
			var self = this;
			$.ajax({
				type: "GET",
				url: self.url,
				dataType: 'text',
				success: function(data){
					self.parse(data);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					//Do we have to clear the NWIS tab here? or is it done somewhere else?
					if (404 === jqXHR.status) {
						//No data, do nothing
					} else {
						//Couldn't get to NWIS Web
						$('#errorMessage').html("Error in loading NWIS data: " + textStatus); 
					}
				}
			});			
		},

		parse: function(data) {
			var sites = {};

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
			
			var lines = data.split("\n");
			utils.parseRDB(lines, importantColumns, function(colVals) {
				var site;
				//Add the info to the sites
				if (!sites.hasOwnProperty(colVals["site_no"])) {
					site = {};
					site.name = colVals["station_nm"];
					site.lat = colVals["dec_lat_va"];
					site.lon = colVals["dec_long_va"];
					site.parameters = [];
				} else {
					site = sites[colVals["site_no"]];
				}

				var name = "Unknown parameter " + colVals["parm_cd"] + " " + colVals["stat_cd"];
				if (ParameterCodes && StatisticCodes) {
					if (colVals["parm_cd"]) {
						name = ((ParameterCodes[colVals["parm_cd"]])?ParameterCodes[colVals["parm_cd"]]:"PCode " + colVals["parm_cd"]);
						name += ((colVals["loc_web_ds"])?" (" + colVals["loc_web_ds"] + ")":"");
					}
					if (colVals["stat_cd"]) {
						name += " Daily " + ((StatisticCodes[colVals["stat_cd"]])?StatisticCodes[colVals["stat_cd"]]:colVals["stat_cd"]);
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

				sites[colVals["site_no"]] = site;
			});
			return sites;
		}

	});

	return collection;	
});