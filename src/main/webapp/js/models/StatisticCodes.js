/* jslint browser: true */

define([
	'jquery',
	'backbone',
	'utils/utils'
], function ($, Backbone, utils) {
	"use strict";

	var model = Backbone.Model.extend({});
	
	var collection = Backbone.Collection.extend({
		model: model,

		url: 'stcodes?read_file=stat&format=rdb',

		fetch: function(data) {
			var self = this;
			$.ajax({
				type : "GET",
				url : self.url,
				dataType: 'text',
				success: function(data) {
					self.parse(data);
				},
				error : function(jqXHR, textStatus, error) {
					$('#errorMessage').html("Error in loading NWIS stat definitions: " + textStatus); 
				}
			});
			
		},

		parse: function(data) {
			var NWIS_STAT_CODE_DEFINITIONS = {};

			var lines = data.split("\n");
			var columns = {
				stat_CD : null,
				stat_NM : null,
				stat_DS : null
			};

			utils.parseRDB(lines, columns, function(colVals) {
				NWIS_STAT_CODE_DEFINITIONS[colVals["stat_CD"]] = utils.toTitleCase(colVals["stat_NM"]);
			});
			
			return NWIS_STAT_CODE_DEFINITIONS;
		}

	});

	return collection;	
});