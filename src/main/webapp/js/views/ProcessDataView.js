/* jslint browser */

define([
	'jquery',
	'module',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/processData'
], function($, module, BaseCollapsiblePanelView, hbTemplate) {
	"use strict";

	var BASE_URL = module.config().baseUrl;

	var getUrl = function(model) {
		var params = model.getSelectedVariablesUrlParams();

		return 'service/execute?' + $.param(params);
	};

	var view = BaseCollapsiblePanelView.extend({
		template : hbTemplate,

		panelHeading : 'Process Data',
		panelBodyId : 'process-data-panel-body',

		additionalEvents : {
			'click .show-url-btn' : 'showUrl',
			'click .get-data-btn' : 'getData'
		},

		showUrl : function(ev) {
			ev.preventDefault();
			this.$('.url-container').html(BASE_URL + getUrl(this.model));
		},

		getData : function(ev) {
			ev.preventDefault();
		}
	});

	return view;
});


