define([
	'underscore',
	'handlebars',
	'views/BaseView',
	'text!hb_templates/dataDiscovery.hbs'
], function (_, Handlebars, BaseView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({
		template: Handlebars.compile(hbTemplate),

		/*
		 * @constructs
		 * @param {Object} options
		 */
		initialize: function (options) {

			BaseView.prototype.initialize.apply(this, arguments);
		},
		
		remove: function () {
			BaseView.prototype.remove.apply(this, arguments);
			return this;
		}
	});

	return view;
});
