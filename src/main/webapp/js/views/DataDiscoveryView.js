/* jslint browser: true */

define([
	'loglevel',
	'views/BaseView',
	'views/NavView',
	'views/MapView',
	'views/LocationView',
	'views/ChooseView',
	'hbs!hb_templates/dataDiscovery'
], function (log, BaseView, NavView, MapView, LocationView, ChooseView, hbTemplate) {
	"use strict";

	var NAVVIEW_SELECTOR = '.workflow-nav';
	var LOCATION_SELECTOR = '.location-panel';
	var CHOOSE_SELECTOR = '.choose-panel';
	var MAPVIEW_SELECTOR = '.map-container-div';
	var DATATYPE_NWIS = 'NWIS';

	var view = BaseView.extend({
		template: hbTemplate,

		/*
		 * @constructs
		 * @param {Object} options
		 *		@prop {Jquery element} el
		 *		@prop {models/WorkflowStateModel} model
		 *		@prop {models/SiteModel} model
		 */
		initialize: function (options) {
			this.siteModel = options.siteModel;

			this.listenTo(this.model, 'change:step', this.showChooseView);
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
				model : this.model,
				opened : true
			});

			this.chooseView  = new ChooseView({
				el : this.$(CHOOSE_SELECTOR),
				model : this.model,
				opened : true
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
			this.updateSiteModel();
			this.showChooseView();
			return this;
		},

		remove: function () {
			this.navView.remove();
			this.mapView.remove();
			this.locationView.remove();
			this.chooseView.remove();
			BaseView.prototype.remove.apply(this, arguments);
			return this;
		},

		updateSiteModel: function () {
			self = this;
			/*
			 * Check to see if the WorkflowStateModel contains the parameters needed
			 * to fetch data for the project.  Currently only checking
			 * for the NWIS data type but will add others in the future.
			 */
			if (this.model.get('step') === this.model.CHOOSE_DATA_STEP &&
				this.model.get('location') &&
				null != this.model.get('location').latitude &&
				null != this.model.get('location').longitude &&
				this.model.get('radius') &&
				null != this.model.get('radius') &&
				_.contains(this.model.get('datasets'), DATATYPE_NWIS)) {
				
				//start loading indicator
				this.siteModel.fetch(this.model.get('location'), this.model.get('radius')).fail(function() {
					//notify user about problem here rather than log message...
					log.debug('Fetch failed');
				});
				//stop loading indicator
			}
			else {
				this.siteModel.clear();
				this.siteModel.trigger('sync', this.siteModel);
			}
			
			return this;
		},

		showChooseView: function () {
			var step = this.model.get('step');
			if (this.model.CHOOSE_DATA_STEP === step) {
				this.chooseView.setElement(this.$(CHOOSE_SELECTOR)).render();
			}
			return this;
		}

	});

	return view;
});
