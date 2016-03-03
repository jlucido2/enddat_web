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
		url: 'stcodes?read_file=stat&format=rdb',
		
		//still not sure if there should be an init with fetch() or do fetch in router?
		initialize: function() {
			this.fetch();
		},

		parse: function(data) {
			//maybe put this in as a default?
			var NWIS_STAT_CODE_DEFINITIONS = {};

			var lines = data.split("\n");
			var columns = {
				stat_CD : null,
				stat_NM : null,
				stat_DS : null
			};

			parseRDB(lines, columns, function(colVals) {
				NWIS_STAT_CODE_DEFINITIONS[colVals["stat_CD"]] = toTitleCase(colVals["stat_NM"]);
			});
			
			return this.NWIS_PARAMETER_CODE_DEFINITIONS;
		}

	});

	return new model;	
});