/* jslint browser: true */

define([
	'underscore',
	'models/BaseVariableCollection'
], function(_, BaseVariableCollection) {
	"use strict";

	var collection = BaseVariableCollection.extend({

		getSelectedUrlParams : function(siteAttributes) {
			var selectedVars = this.getSelectedVariables();

			return _.map(selectedVars, function(model) {
				var varAttrs = model.attributes;
				return {
					name : 'NWIS',
					value : siteAttributes.siteNo + ':' + varAttrs.parameterCd + ':' + varAttrs.statCd,
					colName : varAttrs.name + ': ' + siteAttributes.siteNo
				};
			});
		}
	});

	return collection;
});


