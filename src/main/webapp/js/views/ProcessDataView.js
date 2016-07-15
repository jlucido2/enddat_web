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
	VariableTsOptionView, hbTemplate, urlContainerTemplate) {
	"use strict";

	var BASE_URL = module.config().baseUrl;

	var organizeParams = function(params) {
		var constructClassifier = function(param) {
				var name = param.name;
				var siteNo = param.siteNo;
				var classifier = name + '--' + siteNo;  // make a simple string to identify each dataset type and site number pair
				return classifier;
			};
		// make an object containing of parameters for each site
		// e.g. {site1 : [parameters for site 1], site2 : [parameters for site2], ...}
		var masterParams = _.groupBy(params, constructClassifier);
		return masterParams;
	};

	var getUrls = function(workflowModel, maxUrlLength, download) {
		var attrs = workflowModel.attributes;
		var varParams = _.chain(workflowModel.getSelectedVariables())
			.map(function(variable) {
				return variable.get('variableParameter').getUrlParameters(variable.get('timeSeriesOptions'));
			})
			.flatten()
			.value();

		var glcfsLake = workflowModel.get('datasetCollections')[Config.GLCFS_DATASET].getLake();

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
		// The Lake parameter will be added even if no GLCFS variables are selected but the dataset has been chosen.
		if (glcfsLake) {
			params.push({name: 'Lake', value : glcfsLake.toLowerCase()});
		}
		var dataProcessingUrl = BASE_URL + 'service/execute?' + $.param(params.concat(varParams));
		var urlLength = dataProcessingUrl.length;
		var siteUrls;
		if (urlLength > maxUrlLength) {
			var siteOrganizedParams = organizeParams(varParams);
			// take the site organizied parameters and create a url for each site,
			// then return the values from the new object as an array
			siteUrls = _.chain(siteOrganizedParams).mapObject(function(siteParams) {
				return BASE_URL + 'service/execute?' + $.param(params.concat(siteParams));
				}).values().value();
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

		initialize : function(options) {
			BaseCollapsiblePanelView.prototype.initialize.apply(this, arguments);
			this.maxUrlLength = options.maxUrlLength ? options.maxUrlLength : 2000; // max url character length before it gets broken down into urls by site
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
			var dataUrls = getUrls(this.model, this.maxUrlLength);
			ev.preventDefault();
			this.context.dataUrls = dataUrls;
			$('.url-container').html(urlContainerTemplate({dataUrls : dataUrls})); // render content in the url-container div
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
			window.open(getUrls(this.model, this.maxUrlLength)[0], '_blank'); // grab first item in the array
		},

		downloadData : function(ev) {
			ev.preventDefault();
			window.location.assign(getUrls(this.model, this.maxUrlLength, true)[0]); // grab first item in the array
		}
	});

	return view;
});


