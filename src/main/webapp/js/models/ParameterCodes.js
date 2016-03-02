/* jslint browser: true */

define([
	'jquery',
	'backbone',
	'utils/ParseRDB',
	'module'
], function ($, Backbone, ParseRDB, module) {
	"use strict";
	
	//should this be a collection rather than a model?
	var model = Backbone.Model.extend({
		url: config().proxyUrl + 'pmcodes?radio_pm_search=param_group&pm_group=Physical&format=rdb&show=parameter_nm',
		
		//still not sure if there should be an init with fetch() or do fetch in router?
		initialize: function() {
			this.fetch();
		},

		parse: function(data) {
			var NWIS_PARAMETER_CODE_DEFINITIONS = {};

			var lines = data.split("\n");
			var columns = {
				"parameter_cd" : null,
				"parameter_nm" : null
			};

			parseRDB(lines, columns, function(colVals) {
				NWIS_PARAMETER_CODE_DEFINITIONS[colVals["parameter_cd"]] = colVals["parameter_nm"];
			});
			
			return this.NWIS_PARAMETER_CODE_DEFINITIONS;
		}

	});

	return new model;	
});