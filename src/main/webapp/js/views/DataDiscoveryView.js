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
			/* 
			 * Check to see if the url contains the parameters needed
			 * to fetch data for the project.  Currently only checking
			 * for the NWIS data type but will add others in the future.
			 */
			if (this.model.get('step') === this.model.CHOOSE_DATA_STEP &&
				this.model.get('radius') &&
				this.model.get('datasets') &&  //should we check for one and only one?
				_.each(this.model.get('datasets'), function(el) {
					if(el === DATATYPE_NWIS) {
						return true;
					}
				})) {
				
				this.siteModel = new SiteModel();				
				this.siteModelPromise = this.siteModel.fetch(this.model);
				this.siteModelPromise.fail(function() {
					this.goHome();
				});
			/* Check if a siteModel was already created but clear the sites
			 * attribute since the url does not have all the parameters to
			 * fetch data.  This will preserve the parameter and statistic code
			 * attributes in the siteModel.
			 */
			} else if (this.siteModel) {
				this.siteModel.set({sites: ''});
			};
	
			BaseView.prototype.initialize.apply(this, arguments);

			this.navView = new NavView({
				el : this.$(NAVVIEW_SELECTOR),
				model : this.model,
				router : this.router
			});

			//pass in siteData to mapView where mapView listen to events
			//on the siteData model. Specifically, there is a 'sync' event that is
			//fired after successful fetching of the data.
			this.mapView = new MapView({
				el : this.$(MAPVIEW_SELECTOR),
				mapDivId : 'map-div',
				model : this.model,
				siteModelPromise : this.siteModelPromise,
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
		}
	});

	return view;
});
