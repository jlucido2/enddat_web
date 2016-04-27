/* jslint browser: true */

define([
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/variableSummary'
], function(BaseCollapsiblePanelView, hbTemplate) {
	"use strict";

	var view = BaseCollapsiblePanelView.extend({
		template : hbTemplate,

		panelHeading : 'Selected Variables',
		panelBodyId : 'variable-summary-panel-body'
	});

	return view;
});


