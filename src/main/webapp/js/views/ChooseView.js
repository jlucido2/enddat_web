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

		additionalEvents : {
			'select2:select #datasets-select' : 'selectDataset',
			'select2:unselect #datasets-select' : 'resetDataset'
		},

		bindings : {
			'#radius' : 'radius'
		},


		render : function() {
			var datasetOptions = _.map(this.model.ALL_DATASETS, function(kind) {
				return {
					id : kind,
					text : kind
				};
			});
			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			this.stickit();

			this.$('#datasets-select').select2({
				data : datasetOptions
			});
			this.updateDatasets();

			this.listenTo(this.model, 'change:datasets', this.updateDatasets);
			return this;
		},

		updateDatasets : function() {
			var chosenDatasets = (this.model.has('datasets')) ? this.model.get('datasets') : [];
			this.$('#datasets-select').val(chosenDatasets).trigger('change');
		},

		selectDataset : function(ev) {
			var datasets = _.clone((this.model.has('datasets')) ? this.model.get('datasets') : []);
			datasets.push(ev.params.data.id);
			this.model.set('datasets', datasets);
		},

		resetDataset : function(ev) {
			var datasets = (this.model.has('datasets')) ? this.model.get('datasets') : [];
			datasets = _.reject(datasets, function(datasetKind) {
				return (ev.params.data.id === datasetKind);
			});
			this.model.set('datasets', datasets);
		}

	});

	return view;
});


