/* jslint browser */
/* global parseFloat */

define([
	'underscore',
	'moment',
	'Config',
	'views/BaseDataView',
	'hbs!hb_templates/precipData'
], function(_, moment, Config, BaseDataView, hbTemplate) {
	"use strict";

	/* @construct
	 * @param {Object} options
	 *		@prop {String jquery selector or jquery element} $el
	 *		@prop {Backbone.Model representing precipitation grid data} model
	 *		@prop {String} distanceToProjectLocation
	 */
	var view = BaseDataView.extend({
		template : hbTemplate,

		panelHeading : 'Precipitation Data Overview',
		panelBodyId : 'precipitation-data-overview-panel-body',

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
			this.context.id = attributes.variables.at(0).cid;
			this.context.distance = this.distanceToProjectLocation;

			BaseDataView.prototype.render.apply(this, arguments);
			return this;
		}
	});

	return view;
});