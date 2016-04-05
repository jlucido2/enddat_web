/* jslint browser */
/* global parseFloat */

define([
	'loglevel',
	'underscore',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/precipData'
], function(log, _, BaseCollapsiblePanelView, hbTemplate) {
	"use strict";

	var view = BaseCollapsiblePanelView.extend({
		template : hbTemplate,

		panelHeading : 'Precipitation Data Overview',
		panelBodyId : 'precipitation-data-overview-panel-body',

		additionalEvents : {
			'click input:checkbox' : 'toggleCollectedDataVariable'
		},

		initialize : function(options) {
			BaseCollapsiblePanelView.prototype.initialize.apply(this, arguments);

			this.context = this.model.attributes;
			this.context.lat = (parseFloat(this.context.lat)).toFixed(3);
			this.context.lon = (parseFloat(this.context.lon)).toFixed(3);
		},

		toggleCollectedDataVariable : function() {
			this.model.set('selected', !this.model.get('selected'));
		}
	});

	return view;
});