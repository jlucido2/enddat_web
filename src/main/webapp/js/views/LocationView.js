/* jslint browser */

define([
	'underscore',
	'backbone.stickit',
	'views/BaseView',
	'hbs!hb_templates/location'
], function(_, stickit, BaseView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({
		template : hbTemplate,

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
			BaseView.prototype.render.apply(this, arguments);
			this.stickit();
			return this;
		}
	});

	return view;
});


