/* jslint browser: true */

define([
	'jquery',
	'backbone',
	'util/utils'
], function ($, Backbone, utils) {
	"use strict";

	var collection = Backbone.Collection.extend({

		url: 'pmcodes?radio_pm_search=param_group&pm_group=Physical&format=rdb&show=parameter_nm',
	
		fetch: function() {
			var self = this;
			$.ajax({
				type : "GET",
				url : self.url,
				dataType: 'text',
				success: function(data) {
					var arrayOfModels = [{'00001':'parm1'},{'00002':'parm2'},{'00004':'parm3'}];
					self.set(arrayOfModels);
				},
				error : function(jqXHR, textStatus, error) {
					$('#errorMessage').html("Error in loading NWIS Parameter definitions: " + textStatus); 
				}
			});
		},

	});

	return collection;	
});