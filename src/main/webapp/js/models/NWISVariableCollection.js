/* jslint browser: true */

define([
	'underscore',
	'models/BaseVariableCollection'
], function(_, BaseVariableCollection) {


	var collection = BaseVariableCollection.extend({

		selectedUrlParams : function(siteNo) {
			var selectedVars = this.getSelectedVariables();

			return _.map(selectedVars, function(model) {
				var attrs = model.attributes;
				return {
					name : 'NWIS',
					value : siteNo + ':' + attrs.parameterCd + ':' + attrs.statCd +
						'!' + attrs.name + ': ' + siteNo
				};
			});
		}
	});

	return collection;
});


