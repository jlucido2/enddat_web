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
	'hbs!hb_templates/processData'
], function($, _, moment, Handlebars, datetimepicker, stickit, module, Config, $utils, BaseCollapsiblePanelView,
	VariableTsOptionView, hbTemplate) {
	"use strict";

	var BASE_URL = module.config().baseUrl;
	
	var isInArray = function(value, array) {
		return array.indexOf(value) > -1;
	};
	
	var constructClassifier = function(param) {
		var name = param.name;
		var value = param.value;
		var siteNumber = value.split(":")[0];
		var classifier = name + '--' + siteNumber;
		return classifier;
	};
	
	var organizeParams = function(params) {
		var classifiers = [];
		for (var i = 0; i < params.length; i++) {
			var paramObject = params[i];
			var paramClassifier = constructClassifier(paramObject);
			if (!isInArray(paramClassifier, classifiers)) {
				classifiers.push(paramClassifier);
			}
		}
		var masterParams = [];
		for (var j = 0; j < classifiers.length; j++) {
			var paramClassifier = classifiers[j];
			var classifierParams = [];
			for (var k = 0; k < params.length; k++) {
				var paramObject = params[k];
				var objectClassifier = constructClassifier(paramObject);
				if (objectClassifier == paramClassifier) {
					classifierParams.push(paramObject);
				}
			}
			masterParams.push(classifierParams);
		}
		return masterParams;
	};

	var getUrl = function(workflowModel, download) {
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
		if (urlLength > 200) {
			var siteOrganizedParams = organizeParams(varParams);
			var siteUrls = [];
			for (var i = 0; i < siteOrganizedParams.length; i++) {
				var siteParams = siteOrganizedParams[i];
				var siteProcessingUrl = BASE_URL + 'service/execute?' + $.param(params.concat(siteParams));
				siteUrls.push(siteProcessingUrl);
			}
		}
		else {
			siteUrls.push(dataProcessingUrl);
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
			var dataUrls = getUrl(this.model);
			var $link = this.$('.url-container');
			ev.preventDefault();
			console.log(dataUrls);
			var template = Handlebars.compile($link);
			template.html(dataUrls);
		},

		getData : function(ev) {
			ev.preventDefault();
			window.open(getUrl(this.model), '_blank');
		},

		downloadData : function(ev) {
			ev.preventDefault();
			window.location.assign(getUrl(this.model, true));
		}
	});

	return view;
});


