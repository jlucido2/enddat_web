/* jslint browser: true */

define([
	'views/BaseView',
	'views/NavView',
	'views/MapView',
	'hbs!hb_templates/dataDiscovery'
], function (BaseView, NavView, MapView, hbTemplate) {
	"use strict";

	var NAVVIEW_SELECTOR = '.workflow-nav';
	var MAPVIEW_SELECTOR = '.map-container-div';

	var view = BaseView.extend({
		template: hbTemplate,

		/*
		 * @constructs
		 * @param {Object} options
		 *		@prop {Jquery element} el
		 *		@prop {models/WorkflowStateModel} model
		 */
		initialize: function (options) {
			
			if (this.model.CHOOSE_DATA_STEP) {
				//load the site model based on the properties in this.model
				//how to get this.model to SiteModel to use it's attributes in the url?
				this.siteData = new SiteModel();
				//probably need to setup promise and check at some point later 
				this.siteData.fetch();
				//probably need to setup listen to changes to siteData model here?
			};
			
			BaseView.prototype.initialize.apply(this, arguments);

			this.navView = new NavView({
				el : this.$(NAVVIEW_SELECTOR),
				model : this.model,
				router : this.router
			});

			this.mapView = new MapView({
				el : this.$(MAPVIEW_SELECTOR),
				mapDivId : 'map-div',
				model : this.model
			});

		},

		render : function() {
			var step = this.model.get('step');

			BaseView.prototype.render.apply(this, arguments);
			this.navView.setElement(this.$(NAVVIEW_SELECTOR)).render();
			if ((this.model.PROJ_LOC_STEP === step) || (this.model.CHOOSE_DATA_STEP === step)) {
				this.mapView.setElement(this.$(MAPVIEW_SELECTOR)).render();
			}
			return this;
		},

		remove: function () {
			this.navView.remove();
			this.mapView.remove();
			BaseView.prototype.remove.apply(this, arguments);
			return this;
		}
	});

	return view;
});
