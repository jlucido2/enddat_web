/* jslint browser */

define([
	'underscore',
	'jquery',
	'select2',
	'backbone.stickit',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/choose'
], function(_, $, select2, stickit, BaseCollapsiblePanelView, hbTemplate) {
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
			'#radius' : 'radius',
			'#datasets-select' : {
				observe : 'datasets',
				update : function($el, value, model) {
					var data = _.map(this.model.get('datasetCollections'), function(val, key, list) {
						return _.object([
							['id', key],
							['text', key],
							['selected', _.contains(value, key) ? 'selected' : ''],
						]);						
					});
					this.$('#datasets-select').select2({
						data : data
					});
				},
				events : ['change'],
				getVal : function($el, event, options) {
					return $el.val();
				},
				allowClear : true,
				theme : 'bootstrap'
			},
		},

		render : function() {
			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			this.stickit();
			return this;
		}

	});

	return view;
});


