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
	
	var organizeVariables = function(selectedVariables) {
		var siteNo = '';
		var constructClassifer = function(selectedVariable) {
			var varParams = selectedVariable.get('variableParameter');
			var name = varParams.name;
			if (name === Config.PRECIP_DATASET) {
				siteNo = varParams.site_id;
			}
			else {
				siteNo = varParams.siteNo;
			}
			var classifier = name + '--' + siteNo;
			return classifier;
		};
		var siteOrganizedVarModels = _.groupBy(selectedVariables, constructClassifer);
		return siteOrganizedVarModels;
	};
	
	var organizeParamsBySite = function(organizedVariables) {
		var organizedParams = _.mapObject(organizedVariables, function(siteVariables) {
			var siteVariableParameters = _.map(siteVariables, function(siteVariable) {
				return siteVariable.get('variableParameter').getUrlParameters(siteVariable.get('timeSeriesOptions'));
			});
			return _.flatten(siteVariableParameters);
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

		var glcfsLake = workflowModel.get('datasetCollections')[Config.GLCFS_DATASET].getLake() ? glcfsLake : false;

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
			var siteOrganizedVariables = organizeVariables(selectedVariables);
			var siteOrganizedParams = organizeParamsBySite(siteOrganizedVariables);
			console.log(siteOrganizedParams);
			// take the site organized parameters and create a url for each site,
			// then return the values from the new object as an array
			siteUrls = _.chain(siteOrganizedParams).mapObject(function(siteParams) {
				return BASE_URL + 'service/execute?' + $.param(params.concat(siteParams));
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
			this.maxUrlLength = options.maxUrlLength ? options.maxUrlLength : 150; // max url character length before it gets broken down into urls by site
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
			var dataUrls = _.values(getUrls(this.model, this.maxUrlLength));
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
			var dataUrls = _.values(getUrls(this.model, this.maxUrlLength));


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
			window.open(_.values(getUrls(this.model, this.maxUrlLength))[0], '_blank'); // grab first item in the array
		},

		downloadData : function(ev) {
			ev.preventDefault();
			window.location.assign(_.values(getUrls(this.model, this.maxUrlLength, true))[0]); // grab first item in the array
		},
		
		provideMetadata : function(ev) {
			var sitesWithSelectedVariables = this.model.getSitesWithSelectedVariables();
			var siteIdentifiers = _.map(sitesWithSelectedVariables, function(siteModel) {
				return siteModel.get('datasetName') + '--' + siteModel.get('siteNo');
			});
			var organizedSites = _.object(siteIdentifiers, sitesWithSelectedVariables);
			var selectedVariables = this.model.getSelectedVariables();
			var organizedVariables = organizeVariables(selectedVariables);
			var organizedParams = organizeParamsBySite(organizedVariables);
			var dataUrls = getUrls(this.model, 0);
			var paramKeys = _.keys(organizedParams);
			var output = _.map(paramKeys, function(paramKey) {
				var siteModel = organizedSites[paramKey];
				var siteVariables = organizedVariables[paramKey];
				// get data URL
				var siteUrl = dataUrls[paramKey];
				// get site metadata
				var siteDataset = siteModel.get('datasetName');
				var siteName = siteModel.get('name');
				var siteNo = siteModel.get('siteNo');
				var siteLat = siteModel.get('lat');
				var siteLon = siteModel.get('lon');
				var siteElevation = siteModel.get('elevation');
				var siteElevationUnit = siteModel.get('elevationUnit');
				// get variable metadata
				var varMetadata = _.map(siteVariables, function(siteVariable) {
					var variableName = siteVariable.get('name') ? variableName : siteVariable.get('description');
					var variableUnit = siteVariable.get('variableUnit');
					var variableDataStr = 'variableName:' + variableName + ';variableUnit:' + variableUnit;
					return variableDataStr;
				})
				.join('||');
				var headers = ['dataset',
				               'siteNo',
				               'siteName',
				               'longitude',
				               'latitude',
				               'elevation',
				               'elevationUnit',
				               'variables',
				               'url'
				               ];
				var data = [siteDataset,
				            siteNo,
				            siteName,
				            siteLon,
				            siteLat,
				            siteElevation,
				            siteElevationUnit,
				            varMetadata,
				            siteUrl
				            ];
				return _.object(headers, data);
			});
			var encoded = csv.encode(output, '\t')
			var blob = new Blob([encoded], {type : 'tab-separated-values'});
			saveAs(blob, 'sitemetadata.tsv');
		}
	});

	return view;
});


