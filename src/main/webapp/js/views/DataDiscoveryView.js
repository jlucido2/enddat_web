/* jslint browser: true */

define([
	'views/BaseView',
	'views/NavView',
	'views/MapView',
	'views/LocationView',
	'models/SiteModel',
	'hbs!hb_templates/dataDiscovery'
], function (BaseView, NavView, MapView, LocationView, SiteModel, hbTemplate) {
	"use strict";

	var NAVVIEW_SELECTOR = '.workflow-nav';
	var LOCATION_SELECTOR = '.location-panel';
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
			
			if (this.model.attributes.step === this.model.CHOOSE_DATA_STEP) {
				//load the site model based on the properties in this.model
				this.siteData = new SiteModel({},{projectModel: this.model});

				//probably need to call function with this.mapView in done 
				this.siteData.fetch({
			        success: function () {
			            console.log("good");
			        },
			        error: function (siteData) {
			            console.log("bad");
			        	}
				});
				//probably need to setup listen to changes to siteData model here or in it's init?
			};
			
			BaseView.prototype.initialize.apply(this, arguments);

			this.navView = new NavView({
				el : this.$(NAVVIEW_SELECTOR),
				model : this.model,
				router : this.router
			});

			//put this in a separate function to be called with SiteModel if available?
			this.mapView = new MapView({
				el : this.$(MAPVIEW_SELECTOR),
				mapDivId : 'map-div',
				model : this.model
			});
			this.locationView  = new LocationView({
				el : this.$(LOCATION_SELECTOR),
				model : this.model
			});
		},

		render : function() {
			var step = this.model.get('step');

			BaseView.prototype.render.apply(this, arguments);
			this.navView.setElement(this.$(NAVVIEW_SELECTOR)).render();
			if ((this.model.PROJ_LOC_STEP === step) || (this.model.CHOOSE_DATA_STEP === step)) {
				this.locationView.setElement(this.$(LOCATION_SELECTOR)).render();
				this.mapView.setElement(this.$(MAPVIEW_SELECTOR)).render();
			}
			return this;
		},

		remove: function () {
			this.navView.remove();
			this.mapView.remove();
			this.locationView.remove();
			BaseView.prototype.remove.apply(this, arguments);
			return this;
		}
	});

	return view;
});
