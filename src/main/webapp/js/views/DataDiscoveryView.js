define([
	'underscore',
	'views/BaseView',
	'hbs!hb_templates/dataDiscovery'
], function (_, BaseView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({
		template: hbTemplate,

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
