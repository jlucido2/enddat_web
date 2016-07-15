/* jslint browser */

define([
	'underscore',
	'jquery',
	'select2',
	'bootstrap',
	'Config',
	'views/BaseCollapsiblePanelView',
	'views/DataDateFilterView',
	'hbs!hb_templates/choose'
], function(_, $, select2, bootstrap, Config, BaseCollapsiblePanelView, DataDateFilterView, hbTemplate) {
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
			'select2:selecting #datasets-select' : 'selectDataset',
			'select2:unselect #datasets-select' : 'resetDataset',
			'change .glcfs-lake-select-modal select' : 'selectGLCFSLake'
		},

		initialize : function(options) {
			BaseCollapsiblePanelView.prototype.initialize.apply(this, arguments);

			this.dateFilterView = new DataDateFilterView({
				el : this.$('.date-filter-container'),
				model : this.model
			});
		},

		render : function() {
			var self = this;

			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			this.dateFilterView.setElement(this.$('.date-filter-container')).render();

			this.$('.glcfs-lake-select-modal').modal({
				show : false
			});

			this.$('#datasets-select').select2({
				allowClear : true,
				theme : 'bootstrap',
				templateSelection : function(data) {
					if (data.id === Config.GLCFS_DATASET) {
						return data.text + ' - ' +
							self.model.get('datasetCollections')[data.id].getLake();
					}
					else {
						return data.text;
					}
				}
			});
			this.updateDatasets();
			this.gaSelectTracker();

			this.listenTo(this.model, 'change:datasets', this.updateDatasets);
			return this;
		},

		remove : function() {
			this.dateFilterView.remove();
			BaseCollapsiblePanelView.prototype.remove.apply(this, arguments);
		},

		/*
		 * Model event handlers
		 */

		updateDatasets : function() {
			var chosenDatasets = (this.model.has('datasets')) ? this.model.get('datasets') : [];
			this.$('#datasets-select').val(chosenDatasets).trigger('change');
		},

		/*
		 * DOM event handlers
		 */

		selectDataset : function(ev) {
			var datasets = _.clone((this.model.has('datasets')) ? this.model.get('datasets') : []);
			if (ev.params.args.data.id === Config.GLCFS_DATASET) {
				ev.preventDefault();
				this.$('.glcfs-lake-select-modal').modal('show');
			}
			else {
				datasets.push(ev.params.args.data.id);
				this.model.set('datasets', datasets);
			}
		},

		resetDataset : function(ev) {
			var datasets = (this.model.has('datasets')) ? this.model.get('datasets') : [];
			datasets = _.reject(datasets, function(datasetKind) {
				return (ev.params.data.id === datasetKind);
			});
			this.model.set('datasets', datasets);
		},

		selectGLCFSLake : function(ev) {
			var datasets = _.clone((this.model.has('datasets')) ? this.model.get('datasets') : []);
			this.model.get('datasetCollections')[Config.GLCFS_DATASET].setLake(ev.target.value);
			datasets.push(Config.GLCFS_DATASET);
			this.model.set('datasets', datasets);
			this.$('.glcfs-lake-select-modal').modal('hide');
		},

		gaSelectTracker: function () {
			$('#datasets-select').on('select2:select', function (e) {
				var lastSelectedItem = e.params.data.text;
				ga('send', 'event', 'Dataset Selected', 'clicked', lastSelectedItem);
			});

			$('#datasets-select').on('select2:unselect', function (e) {
				var lastRemovedItem = e.params.data.text;
				ga('send', 'event', 'Dataset Removed', 'clicked', lastRemovedItem);
			});
		}
	});

	return view;
});


