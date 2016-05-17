/* jslint browser: true */

define([
	'backbone'
], function(Backbone) {
	"use strict";

	var model = Backbone.Model.extend({

		getColName : function() {
			var stat = this.get('statistic');
			if (stat === 'raw') {
				return '';
			}
			else {
				return stat + ': ' + this.get('timeSpan') + 'hr';
			}
		},

		getStatParameter : function() {
			var stat = this.get('statistic');
			if (stat === 'raw') {
				return '';
			}
			else {
				return stat + ':' + this.get('timeSpan');
			}
		}
	});

	return model;
});


