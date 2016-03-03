/* jslint browser */

define([
	'underscore',
	'backbone.stickit',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/location',
	'hbs!hb_templates/errorAlert'
], function(_, stickit, BaseCollapsiblePanelView, hbTemplate, errorAlertTemplate) {
	"use strict";

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
					var oldLocation = this.model.get('location');
					return {
						latitude : value,
						longitude : oldLocation.longitude
					};
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
					var oldLocation = this.model.get('location');
					return {
						latitude : oldLocation.latitude,
						longitude : value
					};
				}
			}
		},
		render : function() {
			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			this.stickit();
			return this;
		},

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


