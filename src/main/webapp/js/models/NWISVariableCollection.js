/* jslint browser: true */

define([
	'underscore',
	'utils/VariableParameter',
	'models/BaseVariableCollection'
], function(_, VariableParameter, BaseVariableCollection) {
	"use strict";

	var collection = BaseVariableCollection.extend({

		/*
		 * @param {Object} siteAttributes - represents this variables site. Should include siteNo property.
		 * @returns {Array of VariableParameter}
		 */
		getSelectedUrlParams : function(siteAttributes) {
			var selectedVars = this.getSelectedVariables();

			return _.map(selectedVars, function(model) {
				var varAttrs = model.attributes;
				return new VariableParameter ({
					name : 'NWIS',
					value : siteAttributes.siteNo + ':' + varAttrs.parameterCd + ':' + varAttrs.statCd,
					colName : varAttrs.name + ': ' + siteAttributes.siteNo
				});
			});
		}
	});

	return collection;
});


