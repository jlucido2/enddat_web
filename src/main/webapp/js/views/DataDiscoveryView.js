define([
	'underscore',
	'views/BaseView',
	'views/NavView',
	'hbs!hb_templates/dataDiscovery'
], function (_, BaseView, NavView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({
		template: hbTemplate,

		/*
		 * @constructs
		 * @param {Object} options
		 *		@prop {Jquery element} el
		 */
		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.navView = new NavView({
				el : this.$('.workflow-nav')
			});
		},

		render : function() {
			BaseView.prototype.render.apply(this, arguments);
			this.navView.setElement(this.$('.workflow-nav')).render();
		},

		remove: function () {
			this.navView.remove();
			BaseView.prototype.remove.apply(this, arguments);
			return this;
		}
	});

	return view;
});
