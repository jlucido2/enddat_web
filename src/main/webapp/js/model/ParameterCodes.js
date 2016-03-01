define([
    	'backbone',
    	'underscore',  //check if this needed since backbone is here
    	'utils/ParseRDB'
    ], function (Backbone, _, ParseRDB) {
	"use strict";
	var NWIS_PARAMETER_CODE_DEFINITIONS = undefined;

	var ParameterCodes = Backbone.Model.extend({
		url: ENDDAT.PROXY_URL + 'pmcodes?radio_pm_search=param_group&pm_group=Physical&format=rdb&show=parameter_nm',

		parse: function(data) {
			NWIS_PARAMETER_CODE_DEFINITIONS = {};

			var lines = data.split("\n");
			var columns = {
				"parameter_cd" : null,
				"parameter_nm" : null
			};

			parseRDB(lines, columns, function(colVals) {
				NWIS_PARAMETER_CODE_DEFINITIONS[colVals["parameter_cd"]] = colVals["parameter_nm"];
			});
			
			return NWIS_PARAMETER_CODE_DEFINITIONS;
		}

	});

});