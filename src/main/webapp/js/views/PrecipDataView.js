/* jslint browser */
/* global parseFloat */

define([
	'underscore',
	'moment',
	'Config',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/precipData'
], function(_, moment, Config, BaseCollapsiblePanelView, hbTemplate) {
	"use strict";

	/* @construct
	 * @param {Object} options
	 *		@prop {String jquery selector or jquery element} $el
	 *		@prop {Backbone.Model representing precipitation grid data} model
	 *		@prop {String} distanceToProjectLocation
	 */
	var view = BaseCollapsiblePanelView.extend({
		template : hbTemplate,

		panelHeading : 'Precipitation Data Overview',
		panelBodyId : 'precipitation-data-overview-panel-body',

		additionalEvents : {
			'click input:checkbox' : 'toggleCollectedDataVariable'
		},

		initialize : function(options) {
			BaseCollapsiblePanelView.prototype.initialize.apply(this, arguments);

			this.distanceToProjectLocation = options.distanceToProjectLocation;
			this.listenTo(this.model, 'change:selected', this.updateSelectedCheckbox);
		},

		render : function() {
			this.context = _.clone(this.model.attributes);
			this.context.lat = (parseFloat(this.context.lat)).toFixed(3);
			this.context.lon = (parseFloat(this.context.lon)).toFixed(3);
			this.context.startDate = this.context.startDate.format(Config.DATE_FORMAT);
			this.context.endDate = this.context.endDate.format(Config.DATE_FORMAT);
			this.context.distance = this.distanceToProjectLocation;

			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			return this;
		},

		toggleCollectedDataVariable : function() {
			this.model.set('selected', !this.model.get('selected'));
		},

		updateSelectedCheckbox : function(model) {
			this.$('table input:checkbox').prop('checked', model.has('selected') && model.get('selected'));
		}
	});

	return view;
});