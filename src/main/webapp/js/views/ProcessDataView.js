/* jslint browser: true */

define([
	'jquery',
	'underscore',
	'moment',
	'handlebars',
	'bootstrap-datetimepicker',
	'backbone.stickit',
	'module',
	'Config',
	'utils/jqueryUtils',
	'views/BaseCollapsiblePanelView',
	'views/VariableTsOptionView',
	'hbs!hb_templates/processData',
	'hbs!hb_templates/urlContainer'
], function($, _, moment, Handlebars, datetimepicker, stickit, module, Config, $utils, BaseCollapsiblePanelView,
	VariableTsOptionView, hbTemplate, urlContainer) {
	"use strict";

	var BASE_URL = module.config().baseUrl;
	
	var URL_LENGTH = 2000; // max url character length before it gets broken down into urls by site
	
	var constructClassifier = function(param) {
		var name = param.name;
		var siteNo = param.siteNo;
		var classifier = name + '--' + siteNo;  // make a simple string to identify each dataset type and site number pair
		return classifier;
	};
	
	var organizeParams = function(params) {
		// build list of identifying site type and number pairs
		var classifiers = _.uniq(_.map(params, constructClassifier));
		var masterParams = [];
		// organize parameters by their sites
		for (var i = 0; i < classifiers.length; i++) {
			var paramClassifier = classifiers[i];
			// make a list for parameters that fall into a specific dataset/site pair
			var classifierParams = _.filter(params, function(param) {return constructClassifier(param) == paramClassifier});
			masterParams.push(classifierParams);
		}
		return masterParams;
	};

	var getUrls = function(workflowModel, download) {
		var attrs = workflowModel.attributes;
		var varParams = _.chain(workflowModel.getSelectedVariables())
			.map(function(variable) {
				return variable.get('variableParameter').getUrlParameters(variable.get('timeSeriesOptions'));
			})
			.flatten()
			.value();

		var params = [
			{name : 'style', value : attrs.outputFileFormat},
			{name : 'DateFormat', value : attrs.outputDateFormat},
			{name : 'TZ', value : attrs.outputTimeZone},
			{name : 'timeInt', value : attrs.outputTimeGapInterval},
			{name : 'fill', value : attrs.outputMissingValue},
			{name : 'beginPosition', value : attrs.outputDateRange.start.format(Config.DATE_FORMAT)},
			{name : 'endPosition', value : attrs.outputDateRange.end.format(Config.DATE_FORMAT)}
		];
		if (download) {
			params.push({name : 'download', value: 'true'});
		}
		var dataProcessingUrl = BASE_URL + 'service/execute?' + $.param(params.concat(varParams));
		var urlLength = dataProcessingUrl.length;
		if (urlLength > URL_LENGTH) {
			var siteOrganizedParams = organizeParams(varParams);
			var siteUrls = _.map(siteOrganizedParams, function(siteParams) {return BASE_URL + 'service/execute?' + $.param(params.concat(siteParams))});
		}
		else {
			siteUrls = [dataProcessingUrl];
		}
		return siteUrls;
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
			'click .download-data-btn' : 'downloadData',
			//To set the model value from a datetimepicker, hand
			'dp.change #output-start-date-div' : 'changeOutputStartDate',
			'dp.change #output-end-date-div' : 'changeOutputEndDate'
		},

		bindings: {
			'#output-date-format-input' : 'outputDateFormat',
			'#output-time-zone-input' : 'outputTimeZone',
			'#acceptable-data-gap-input' : 'outputTimeGapInterval',
			'#output-file-format-input' : 'outputFileFormat',
			'#missing-value-input' : 'outputMissingValue'
		},

		render : function() {
			var self = this;
			var selectedVarsDateRange = this.model.getSelectedVarsDateRange();
			var outputDateRange = this.model.get('outputDateRange');
			var selectedVariableModels = this.model.getSelectedVariables();
			var $tbody;

			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			this.stickit();
			$tbody = this.$('tbody');
			this.variableTsOptionViews = [];
			_.each(selectedVariableModels, function(variableModel) {
				var $newRow = $('<tr />');
				var optionView = new VariableTsOptionView({
					el : $newRow,
					model : variableModel
				});

				$tbody.append($newRow);
				optionView.render();
				self.variableTsOptionViews.push(optionView);
			});

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

		remove : function() {
			_.each(this.variableTsOptionViews, function(view) {
				view.remove();
			});
			this.variableTsOptionViews = undefined;
			BaseCollapsiblePanelView.prototype.remove.apply(this, arguments);
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
			var dataUrls = getUrls(this.model);
			ev.preventDefault();
			this.context.dataUrls = dataUrls;
			var template = urlContainer;
			$('.url-container').html(template({dataUrls : dataUrls})); // render content in the url-container div
			var $getDataBtn = this.$('.get-data-btn');
			var $downloadBtn = this.$('.download-data-btn');
			var $message = this.$('.warning-msg');
			if (dataUrls.length > 1) {
				var messageText = "The URL for data processing exceeds the character limit. A single URL has been provided for each selected station.";
				// display a message
				$message.html(messageText);
				// disable "Get data" and "Download" buttons
				$getDataBtn.prop("disabled", true);
				$downloadBtn.prop("disabled", true);
			}
			else {
				// clear the message
				$message.html('');
				// enable "Get data" and "Download" buttons
				$getDataBtn.prop("disabled", false);
				$downloadBtn.prop("disabled", false);
			}
		},

		getData : function(ev) {
			ev.preventDefault();
			window.open(getUrls(this.model), '_blank');
		},

		downloadData : function(ev) {
			ev.preventDefault();
			window.location.assign(getUrls(this.model, true));
		}
	});

	return view;
});


