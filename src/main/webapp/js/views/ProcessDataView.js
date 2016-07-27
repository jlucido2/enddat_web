/* jslint browser: true */

define([
	'jquery',
	'underscore',
	'moment',
	'handlebars',
	'bootstrap-datetimepicker',
	'backbone.stickit',
	'csv',
	'filesaver',
	'module',
	'Config',
	'utils/jqueryUtils',
	'views/BaseCollapsiblePanelView',
	'views/VariableTsOptionView',
	'hbs!hb_templates/processData',
	'hbs!hb_templates/urlContainer'
], function($, _, moment, Handlebars, datetimepicker, stickit, csv, filesaver, module, Config, $utils,
	BaseCollapsiblePanelView, VariableTsOptionView, hbTemplate, urlContainerTemplate) {
	"use strict";

	var BASE_URL = module.config().baseUrl;
	
	var organizeParams = function(selectedVariables, includeUnits=false){
		var constructClassifer = function(selectedVariable) {
			var varParams = selectedVariable.get('variableParameter');
			var name = varParams.name;
			var siteNo = varParams.siteNo;
			var classifier = name + '--' + siteNo;
			return classifier;
		};
		var siteOrganizedVarModels = _.groupBy(selectedVariables, constructClassifer);
		var organizedParams = _.mapObject(siteOrganizedVarModels, function(variableModels) {
			var varParams = _.chain(variableModels)
			.map(function(variable) {
				var varParam = variable.get('variableParameter').getUrlParameters(variable.get('timeSeriesOptions'));
				if (includeUnits) {
					varParam[0].variableUnit = variable.get('variableParameter').variableUnit;
				}
				return varParam;
			})
			.flatten()
			.value();
			var latitude = variableModels[0].get('variableParameter').latitude;
			var longitude = variableModels[0].get('variableParameter').longitude;
			var elevation = variableModels[0].get('variableParameter').elevation;
			var elevationUnit = variableModels[0].get('variableParameter').elevationUnit;
			var siteName = variableModels[0].get('variableParameter').siteName;
			return { parameters : varParams,
				latitude : latitude,
				longitude : longitude,
				elevation : elevation,
				elevationUnit : elevationUnit,
				siteName : siteName
				};
		});
		return organizedParams;
	};

	var getUrls = function(workflowModel, maxUrlLength, download) {
		var attrs = workflowModel.attributes;
		var selectedVariables = workflowModel.getSelectedVariables();
		var varParams = _.chain(selectedVariables)
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
			var siteOrganizedParams = organizeParams(selectedVariables);
			// take the site organized parameters and create a url for each site,
			// then return the values from the new object as an array
			siteUrls = _.chain(siteOrganizedParams).mapObject(function(siteObject) {
				return BASE_URL + 'service/execute?' + $.param(params.concat(siteObject.parameters));
				}).value();
		}
		else {
			siteUrls = {'allSites' : dataProcessingUrl};
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
			// do the initial check for URL length when rendering after the user selects data
			this.urlLengthBtnControl();
			this.listenTo(this.model, 'change:outputDateRange', this.updateOutputDateRangeInputs);
			
			var variableModels = this.model.getSelectedVariables();
			_.each(variableModels, function(variableModel) {
				this.listenTo(variableModel, 'change', this.urlLengthBtnControl);
			},
			this);
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
			this.context.dataUrls = _.values(dataUrls);
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
			var selectedVars = this.model.getSelectedVariables();
			var organizedParams = organizeParams(selectedVars, true);
			var dataUrls = getUrls(this.model, 0); // create urls for each site regard of total URL length
			var paramKeys = _.keys(organizedParams);
			// prep the parameters to be rendered as a tsv
			_.map(paramKeys, function(paramKey) {
				// join dataUrls with organizedParams by key
				var paramUrl = dataUrls[paramKey];
				var paramVarObject = organizedParams[paramKey];
				paramVarObject.dataUrl = paramUrl;
				// make the station code easily accessible
				var stationId = paramKey.split('--')[1];
				paramVarObject.stationId = stationId;
				// make the variable information look presentable
				var varStr = _.map(paramVarObject.parameters, function(paramObject) {
					paramObject.variableName = paramObject.value.split('!')[1].split(':')[0];
					paramObject.dataSet = paramObject.name;
					var paramSubset = _.omit(paramObject, 'name', 'siteNo', 'value'); // omit redundant keys from the parameters
					// convert object key pairs to delimited strings
					var paramStr = _.chain(paramSubset).pairs().map(function(kvPair) {
						var kvPairStr = kvPair[0] + ':' + kvPair[1];
						return kvPairStr;
					}).flatten().value();
					return paramStr.join(';'); // join metadata from the same site together with a semi-colon
				});
				paramVarObject.variables = varStr.join('||'); // join site metadata together using a double-pipe
				delete paramVarObject.parameters; // a bit nebulous and redundant... variable information is held in the variable property
			});
			var organizedValues = _.values(organizedParams);
			var encoded = csv.encode(organizedValues, '\t');
			var file = new File([encoded], 'sitemetadata.tsv', {type: 'type/tab-separated-values'});
			saveAs(file);
		}
	});

	return view;
});


