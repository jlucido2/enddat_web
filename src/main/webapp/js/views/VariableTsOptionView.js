/* jslint browser: true */

define([
	'jquery',
	'underscore',
	'views/BaseView',
	'hbs!hb_templates/selectedVariableTsOptions'
], function($, _, BaseView, selectedVariableTsOptions) {
	"use strict";

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
				var statTsOptions = _.filter(timeSeriesOptions, function(tsOption) {
					return tsOption.statistic === stat;
				});
				if (stat === 'raw') {
					$(this).prop('checked', (statTsOptions.length > 0) ? true : false);
				}
				else {
					$(this).val((statTsOptions.length > 0) ? _.pluck(statTsOptions, 'timeSpan').join(', ') : '');
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
			var isThisStat = function(tsOption) {
				return tsOption.statistic === stat;
			};

			// Remove the time series option that change from the array if it is present
			newTimeSeriesOptions = _.reject(newTimeSeriesOptions, isThisStat);

			//Update the timeSeriesOption if it is now active
			if (stat === 'raw') {
				if ($input.is(':checked')) {
					newTimeSeriesOptions.push({'statistic' : 'raw'});
				}
			}
			else if (val) {
				_.each(val.split(','), function(timeSpan) {
					newTimeSeriesOptions.push({
						statistic : stat,
						timeSpan : timeSpan.trim()
					});
				});
			}

			this.model.set('timeSeriesOptions', newTimeSeriesOptions);
		}
	});

	return view;
});

