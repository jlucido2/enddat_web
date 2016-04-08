/* jslint browser */

define([
	'underscore',
	'jquery',
	'select2',
	'bootstrap-datetimepicker',
	'backbone.stickit',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/choose'
], function(_, $, select2, datetimepicker, stickit, BaseCollapsiblePanelView, hbTemplate) {
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
			'select2:unselect #datasets-select' : 'resetDataset',
			// To set the model value from a datetimepicker, handle the event of the input's div
			'dp.change #start-date-div' : 'changeStartDate',
			'dp.change #end-date-div' : 'changeEndDate'
		},

		bindings : {
			'#radius' : 'radius',
			'#start-date' : 'startDate',
			'#end-date' : 'endDate'
		},


		render : function() {
			var now = new Date();

			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			this.stickit();

			//Set up date pickers
			this.$('#start-date-div').datetimepicker({
				format : 'YYYY-MM-DD',
				useCurrent: false,
				maxDate : now
			});
			this.$('#end-date-div').datetimepicker({
				format : 'YYYY-MM-DD',
				useCurrent : false,
				maxDate : now
			});

			this.$('#datasets-select').select2({
				allowClear : true,
				theme : 'bootstrap'
			});
			this.updateDatasets();

			this.listenTo(this.model, 'change:datasets', this.updateDatasets);
			return this;
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
			datasets.push(ev.params.data.id);
			this.model.set('datasets', datasets);
		},

		resetDataset : function(ev) {
			var datasets = (this.model.has('datasets')) ? this.model.get('datasets') : [];
			datasets = _.reject(datasets, function(datasetKind) {
				return (ev.params.data.id === datasetKind);
			});
			this.model.set('datasets', datasets);
		},

		changeStartDate : function(ev) {
			var $endDate = this.$('#end-date-div');
			if (ev.date) {
				this.model.set('startDate', ev.date.format('YYYY-MM-DD'));
				$endDate.data('DateTimePicker').minDate(ev.date);
			}
			else {
				this.model.unset('startDate');
				$endDate.data('DateTimePicker').minDate(false);
			}
		},

		changeEndDate : function(ev) {
			var $startDate = this.$('#start-date-div');
			if (ev.date) {
				this.model.set('endDate', ev.date.format('YYYY-MM-DD'));
				$startDate.data('DateTimePicker').maxDate(ev.date);
			}
			else {
				this.model.unset('endDate');
				$startDate.data('DateTimePicker').maxDate(new Date());
			}
		}

	});

	return view;
});


