/* jslint browser: true */

define([
	'underscore',
	'models/BaseVariableCollection'
], function(_, BaseVariableCollection) {

	var variableId = 'precip3';
	var variableName = 'Total precip - 1 hr';

	/*
	 * @constructs
	 * models contain properties for x, y, startDate, endDate, and optional selected
	 */
	var collection = BaseVariableCollection.extend({

		getSelectedUrlParams : function(timeBounds) {
			var selectedVars = this.getSelectedVariables();
			return _.map(selectedVars, function(model) {
				var attrs = model.attributes;
				return {
					name : 'Precip',
					value : attrs.y + ':' + attrs.x + ':' +
						timeBounds + ':' + variableId + '!' + variableName +
						' [' + attrs.y + ',' + attrs.x + ']'
				};
			});
		}
	});

	return collection;
});

