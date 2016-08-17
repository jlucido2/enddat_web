/* jslint browser: true */

define([
	'jquery',
	'underscore',
	'blueimp-file-upload',
	'moment',
	'handlebars',
	'bootstrap-datetimepicker',
	'backbone.stickit',
	'csv',
	'filesaver',
	'module',
	'Config',
	'utils/jqueryUtils',
	'views/AlertView',
	'views/BaseCollapsiblePanelView',
	'views/VariableTsOptionView',
	'hbs!hb_templates/processData',
	'hbs!hb_templates/urlContainer'
], function($, _, $fileUpload, moment, Handlebars, datetimepicker, stickit, csv, filesaver, module, Config, $utils,
	AlertView, BaseCollapsiblePanelView, VariableTsOptionView, hbTemplate, urlContainerTemplate) {
	"use strict";

	var BASE_URL = module.config().baseUrl;

	var TSV_HEADERS = [
       'dataset',
       'siteNo',
       'siteName',
       'longitude',
       'latitude',
       'elevation',
       'elevationUnit',
       'variables',
       'url'
   ];
	/*
	 * @returns {Array of objects} - an array of URL parameters
	 */
	var buildParams = function(workflowModel) {
		var attrs = workflowModel.attributes;
		var params = [
  			{name : 'style', value : attrs.outputFileFormat},
  			{name : 'DateFormat', value : attrs.outputDateFormat},
  			{name : 'TZ', value : attrs.outputTimeZone},
  			{name : 'fill', value : attrs.outputMissingValue}
		];
		if (workflowModel.has('timeFilterId') && (attrs.timeFilterId)) {
			params.push({name : 'filterId', value : attrs.timeFilterId});
			params.push({name : 'timeInt', value : attrs.outputTimeGapInterval});
		}
		else {
			params.push({name : 'beginPosition', value : attrs.outputDateRange.start.format(Config.DATE_FORMAT)});
			params.push({name : 'endPosition', value : attrs.outputDateRange.end.format(Config.DATE_FORMAT)});
		}
		return params;
	};

	/*
	 * @return {String} - URL for a single site
	 */

	var getSiteUrl = function(workflowModel, siteModel, download) {
		var siteDataset = siteModel.get('datasetName');
		var siteVariables = siteModel.get('variables');
		var selectedVariables = siteVariables.getSelectedVariables();
		var varParams = _.chain(selectedVariables)
			.map(function(variable) {
				return variable.get('variableParameter').getUrlParameters(variable.get('timeSeriesOptions'));
			})
			.flatten()
			.value();
		var params = buildParams(workflowModel);

		if (siteDataset === Config.GLCFS_DATASET) {
			var glcfsLake = workflowModel.get('datasetCollections')[Config.GLCFS_DATASET].getLake();
			params.push({name: 'Lake', value : glcfsLake.toLowerCase()});
		}
		if (download) {
			params.push({name : 'download', value: 'true'});
		}
		var dataProcessingUrl = BASE_URL + 'service/execute?' + $.param(params.concat(varParams));
		return dataProcessingUrl;
	};

	var getUrls = function(workflowModel, maxUrlLength, download) {
		var selectedVariables = workflowModel.getSelectedVariables();
		var varParams = _.chain(selectedVariables)
			.map(function(variable) {
				return variable.get('variableParameter').getUrlParameters(variable.get('timeSeriesOptions'));
			})
			.flatten()
			.value();

		var glcfsLake = workflowModel.get('datasetCollections')[Config.GLCFS_DATASET].getLake();

		var params = buildParams(workflowModel);

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
			var sitesWithSelectedVariables = _.flatten(workflowModel.getSitesWithSelectedVariables());
			siteUrls = _.map(sitesWithSelectedVariables, function(siteWithSelectedVariable) {
				return getSiteUrl(workflowModel, siteWithSelectedVariable, download);
			});
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
			'click .download-site-metadata' : 'provideMetadata',
			//To set the model value from a datetimepicker, hand
			'dp.change #output-start-date-div' : 'changeOutputStartDate',
			'dp.change #output-end-date-div' : 'changeOutputEndDate'
		},

		bindings: {
			'#output-date-format-input' : 'outputDateFormat',
			'#time-filter-id-input' : 'timeFilterId',
			'#output-time-zone-input' : 'outputTimeZone',
			'#acceptable-data-gap-input' : 'outputTimeGapInterval',
			'#output-file-format-input' : 'outputFileFormat',
			'#missing-value-input' : 'outputMissingValue'
		},

		initialize : function(options) {
			BaseCollapsiblePanelView.prototype.initialize.apply(this, arguments);
			this.maxUrlLength = options.maxUrlLength ? options.maxUrlLength : 2000; // max url character length before it gets broken down into urls by site
			this.alertFilterFileView = new AlertView({
				el : '.time-filter-file-alert-container'
			});
		},


		render : function() {
			var self = this;
			var selectedVarsDateRange = this.model.getSelectedVarsDateRange();
			var outputDateRange = this.model.get('outputDateRange');
			var selectedVariableModels = this.model.getSelectedVariables();
			var $tbody;

			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			this.stickit();
			// do the initial check for URL length when rendering after the user selects data
			this.urlLengthBtnControl();

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

				self.listenTo(variableModel, 'change', self.urlLengthBtnControl);
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

			// Set up file uploader
			this.alertFilterFileView.setElement('.time-filter-file-alert-container');
			this._createFileUploader(this.$('#time-filter-file-input'));

			return this;
		},

		_createFileUploader : function($fileUploaderInput) {
			var self = this;
			var filename;

			$fileUploaderInput.fileupload({
				url : 'timeFilterFileUpload',
				type : 'POST',
				dataType : 'json',
				send : function(e, data) {
					filename = data.files[0].name;
					data.url = data.url + '?qqfile=' + filename + '&tz=' + self.$('#time-filter-timezone-input').val();
				},
				done : function(e, data) {
					self.$('#time-filter-id-input').val(data.fileId);
				},
				fail : function() {
					self.alertFilterFileView.showDangerAlert('Unable to upload time filter file');
				}
			});
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

		urlLengthBtnControl : function() {
			var $message = this.$('#disabled-btn-msg');
			var dataUrls = getUrls(this.model, this.maxUrlLength);
			var $getDataBtn = this.$('.get-data-btn');
			var $downloadBtn = this.$('.download-data-btn');
			if (dataUrls.length > 1) {
				$getDataBtn.prop("disabled", true);
				$downloadBtn.prop("disabled", true);
				var $messageText = ("The get data buttons have been disabled because the URL for the selected variables exceeds "
						+ this.maxUrlLength +
						" characters.");
				$message.html($messageText);
			}
			else {
				$getDataBtn.prop("disabled", false);
				$downloadBtn.prop("disabled", false);
				$message.html('');
			}
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
			var $message = this.$('#url-container-msg');
			if (dataUrls.length > 1) {
				var messageText = ("The URL for data processing exceeds "
						+ this.maxUrlLength +
						" characters. A single URL has been provided for each selected station.");
				// display a message
				$message.html(messageText);
			}
			else {
				// clear the message
				$message.html('');
			}
		},

		getData : function(ev) {
			ev.preventDefault();
			window.open(getUrls(this.model, this.maxUrlLength)[0], '_blank'); // grab first item in the array
		},

		downloadData : function(ev) {
			ev.preventDefault();
			window.location.assign(getUrls(this.model, this.maxUrlLength, true)[0]); // grab first item in the array
		},

		provideMetadata : function(ev) {
			var workflowModel = this.model;
			var sitesWithSelectedVariables = workflowModel.getSitesWithSelectedVariables();
			var selectedSiteMetadata = _.map(sitesWithSelectedVariables, function(siteWithSelectedVariables) {
				var siteDataset = siteWithSelectedVariables.get('datasetName');
				var siteNo = siteWithSelectedVariables.get('siteNo');
				var siteName = siteWithSelectedVariables.get('name');
				var siteLon = siteWithSelectedVariables.get('lon');
				var siteLat = siteWithSelectedVariables.get('lat');
				var siteElevation = siteWithSelectedVariables.get('elevation');
				var siteElevationUnit = siteWithSelectedVariables.get('elevationUnit');
				var siteVariables = siteWithSelectedVariables.get('variables');
				var selectedVariables = siteVariables.getSelectedVariables();
				var siteVariableMetadata = _.map(selectedVariables, function(selectedVariable) {
					var variableName = '';
					if (selectedVariable.has('name')) {
						variableName = selectedVariable.get('name');
					}
					else {
						variableName = selectedVariable.get('description');
					}
					var variableUnit = selectedVariable.get('variableUnit');
					var variableDataStr = 'variableName:' + variableName + ';variableUnit:' + variableUnit;
					return variableDataStr;
				})
				.join('||');
				var siteUrl = getSiteUrl(workflowModel, siteWithSelectedVariables);
				var data = [
		            siteDataset,
		            siteNo,
		            siteName,
		            siteLon,
		            siteLat,
		            siteElevation,
		            siteElevationUnit,
		            siteVariableMetadata,
		            siteUrl
	            ];
				var result = _.object(TSV_HEADERS, data);
				return result;
			});
			var encoded = csv.encode(selectedSiteMetadata, '\t');
			var blob = new Blob([encoded], {type : 'tab-separated-values'});
			saveAs(blob, 'sitemetadata.tsv');
		}
	});

	return view;
});


