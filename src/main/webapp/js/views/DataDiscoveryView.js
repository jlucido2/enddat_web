/* jslint browser: true */

define([
    'loglevel',
	'views/BaseView',
	'views/NavView',
	'views/MapView',
	'views/LocationView',
	'models/SiteCollection',
	'hbs!hb_templates/dataDiscovery'
], function (log, BaseView, NavView, MapView, LocationView, SiteCollection, hbTemplate) {
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
		 *		@prop {models/parameterCodes} model
		 *		@prop {models/statisticCodes} model
		 */
		initialize: function (options) {
			self = this;
			
			if (this.model.attributes.step === this.model.CHOOSE_DATA_STEP &&
				this.model.attributes.radius &&
				this.model.attributes.datasets &&
				_.each(this.model.attributes.datasets, function(el) {
					if(el === DATATYPE_NWIS) {
						return true;
					}
				})) {
				
				//create site model using attributes in this.model
				this.siteData = new SiteCollection({},
						{workflowModel: this.model});

				//load the site model after codes have been fetched
				$.when(options.pCodesPromise, options.sCodesPromise).done(function() {
					self.siteData.fetch(
						{parameterCodes: options.parameterCodes,
						statisticCodes: options.statisticCodes}).done(function() {
						log.debug('Fetched sites ' + self.siteData.length);
					});
				}).fail(function() {
					self.goHome();
				});
				
			} else if (this.siteData) {
				this.siteData.clear();
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
				sites : this.siteData
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
