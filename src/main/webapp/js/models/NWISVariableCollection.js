/* jslint browser: true */

define([
	'underscore',
	'backbone',
	'utils/VariableParameter',
	'models/BaseVariableCollection'
], function(_, VariableParameter, BaseVariableCollection) {
	"use strict";

	var VariableModel = Backbone.Model.extend({
		getVariableParameter : function() {
			var attrs = this.attributes;
			return new VariableParameter ({
				name : 'NWIS',
				value : siteAttributes.siteNo + ':' + varAttrs.parameterCd + ':' + varAttrs.statCd,
				colName : varAttrs.name + ': ' + siteAttributes.siteNo,
			});
		}
	})

	var collection = BaseVariableCollection.extend({

		/*
		 * @param {Object} siteAttributes - represents this variables site. Should include siteNo property.
		 * @returns {Array of VariableParameter}
		 */
		getSelectedVariableParams : function(siteAttributes) {
			var selectedVars = this.getSelectedVariables();

			return _.chain(selectedVars)
				.map(function(model) {
					var varAttrs = model.attributes;
					var varParams = _.map(varAttrs.timeSeriesOptions, function(tsOption) {
						return new VariableParameter ({
							name : 'NWIS',
							value : siteAttributes.siteNo + ':' + varAttrs.parameterCd + ':' + varAttrs.statCd,
							colName : varAttrs.name + ': ' + siteAttributes.siteNo,
						});
					});
					return varParams;
				})
				.flatten()
				.value();
		}
	});

	return collection;
});


