/* jslint browser: true */

define([
	'Config'
], function(Config) {
	"use strict";

	var variableDatasetMapping = {
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
					filter : []
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

	return variableDatasetMapping;
});