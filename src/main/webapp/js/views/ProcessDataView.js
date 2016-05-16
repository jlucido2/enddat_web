/* jslint browser */

define([
	'jquery',
	'moment',
	'bootstrap-datetimepicker',
	'module',
	'Config',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/processData'
], function($, moment, datetimepicker, module, Config, BaseCollapsiblePanelView, hbTemplate) {
	"use strict";

	var BASE_URL = module.config().baseUrl;

	var getUrl = function(model) {
		var attrs = model.attributes;
		var varParams = model.getSelectedVariablesUrlParams();
		var params = [
			{name : 'style', value : attrs.outputFileFormat},
			{name : 'DateFormat', value : attrs.outputDateFormat},
			{name : 'TZ', value : attrs.outputTimeZone},
			{name : 'timeInt', value : attrs.outputTimeGapInterval},
			{name : 'beginPosition', value : attrs.outputDateRange.start.format(Config.DATE_FORMAT)},
			{name : 'endPosition', value : attrs.outputDateRange.end.format(Config.DATE_FORMAT)}
		];

		return BASE_URL + 'service/execute?' +
			$.param(params.concat(varParams));
	};

	var view = BaseCollapsiblePanelView.extend({
		template : hbTemplate,

		panelHeading : 'Process Data',
		panelBodyId : 'process-data-panel-body',

		additionalEvents : {
			'click .show-url-btn' : 'showUrl',
			'click .get-data-btn' : 'getData',
			//To set the model value from a datetimepicker, hand
			'dp.change #output-start-date-div' : 'changeOutputStartDate',
			'dp.change #output-end-date-div' : 'changeOutputEndDate'
		},

		render : function() {
			var selectedVarsDateRange = this.model.getSelectedVarsDateRange();
			var outputDateRange = this.model.get('outputDateRange');

			//this.context = {
			//	startDate : this.model.attributes.outputDateRange.start.format(Config.DATE_FORMAT),
			//	endDate : this.model.attributes.outputDateRange.end.format(Config.DATE_FORMAT)
			//};
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
			var $startDate = this.$('output-start-date-div');
			var $endDate = this.$('output-end-date-div');

			$startDate.data('DateTimePicker').maxDate(outputDateRange.end);
			$endDate.data('DateTimePickers').minDate(outputDateRange.start);

			$startDate.find('#output-start-date').val(outputDateRange.start);
			$startDate.find('#output-end-date').val(outputDateRange.end);
		},

		/*
		 * DOM Event Handlers
		 */

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
			ev.preventDefault();
			this.$('.url-container').html(getUrl(this.model));
		},

		getData : function(ev) {
			ev.preventDefault();
			window.open(getUrl(this.model), '_blank');
		}
	});

	return view;
});


