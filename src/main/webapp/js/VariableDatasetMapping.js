/* jslint browser: true */

define([
	'underscore',
	'Config'
], function(_, Config) {
	"use strict";

	var variableDatasetMapping = (function() {
		var self = {};

		self.mapping = {
			'precipitation' : {
				displayName : 'Precipitation',
				datasets : [
					{
						name : Config.NWIS_DATASET,
						filter : [
							{'parameterCd' : '00045', 'statCd' : '00000'},
							{'parameterCd' : '00046', 'statCd' : '00000'}
						]
					},{
						name : Config.ACIS_DATASET,
						filter : [
							{code : 'pcpn'}
						]
					},{
						name : Config.PRECIP_DATASET,
						filter : [{}]
					}
				]
			},
			'maxTemperature' : {
				displayName : 'Maximum Temperature',
				datasets : [
					{
						name : Config.NWIS_DATASET,
						filter : [
							{'parameterCd' : '00021', 'statCd' : '00001'}
						]
					},{
						name : Config.ACIS_DATASET,
						filter : [{code : 'maxt'}]
					},{
						name : Config.GLCFS_DATASET_ERIE,
						filter : [{code : 'at'}]
					},{
						name : Config.GLCFS_DATASET_HURON,
						filter : [{code : 'at'}]
					},{
						name : Config.GLCFS_DATASET_MICHIGAN,
						filter : [{code : 'at'}]
					},{
						name : Config.GLCFS_DATASET_ONTARIO,
						filter : [{code : 'at'}]
					},{
						name : Config.GLCFS_DATASET_SUPERIOR,
						filter : [{code : 'at'}]
					}
				]
			}
		};

		self.getDatasets = function(variables) {
			var varMappings = _.pick(self.mapping, variables);
			return _.chain(varMappings)
				.map(function(vm) {
					return _.pluck(vm.datasets, 'name')
				})
				.flatten()
				.value();
		};

		self.getFilters = function(dataset, variables) {
			var getOneVarFilter = function(dataset, variable) {
				var findResult =  _.find(self.mapping[variable].datasets, function (d) {
					return d.name === dataset;
				});
				var result;
				if (findResult) {
					result = findResult.filter;
				}
				else {
					result = [];
				}
				return result;
			};

			return _.flatten(_.map(variables, function(variable) {
				return getOneVarFilter(dataset, variable);
			}));
		};

		return self;
	})();
	return variableDatasetMapping;
});
