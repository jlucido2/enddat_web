/* jslint browser */

define([
	'underscore',
	'backbone.stickit',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/choose'
], function(_, stickit, BaseCollapsiblePanelView, hbTemplate) {
	"use strict";

	/*
	 * @constructs
	 * @param {Object} options
	 *		@prop {WorkflowStateModel} model
	 *		@prop {Jquery el or selector} el
	 *		@prop {Boolean} opened - Set to true if the panel should initially be open.
	 */
	var view = BaseCollapsiblePanelView.extend({
		template : hbTemplate,

		panelHeading : 'Choose Data',
		panelBodyId : 'choose-data-panel-body',

		bindings : {
			'#radius' : 'radius'
		},

		render : function() {
			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			this.stickit();
			return this;
		}

	});

	return view;
});


