/* jslint browser: true */

define([        
	'jquery',
	'backbone',
	'utils/utils',
	'models/ParameterCodes',
	'models/StatisticCodes'
], function ($, Backbone, utils, ParameterCodes, StatisticCodes) {
	"use strict";

	var model = Backbone.Model.extend({});

	var collection = Backbone.Collection.extend({
		
		model: model,
		
		url: 'waterService/?format=rdb&bBox=' +
		//still need to bring over code to get these values from passed in lat, lon, rad
		-105.213267 + ',' +
		39.646356 + ',' +
		-105.025118 + ',' +
		39.791079 + 
		'&outputDataTypeCd=iv,dv&hasDataTypeCd=iv,dv&siteType=OC,LK,ST,SP,AS,AT',
		
		initialize: function(attributes, options) {
			this.projectModel = options.projectModel;
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