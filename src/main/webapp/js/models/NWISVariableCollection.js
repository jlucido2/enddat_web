/* jslint browser: true */

define([
	'underscore',
	'models/BaseVariableCollection'
], function(_, BaseVariableCollection) {


	var collection = BaseVariableCollection.extend({

		selectedUrlParams : function() {
			var selectedVars = this.getSelectedVariables();

			return _.map(selectedVars, function(model) {
				var attrs = model.attributes;
				return {
					name : 'NWIS',
					value : attrs.siteNo + ':' + attrs.parameterCd + ':' + attrs.statCd +
						'!' + attrs.name + ': ' + attrs.siteNo
				};
			});
		}
	});

	return collection;
});


