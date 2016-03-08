/* jslint browser: true */

define([
	'jquery',
	'backbone',
	'loglevel',
	'util/utils'
], function ($, Backbone, log, utils) {
	"use strict";

	var collection = Backbone.Collection.extend({

		url: 'pmcodes?radio_pm_search=param_group&pm_group=Physical&format=rdb&show=parameter_nm',
	
		fetch: function() {
			var self = this;
			return $.ajax({
				type : "GET",
				url : self.url,
				dataType: 'text',
				success: function(data) {
					var paramCode;
					var paramCodeCollection = [];
					var lines = data.split("\n");
					var columns = {
						"parameter_cd" : null,
						"parameter_nm" : null
					};

					utils.parseRDB(lines, columns, function(colVals) {
						paramCode = {};
						paramCode[colVals["parameter_cd"]] = colVals["parameter_nm"];
						paramCodeCollection.push(new Backbone.Model(paramCode));
					});				
					self.set(paramCodeCollection)
				},
				error : function(jqXHR, textStatus, error) {
					log.debug('Error in loading NWIS Parameter definitions: ' + textStatus);
				}
			});
		}
	});

	return collection;	
});