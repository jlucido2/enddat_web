/* jslint browser: true */

define([
	'underscore',
	'moment',
	'bootstrap-datetimepicker',
	'Config',
	'views/BaseView',
	'hbs!hb_templates/datasetDateFilter'
], function(_, moment, datetimepicker, Config, BaseView, hbTemplate) {

	/*
	 * @constructs
	 * @param {Object} options
	 *		@prop {Backbone.Model} model
	 *		@prop {Jquery selector} el - This is where the view will be rendered.
	 */
	var dateRangeView = BaseView.extend({

		template : hbTemplate,

		events : {
			// To set the model value from a datetimepicker, handle the event of the input's div
			'dp.change #start-date-div' : 'changeStartDate',
			'dp.change #end-date-div' : 'changeEndDate'
		},

		render : function() {
			var now = new Date();

			BaseView.prototype.render.apply(this, arguments);

			//Set up date pickers
			this.$('#start-date-div').datetimepicker({
				format : Config.DATE_FORMAT,
				useCurrent: false,
				maxDate : now
			});
			this.$('#end-date-div').datetimepicker({
				format : Config.DATE_FORMAT,
				useCurrent : false,
				maxDate : now
			});

			this.updateDateFilter();
			this.listenTo(this.model, 'change:datasetDateFilter', this.updateDateFilter);

			return this;
		},

		/*
		 * Model event handlers
		 */

		updateDateFilter : function() {
			var $startDate = this.$('#start-date-div');
			var $endDate = this.$('#end-date-div');
			var dateFilter = this.model.get('datasetDateFilter');
			var startDate = (_.has(dateFilter, 'start') && (dateFilter.start)) ? dateFilter.start : '';
			var endDate = (_.has(dateFilter, 'end') && (dateFilter.end)) ? dateFilter.end : '';

			$startDate.data('DateTimePicker').date(startDate);
			$endDate.data('DateTimePicker').date(endDate);
			if (startDate) {
				$endDate.data('DateTimePicker').minDate(startDate);
			}
			else {
				$endDate.data('DateTimePicker').minDate(false);
			}
			if (endDate) {
				$startDate.data('DateTimePicker').maxDate(endDate);
			}
			else {
				$startDate.data('DateTimePicker').maxDate(new Date());
			}
		},

		/*
		 * DOM event handlers
		 */

		changeStartDate : function(ev) {
			var prevEnd = (this.model.has('datasetDateFilter') && (this.model.attributes.datasetDateFilter.end)) ? this.model.attributes.datasetDateFilter.end : '';
			var dateFilter = {
				start : '',
				end : prevEnd
			};
			if (ev.date) {
				dateFilter.start = moment(ev.date);
			}
			this.model.set('datasetDateFilter', dateFilter);
		},

		changeEndDate : function(ev) {
			var prevStart = (this.model.has('datasetDateFilter') && (this.model.attributes.datasetDateFilter.start)) ? this.model.attributes.datasetDateFilter.start : '';
			var dateFilter = {
				start : prevStart,
				end : ''
			};
			if (ev.date) {
				dateFilter.end = moment(ev.date);
			}
			this.model.set('datasetDateFilter', dateFilter);
		}
	});

	return dateRangeView;
});


