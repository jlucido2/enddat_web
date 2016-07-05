/* jslint browser: true */

define([
	'views/BaseCollapsiblePanelView'
], function(BaseCollapsiblePanelView) {
	"use strict";

	var view = BaseCollapsiblePanelView.extend({

		panelHeading : 'Choose Data',
		panelBodyId : 'choose-by-variable-panel-body'
	});

	return view;
});


