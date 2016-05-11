/* jslint browser: true */

define([
	'underscore',
	'models/BaseVariableCollection'
], function(_, BaseVariableCollection) {


	var collection = BaseVariableCollection.extend({

		getSelectedUrlParams : function(siteAttributes) {
			var selectedVars = this.getSelectedVariables();

			return _.map(selectedVars, function(model) {
				var varAttrs = model.attributes;
				return {
					name : 'NWIS',
					value : siteAttributes.siteNo + ':' + varAttrs.parameterCd + ':' + varAttrs.statCd +
						'!' + varAttrs.name + ': ' + siteAttributes.siteNo
				};
			});
		}
	});

	return collection;
});


