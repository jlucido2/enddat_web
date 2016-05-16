/* jslint browser */

define([
	'jquery',
	'module',
	'Config',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/processData'
], function($, module, Config, BaseCollapsiblePanelView, hbTemplate) {
	"use strict";

	var BASE_URL = module.config().baseUrl;

	var getUrl = function(model) {
		var attrs = model.attributes;
		var varParams = model.getSelectedVariablesUrlParams();
		var params = [
			{name : 'style', value : attrs.outputFileFormat},
			{name : 'DateFormat', value : attrs.outputDateFormat},
			{name : 'TZ', value : attrs.outputTimeZone},
			{name : 'timeInt', value : attrs.outputTimeGapInterval},
			{name : 'beginPosition', value : attrs.outputDateRange.start.format(Config.DATE_FORMAT)},
			{name : 'endPosition', value : attrs.outputDateRange.end.format(Config.DATE_FORMAT)}
		];

		return BASE_URL + 'service/execute?' +
			$.param(params.concat(varParams));
	};

	var view = BaseCollapsiblePanelView.extend({
		template : hbTemplate,

		panelHeading : 'Process Data',
		panelBodyId : 'process-data-panel-body',

		additionalEvents : {
			'click .show-url-btn' : 'showUrl',
			'click .get-data-btn' : 'getData'
		},

		render : function() {
			var dateRange = this.model.getSelectedVarsDateRange();
			this.context.hasOverlappingData = (dateRange) ? true : false;
			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			return this;
		},

		showUrl : function(ev) {
			ev.preventDefault();
			this.$('.url-container').html(getUrl(this.model));
		},

		getData : function(ev) {
			ev.preventDefault();
			window.open(getUrl(this.model), '_blank');
		}
	});

	return view;
});


