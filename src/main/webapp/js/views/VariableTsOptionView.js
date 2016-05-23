/* jslint browser: true */

define([
	'jquery',
	'underscore',
	'bootstrap',
	'views/BaseView',
	'hbs!hb_templates/timeSeriesOptionsPopup',
	'hbs!hb_templates/selectedVariableTsOptions'
], function($, _, bootstrap, BaseView, popoverTemplate, selectedVariableTsOptions) {
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

		template : selectedVariableTsOptions,

		render : function() {
			var self = this;
			this.context = this.model.attributes;
			this.context.id = this.model.cid;
			BaseView.prototype.render.apply(this, arguments);

			//Set up time series popovers
			$('.add-ts-btn').each(function() {
				var popupContext = _.map(TIME_SERIES_CONTEXT, function(tsContext) {
					var tsOption = _.find(self.context.timeSeriesOptions, function(thisOption) {
						return thisOption.statistic === tsContext.statName;
					});
					var result;
					if (tsOption) {
						result = _.extend({checked : true, timeSpan : tsOption.timeSpan}, tsContext);
					}
					else {
						result = tsContext;
					}
					return result;
				});

				$(this).popover({
					placement : 'right',
					title : 'Select Time Series Processing Options',
					html : true,
					content : popoverTemplate({
						timeSeriesOptions : popupContext,
						variableModelId : $(this).data('id')
					})
				});
				$(this).on('shown.bs.popover', function() {
					self.$('.update-time-series').click(function(ev) {
						self.changeTimeSeriesOptions(ev);
					});
				});
			});

			this.listenTo(this.model, 'change:timeSeriesOptions', this.updateTimeSeriesOptions);
			return this;
		},

		/*
		 * Model event listeners
		 */

		updateTimeSeriesOptions : function() {
			this.$el.find('>div').remove();
			this.render();
		},

		/*
		 * DOM event handlers
		 */

		changeTimeSeriesOptions : function(ev) {
			console.log('In changeTimeSeriesOptions');
			var $popover = $(ev.currentTarget).parent();
			var timeSeriesOptions = [];

			$popover.find('input:checked').each(function() {
				var $timeSpan = $(this).parents('.ts-option-div').find('.time-span-input');
				var tsOption = {statistic : $(this).val()};
				if ($timeSpan.length > 0) {
					tsOption.timeSpan = $timeSpan.val();
				}
				timeSeriesOptions.push(tsOption);
			});
			this.model.set('timeSeriesOptions', timeSeriesOptions);

			this.$('.add-ts-btn').popover('hide');
		}
	});

	return view;
});

