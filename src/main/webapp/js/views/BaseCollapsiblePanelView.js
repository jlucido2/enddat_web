/* jslint browser: true */

define([
	'underscore',
	'views/BaseView',
	'hbs!hb_templates/collapsiblePanel'
], function(_, BaseView, panelTemplate) {
	"use strict";

	/*
	 * Abstract view that should be extended to add the panel body as the template property, adding
	 * the panelHeading, panelBodyId, and additionalEvents properties.
	 */
	var view = BaseView.extend({
		panelCollapseEvents : {
			'click .collapse-btn' : 'toggleIcon'
		},
		additionalEvents : {}, // When extend this view, add event handlers for the panel body here

		events : function() {
			return _.extend({}, this.panelCollapseEvents, this.additionalEvents);
		},

		template : function() {
			return function(context) {
				'Replace with the template function for the panel body';
			};
		},

		panelHeading : '', // When extending this view, give the panel a heading
		panelBodyId : '', // When extending this view, give a unique id for the panel body.

		render : function() {
			this.$el.html(panelTemplate({
				panelHeading : this.panelHeading,
				panelBodyId : this.panelBodyId
			}));
			this.$('.panel-body').html(this.template(this.context));
		},

		toggleIcon : function(ev) {
			var $button = $(ev.currentTarget);
			var $visibleIcon = $button.find('i:visible');
			var $hiddenIcon = $button.find('i:hidden');
			ev.preventDefault();
			$visibleIcon.hide();
			$hiddenIcon.show();
		}
	});

	return view;
});


