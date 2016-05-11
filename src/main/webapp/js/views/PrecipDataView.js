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
			this.listenTo(this.model.get('variables').at(0), 'change:selected', this.updateSelectedCheckbox);
		},

		render : function() {
			var attributes = this.model.attributes;
			var variable = attributes.variables.at(0).attributes;
			this.context.selected = variable.selected;
			this.context.lat = (parseFloat(attributes.lat)).toFixed(3);
			this.context.lon = (parseFloat(attributes.lon)).toFixed(3);
			this.context.startDate = variable.startDate.format(Config.DATE_FORMAT);
			this.context.endDate = variable.endDate.format(Config.DATE_FORMAT);
			this.context.x = variable.x;
			this.context.y = variable.y;
			this.context.distance = this.distanceToProjectLocation;

			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			return this;
		},

		toggleCollectedDataVariable : function() {
			var variable = this.model.get('variables').at(0);
			variable.set('selected', !variable.get('selected'));
		},

		updateSelectedCheckbox : function(variableModel) {
			this.$('table input:checkbox').prop('checked', variableModel.has('selected') && variableModel.get('selected'));
		}
	});

	return view;
});