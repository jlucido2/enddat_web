/* jslint browser */

define([
	'underscore',
	'backbone.stickit',
	'views/BaseCollapsiblePanelView',
	'views/ShapefileUploadView',
	'hbs!hb_templates/location',
	'hbs!hb_templates/errorAlert'
], function(_, stickit, BaseCollapsiblePanelView, ShapefileUploadView, hbTemplate, errorAlertTemplate) {
	"use strict";

	/*
	 * @constructs
	 * @param {Object} options
	 *		@prop {WorkflowStateModel} model
	 *		@prop {Jquery el or selector} el
	 *		@prop {Boolean} opened - Set to true if the panel should initially be open.
	 */
	var view = BaseCollapsiblePanelView.extend({
		template : hbTemplate,

		panelHeading : 'Specify Project Location',
		panelBodyId : 'specify-project-location-panel-body',

		additionalEvents : {
			'click .use-location-btn' : 'getMyLocation'
		},

		bindings : {
			'#latitude' : {
				observe : 'latitude',
				events : ['change']
			},
			'#longitude' : {
				observe : 'longitude',
				events : ['change']
			},
			'#radius' : {
				observe : 'radius',
				events : ['change']
			}
		},

		initialize : function(options) {
			BaseCollapsiblePanelView.prototype.initialize.apply(this, arguments);

			this.shapefileUploadView = new ShapefileUploadView({
				el : '.shapefile-upload-div',
				model : this.model
			});
		},

		render : function() {
			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			this.shapefileUploadView.setElement(this.$('.shapefile-upload-div')).render();
			this.stickit(this.model.get('aoi'));
			return this;
		},

		remove : function() {
			this.shapefileUploadView.remove();
			BaseCollapsiblePanelView.prototype.remove.apply(this, arguments);
		},

		/*
		 * Uses the browsers navigator object to try to grab the browsers current location.
		 */
		getMyLocation : function(ev) {
			var self = this;
			var updateModel = function(position) {
				self.model.get('aoi').set({
					latitude : position.coords.latitude,
					longitude : position.coords.longitude
				});
			};
			var displayError = function(err) {
				self.$('.panel-body').append(errorAlertTemplate({
					message : 'Unable to get your location'
				}));
			};

			navigator.geolocation.getCurrentPosition(updateModel, displayError, {
				timeout: 8000,
				maximumAge: 60000
			});
		}
	});

	return view;
});


