/* jslint browser: true */

define([
	'jquery',
	'backbone',
	'loglevel',
	'util/utils'
], function ($, Backbone, log, utils) {
	"use strict";

	var collection = Backbone.Collection.extend({

		url: 'stcodes?read_file=stat&format=rdb',

		fetch: function(data) {
			var self = this;
			return $.ajax({
				type : "GET",
				url : self.url,
				dataType: 'text',
				success: function(data) {
					var statCode;
					var statCodeCollection = [];
					var lines = data.split("\n");
					var columns = {
						stat_CD : null,
						stat_NM : null,
						stat_DS : null
					};

					utils.parseRDB(lines, columns, function(colVals) {
						statCode = {};
						statCode[colVals["stat_CD"]] = utils.toTitleCase(colVals["stat_NM"]);
						statCodeCollection.push(new Backbone.Model(statCode));
					});	
					self.set(statCodeCollection)
				},
				error : function(jqXHR, textStatus, error) {
					log.debug('Error in loading NWIS stat definitions: ' + textStatus);
				}
			});	
		}
	});

	return collection;	
});