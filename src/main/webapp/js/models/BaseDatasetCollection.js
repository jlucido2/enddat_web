/* jslint browser: true */

define([
	'underscore',
	'backbone',
	'utils/dateUtils'
], function(_, Backbone, dateUtils) {

	var model = Backbone.Collection.extend({


		/*
		 * The startDate and endDate values in each model are assumed to be moment objects
		 * @param {Moment} startDate
		 * @param {Moment} endDate
		 * @returns {Array of Backbone.Model} whose startDate and endDate range overlaps the function parameters.
		 *		If startDate or endDate are falsy, all of the models in the collection are returned.
		 */
		getModelsWithinDateFilter : function(startDate, endDate) {
			var dateFilter;
			var result;

			if ((startDate) && (endDate)) {
				dateFilter = {
					start : startDate,
					end : endDate
				};
				result = this.filter(function(model) {
					var modelDateRange = {
						start : model.get('startDate'),
						end : model.get('endDate')
					};
					return dateUtils.dateRangeOverlaps(modelDateRange, dateFilter);
				});
			}
			else {
				result = this.toArray();
			}

			return result;
		}
	});

	return model;
});


