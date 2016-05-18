/* jslint browser: true */

define([
	'jquery',
	'moment',
	'handlebars',
	'bootstrap-datetimepicker',
	'module',
	'Config',
	'models/TimeSeriesOptionCollection',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/processData'
], function($, moment, Handlebars, datetimepicker, module, Config, TimeSeriesOptionCollection, BaseCollapsiblePanelView, hbTemplate) {
	"use strict";

	var BASE_URL = module.config().baseUrl;
	var TIME_SERIES_OPTIONS = [
		{statName : 'raw', statTitle : 'Raw data', checked: true, timeSpanRequired : false},
		{statName : 'Min', statTitle : 'Minimum', checked: false, timeSpanRequired : true},
		{statName : 'Max', statTitle : 'Maximum', checked: false, timeSpanRequired : true},
		{statName : 'Sum', statTitle : 'Summation', checked: false, timeSpanRequired : true},
		{statName : 'Diff', statTitle : 'Difference', checked: false, timeSpanRequired : true},
		{statName : 'MaxDifference', statTitle : 'Max Difference', checked: false, timeSpanRequired : true},
		{statName : 'StDev', statTitle : 'Standard Deviation', checked: false, timeSpanRequired : true}
	];

	var ERROR_ALERT_TEMPLATE = Handlebars.compile('<div class="alert alert-danger" role="alert">{{message}}</div>');

	var getUrl = function(model) {
		var attrs = model.attributes;
		var varParams = model.getSelectedVariablesUrlParameters();
		var params = [
			{name : 'style', value : attrs.outputFileFormat},
			{name : 'DateFormat', value : attrs.outputDateFormat},
			{name : 'TZ', value : attrs.outputTimeZone},
			{name : 'timeInt', value : attrs.outputTimeGapInterval},
			{name : 'beginPosition', value : attrs.outputDateRange.start.format(Config.DATE_FORMAT)},
			{name : 'endPosition', value : attrs.outputDateRange.end.format(Config.DATE_FORMAT)}
		];

		return BASE_URL + 'service/execute?' + $.param(params.concat(varParams));
	};

	var validTimeSpan = function($input) {
		var isValid;
		var timeSpan;
		if ($input.length === 0) {
			isValid = true;
		}
		else {
			timeSpan = $input.val();
			isValid = ((timeSpan) && (parseFloat(timeSpan) > 0)) ? true : false;
		}
		return isValid;
	};

	/*
	 * @constructs
	 * @param {Object} options
	 *		@prop {Jquery selector or element} el
	 *		@prop {models/WorkflowStateModel}
	 */
	var view = BaseCollapsiblePanelView.extend({
		template : hbTemplate,

		panelHeading : 'Process Data',
		panelBodyId : 'process-data-panel-body',

		additionalEvents : {
			'click .show-url-btn' : 'showUrl',
			'click .get-data-btn' : 'getData',
			//To set the model value from a datetimepicker, hand
			'dp.change #output-start-date-div' : 'changeOutputStartDate',
			'dp.change #output-end-date-div' : 'changeOutputEndDate',

			'change .ts-option-div input' : 'removeErrorAlert'
		},

		render : function() {
			var selectedVarsDateRange = this.model.getSelectedVarsDateRange();
			var outputDateRange = this.model.get('outputDateRange');

			this.context.timeSeriesOptions = TIME_SERIES_OPTIONS;
			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);

			//Set up date pickers
			this.$('#output-start-date-div').datetimepicker({
				format : Config.DATE_FORMAT,
				useCurrent: false,
				defaultDate : outputDateRange.start,
				minDate : selectedVarsDateRange.start,
				maxDate : outputDateRange.end
			});
			this.$('#output-end-date-div').datetimepicker({
				format : Config.DATE_FORMAT,
				useCurrent : false,
				defaultDate : outputDateRange.end,
				minDate : outputDateRange.start,
				maxDate : selectedVarsDateRange.end
			});

			this.listenTo(this.model, 'change:outputDateRange', this.updateOutputDateRangeInputs);
			return this;
		},

		/*
		 * Model event listeners
		 */

		updateOutputDateRangeInputs : function(model, outputDateRange) {
			var $startDate = this.$('#output-start-date-div');
			var $endDate = this.$('#output-end-date-div');

			$startDate.data('DateTimePicker').maxDate(outputDateRange.end);
			$startDate.data('DateTimePicker').date(outputDateRange.start);
			$endDate.data('DateTimePicker').minDate(outputDateRange.start);
			$endDate.data('DateTimePicker').date(outputDateRange.end);
		},

		/*
		 *
		 */
		updateTimeSeriesOptions : function() {
			var result = [];
			this.$('.ts-option-div .stat-type-checkbox:checked').each(function() {
				var $parentDiv = $(this).parents('.ts-option-div');
				var $timeSpanInput = $parentDiv.find('.time-span-input');
				var isValidTimeSpan;
				var timeSpan;

				if ($timeSpanInput.length > 0) {
					isValidTimeSpan = validTimeSpan($timeSpanInput);
					timeSpan = $timeSpanInput.val();
					if (isValidTimeSpan) {
						result.push({
							statistic : $(this).val(),
							timeSpan : timeSpan
						});
					}
					else {
						result = [];
						$parentDiv.append(ERROR_ALERT_TEMPLATE({message : 'Must enter a time span'}));
						return false;
					}
				}
				else {
					result.push({statistic : $(this).val()});
				}
			});

			this.model.set('timeSeriesOptions', new TimeSeriesOptionCollection(result));
		},



		/*
		 * DOM Event Handlers
		 */

		removeErrorAlert : function(ev) {
			var $tsContainer = $(ev.currentTarget).parents('.ts-option-div');
			var isChecked = $tsContainer.find('.stat-type-checkbox').is(':checked');
			var $timeSpan = $tsContainer.find('.time-span-input');
			if (validTimeSpan($timeSpan)) {
				$tsContainer.find('.alert').remove();
			}
		},

		changeOutputStartDate : function(ev) {
			var currentOutputDateRange = this.model.get('outputDateRange');
			if (ev.date) {
				this.model.set('outputDateRange', {
					start : moment(ev.date),
					end  : currentOutputDateRange.end
				});
			}
			else {
				this.model.set('outputDateRange', {
					start : this.model.getSelectedVarsDateRange().start,
					end : currentOutputDateRange.end
				});
			}
		},

		changeOutputEndDate : function(ev) {
			var currentOutputDateRange = this.model.get('outputDateRange');
			if (ev.date) {
				this.model.set('outputDateRange', {
					start : currentOutputDateRange.start,
					end  : moment(ev.date)
				});
			}
			else {
				this.model.set('outputDateRange', {
					start : currentOutputDateRange.start,
					end : this.model.getSelectedVarsDateRange().end
				});
			}
		},

		showUrl : function(ev) {
			var url;
			var $link;
			this.updateTimeSeriesOptions();
			if (this.model.get('timeSeriesOptions').length > 0) {
				url = getUrl(this.model);
				$link = this.$('.url-container a');
				ev.preventDefault();

				$link.attr('href', url).html(url);
			}
		},

		getData : function(ev) {
			ev.preventDefault();
			this.updateTimeSeriesOptions();
			if (this.model.get('timeSeriesOptions').length > 0) {
				window.open(getUrl(this.model), '_blank');
			}
		}
	});

	return view;
});


