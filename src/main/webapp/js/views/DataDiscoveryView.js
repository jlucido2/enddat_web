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
	var DATATYPE_NWIS = 'NWIS';

	var view = BaseView.extend({
		template: hbTemplate,

		/*
		 * @constructs
		 * @param {Object} options
		 *		@prop {Jquery element} el
		 *		@prop {models/WorkflowStateModel} model
		 */
		initialize: function (options) {
			this.siteModel = new SiteModel();
			this.updateSiteModel();

			this.listenTo(this.model, 'change:location', this.updateSiteModel);
			this.listenTo(this.model, 'change:radius', this.updateSiteModel);			

			BaseView.prototype.initialize.apply(this, arguments);

			this.navView = new NavView({
				el : this.$(NAVVIEW_SELECTOR),
				model : this.model,
				router : this.router
			});

			this.mapView = new MapView({
				el : this.$(MAPVIEW_SELECTOR),
				mapDivId : 'map-div',
				model : this.model,
				sites : this.siteModel
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
		},

		/* 
		 * Check to see if the WorkflowStateModel contains the parameters needed
		 * to fetch data for the project.  Currently only checking
		 * for the NWIS data type but will add others in the future.
		 */
		updateSiteModel: function () {
			self = this;
			if (this.model.get('step') === this.model.CHOOSE_DATA_STEP &&
				this.model.get('location') &&
				null != this.model.get('location').latitude &&
				null != this.model.get('location').longitude &&
				this.model.get('radius') &&
				null != this.model.get('radius') &&
				_.contains(this.model.get('datasets'), DATATYPE_NWIS)) {

				this.siteModel.fetch(this.model.get('location'), this.model.get('radius')).fail(function() {
					self.goHome();
				});
			}
			else {
				this.siteModel.clear();
			}
		}
	});

	return view;
});
