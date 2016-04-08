/* jslint browser: true */

define([
	'underscore',
	'backbone',
	'utils/dateUtils'
], function(_, Backbone, dateUtils) {

	var model = Backbone.Collection.extend({

		getModelsWithinDateFilter : function(startDate, endDate) {
			var dateFilter;
			var result;

			if ((startDate) && (endDate)) {
				dateFilter = {
					start : new Date(startDate),
					end : new Date(endDate)
				};
				result = this.filter(function(model) {
					var modelDateRange = {
						start : new Date(model.get('startDate')),
						end : new Date(model.get('endDate'))
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


