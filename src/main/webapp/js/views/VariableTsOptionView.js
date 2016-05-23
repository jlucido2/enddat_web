/* jslint browser: true */

define([
	'jquery',
	'underscore',
	'views/BaseView',
	'hbs!hb_templates/timeSeriesOptionsPopup',
	'hbs!hb_templates/selectedVariableTsOptions'
], function($, _, BaseView, popoverTemplate, selectedVariableTsOptions) {
	"use strict";

	var TIME_SERIES_CONTEXT = [
		{statName : 'raw', statTitle : 'Raw data', timeSpanRequired : false},
		{statName : 'Min', statTitle : 'Minimum', timeSpanRequired : true},
		{statName : 'Max', statTitle : 'Maximum', timeSpanRequired : true},
		{statName : 'Sum', statTitle : 'Summation', timeSpanRequired : true},
		{statName : 'Diff', statTitle : 'Difference', timeSpanRequired : true},
		{statName : 'MaxDifference', statTitle : 'Max Difference', timeSpanRequired : true},
		{statName : 'StDev', statTitle : 'Standard Deviation', timeSpanRequired : true}
	];

	/*
	 * @constructs
	 * @param {Object} options
	 *		@prop {Jquery selector or element} el
	 *		@prop {Backbone.Model representing a variable}
	 */
	var view = BaseView.extend({

		events : {
			'change input' : 'changeTimeSeriesOptions'
		},

		template : selectedVariableTsOptions,

		render : function() {
			this.context.id = this.model.cid;
			this.context.variableParameter = this.model.attributes.variableParameter;
			BaseView.prototype.render.apply(this, arguments);

			this.updateTimeSeriesOptions(this.model, this.model.get('timeSeriesOptions'));
			this.listenTo(this.model, 'change:timeSeriesOptions', this.updateTimeSeriesOptions);
			return this;
		},

		/*
		 * Model event listeners
		 */

		updateTimeSeriesOptions : function(model, timeSeriesOptions) {
			var $tsInputs = this.$('input');

			$tsInputs.each(function() {
				var stat = $(this).attr('name');
				var statTsOption = _.find(timeSeriesOptions, function(tsOption) {
					return tsOption.statistic === stat;
				});
				if (stat === 'raw') {
					$(this).prop('checked', (statTsOption));
				}
				else {
					$(this).val((statTsOption) ? statTsOption.timeSpan : '');
				}
			});
		},

		/*
		 * DOM event handlers
		 */

		changeTimeSeriesOptions : function(ev) {
			var newTimeSeriesOptions = _.clone(this.model.get('timeSeriesOptions'));
			var $input = $(ev.currentTarget);
			var stat = $input.attr('name');
			var val = $input.val();
			var isStat = function(tsOption) {
				return tsOption.statistic === stat;
			};
			var thisTsOption = _.find(newTimeSeriesOptions, isStat);

			newTimeSeriesOptions = _.reject(newTimeSeriesOptions, isStat);
			if (stat === 'raw') {
				if ($input.is(':checked')) {
					newTimeSeriesOptions.push({'statistic' : 'raw'});
				}
			}
			else {
				newTimeSeriesOptions.push({
					statistic : stat,
					timeSpan : val
				});
			}

			this.model.set('timeSeriesOptions', newTimeSeriesOptions);
		}
	});

	return view;
});

