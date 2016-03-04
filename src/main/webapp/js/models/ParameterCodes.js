/* jslint browser: true */

define([
	'jquery',
	'backbone',
	'util/utils'
], function ($, Backbone, utils) {
	"use strict";

	var model = Backbone.Model.extend({});
	
	var collection = Backbone.Collection.extend({
		model: model,

		url: 'pmcodes?radio_pm_search=param_group&pm_group=Physical&format=rdb&show=parameter_nm',
		
		fetch: function() {
			var self = this;
			$.ajax({
				type : "GET",
				url : self.url,
				dataType: 'text',
				success: function(data) {
					self.parse(data);
				},
				error : function(jqXHR, textStatus, error) {
					$('#errorMessage').html("Error in loading NWIS Parameter definitions: " + textStatus); 
				}
			});
		},

		parse: function(data) {
			var NWIS_PARAMETER_CODE_DEFINITIONS = {};

			var lines = data.split("\n");
			var columns = {
				"parameter_cd" : null,
				"parameter_nm" : null
			};

			utils.parseRDB(lines, columns, function(colVals) {
				NWIS_PARAMETER_CODE_DEFINITIONS[colVals["parameter_cd"]] = colVals["parameter_nm"];
			});
			
			return NWIS_PARAMETER_CODE_DEFINITIONS;
		}

	});

	return collection;	
});