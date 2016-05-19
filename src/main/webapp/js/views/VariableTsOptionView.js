/* jslint browser: true */

define([
	'jquery',
	'bootstrap',
	'views/BaseView',
	'hbs!hb_templates/timeSeriesOptionsPopup',
	'hbs!hb_templates/selectedVariableTsOptions'
], function($, bootstrap, BaseView, popoverTemplate, selectedVariableTsOptions) {
	"use strict";

	var TIME_SERIES_OPTIONS = [
		{statName : 'raw', statTitle : 'Raw data', checked: true, timeSpanRequired : false},
		{statName : 'Min', statTitle : 'Minimum', checked: false, timeSpanRequired : true},
		{statName : 'Max', statTitle : 'Maximum', checked: false, timeSpanRequired : true},
		{statName : 'Sum', statTitle : 'Summation', checked: false, timeSpanRequired : true},
		{statName : 'Diff', statTitle : 'Difference', checked: false, timeSpanRequired : true},
		{statName : 'MaxDifference', statTitle : 'Max Difference', checked: false, timeSpanRequired : true},
		{statName : 'StDev', statTitle : 'Standard Deviation', checked: false, timeSpanRequired : true}
	];

	/*
	 * @constructs
	 * @param {Object} options
	 *		@prop {Jquery selector or element} el
	 *		@prop {Backbone.Model representing a variable}
	 */
	var view = BaseView.extend({

		template : selectedVariableTsOptions,

		event : {
			'click .add-ts-btn' : 'changeTimeSeriesOptions'
		},

		render : function() {
			this.context = this.model.attributes;
			this.context.id = this.model.cid;
			BaseView.prototype.render.apply(this, arguments);

			//Set up time series popovers
			$('.add-ts-btn').each(function() {
				$(this).popover({
					placement : 'right',
					title : 'Select Time Series Processing Options',
					html : true,
					content : popoverTemplate({
						timeSeriesOptions : TIME_SERIES_OPTIONS,
						variableModelId : $(this).data('id')
					})
				});
			});

			this.listenTo(this.model, 'change:timeSeriesOptions', this.updateTimeSeriesOptions);
			return this;
		},

		/*
		 * Model event listeners
		 */

		updateTimeSeriesOptions : function() {
			this.$el.remove('div');
			this.render();
		},

		/*
		 * DOM event handlers
		 */

		changeTimeSeriesOptions : function(ev) {
			var $popover = $(ev.currentTarget).parent();
			var timeSeriesOptions = [];
			$popover.find('input:checked').each(function() {
				var $timeSpan = $(this).parents('.ts-option-div').find('.time-span-input');
				var tsOption = {statistics : $(this.val())};
				if ($timeSpan.length > 0) {
					tsOption.timeSpan = $timeSpan.val();
				}
				timeSeriesOptions.push(tsOption);
			});
			this.model.set('timeSeriesOptions', timeSeriesOptions);
		}
	});

	return view;
});

