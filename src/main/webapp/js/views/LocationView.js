/* jslint browser */

define([
	'underscore',
	'backbone.stickit',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/location',
	'hbs!hb_templates/errorAlert'
], function(_, stickit, BaseCollapsiblePanelView, hbTemplate, errorAlertTemplate) {
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
				observe : 'location',
				onGet : function(value) {
					if (value && _.has(value, 'latitude')) {
						return value.latitude;
					}
					else {
						return '';
					}
				},
				events : ['change'],
				onSet : function(value) {
					var result;
					if (this.model.has('location')) {
						result = {
							latitude : value,
							longitude : this.model.get('location').longitude
						};
					}
					else {
						result = {
							latitude : value,
							longitude : ''
						};
					}
					return result;
				}
			},
			'#longitude' : {
				observe : 'location',
				events : ['change'],
				onGet : function(value) {
					if (value && _.has(value, 'longitude')) {
						return value.longitude;
					}
					else {
						return '';
					}
				},
				onSet : function(value) {
					var result;
					if (this.model.has('location')) {
						result = {
							latitude : this.model.get('location').latitude,
							longitude : value,
						};
					}
					else {
						result = {
							latitude : '',
							longitude : value
						};
					}
					return result;
				}
			}
		},

		render : function() {
			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			this.stickit();
			return this;
		},

		/*
		 * Uses the browsers navigator object to try to grab the browsers current location.
		 */
		getMyLocation : function(ev) {
			var self = this;
			var updateModel = function(position) {
				self.model.set('location', {
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


