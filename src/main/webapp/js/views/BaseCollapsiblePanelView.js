/* jslint browser: true */

define([
	'underscore',
	'bootstrap',
	'views/BaseView',
	'hbs!hb_templates/collapsiblePanel'
], function(_, bootstrap, BaseView, panelTemplate) {
	"use strict";

	/*
	 * Abstract view that should be extended to add the panel body as the template property, adding
	 * the panelHeading, panelBodyId, and additionalEvents properties.
	 *
	 *
	 * @constructs
	 * @param {Object} options
	 *		@prop {Boolean} opened - Set to true if the panel should be shown opened when rendered
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


		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.opened = options.opened ? options.opened : false;
		},

		render : function() {
			this.$el.html(panelTemplate({
				opened : this.opened,
				panelHeading : this.panelHeading,
				panelBodyId : this.panelBodyId
			}));
			if (this.opened) {
				this.$('.expand-icon').hide();
			}
			else {
				this.$('.collapse-icon').hide();
			}
			this.$('.panel-body').html(this.template(this.context));
			return this;
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


