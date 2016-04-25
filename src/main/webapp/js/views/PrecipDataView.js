/* jslint browser */
/* global parseFloat */

define([
	'underscore',
	'moment',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/precipData'
], function(_, moment, BaseCollapsiblePanelView, hbTemplate) {
	"use strict";

	/* @construct
	 * @param {Object} options
	 *		@prop {String jquer selector or jquery element} $el
	 *		@prop {Backbone.Model representing precipitation grid data} model
	 *
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

			this.context = _.clone(this.model.attributes);
			this.context.lat = (parseFloat(this.context.lat)).toFixed(3);
			this.context.lon = (parseFloat(this.context.lon)).toFixed(3);
			this.context.startDate = this.context.startDate.format('YYYY-MM-DD');
			this.context.endDate = this.context.endDate.format('YYYY-MM-DD');
		},

		toggleCollectedDataVariable : function() {
			this.model.set('selected', !this.model.get('selected'));
		}
	});

	return view;
});