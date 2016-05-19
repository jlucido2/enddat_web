/* jslint browser: true */

define([
	'underscore',
	'backbone',
	'utils/VariableParameter',
	'models/BaseVariableCollection'
], function(_, Backbone, VariableParameter, BaseVariableCollection) {
	"use strict";

	var variableId = 'precip3';
	var variableName = 'Total precip - 1 hr';

	var VariableModel = Backbone.Model.extend({
		getVariableParameter : function() {
			var attrs = this.attributes;
			return new VariableParameter({
				name : 'Precip',
				value : attrs.y + ':' + attrs.x + ':' + timeBounds + ':' + variableId,
				colName : variableName + ' [' + attrs.y + ',' + attrs.x + ']',
			});
		}
	});

	/*
	 * @constructs
	 * models contain properties for x, y, startDate, endDate, and optional selected
	 */
	var collection = BaseVariableCollection.extend({
		model : VariableModel
	});

	return collection;
});

