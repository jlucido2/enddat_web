/* jslint browser: true */
define([], function() {
	"use strict";
	/*
	 * Contains constants used by multiple modules
	 */
	var config = {
		GLCFS_ERIE_DATASET : 'GLCFS_ERIE',
		GLCFS_HURON_DATASET : 'GLCFS_HURON',
		GLCFS_MICHIGAN_DATASET : 'GLCFS_MICHIGAN',
		GLCFS_ONTARIO_DATASET : 'GLCFS_ONTARIO',
		GLCFS_SUPERIOR_DATASET : 'GLCFS_SUPERIOR',
		NWIS_DATASET : 'NWIS',
		PRECIP_DATASET : 'PRECIP',
		ALL_DATASETS : ['GLCFS_ERIE', 'GLCFS_HURON', 'GLCFS_MICHIGAN', 'GLCFS_ONTARIO', 'GLCFS_SUPERIOR', 'NWIS', 'PRECIP'],

		PROJ_LOC_ICON_URL : 'bower_components/leaflet/dist/images/marker-icon.png',
		DATASET_ICON : {
			'GLCFS_ERIE' : {
				iconUrl : 'img/forecast-system.png',
				iconSize : [10, 10]
			},
			'GLCFS_HURON' : {
				iconUrl : 'img/forecast-system.png',
				iconSize : [10, 10]
			},
			'GLCFS_MICHIGAN' : {
				iconUrl : 'img/forecast-system.png',
				iconSize : [10, 10]
			},
			'GLCFS_ONTARIO' : {
				iconUrl : 'img/forecast-system.png',
				iconSize : [10, 10]
			},
			'GLCFS_SUPERIOR' : {
				iconUrl : 'img/forecast-system.png',
				iconSize : [10, 10]
			},
			'NWIS' : {
				iconUrl :'img/time-series.png',
				iconSize : [10, 10]
			},
			'PRECIP' : {
				iconUrl : 'img/national-precipitation.png',
				iconSize : [14, 14]
			}
		},

		PROJ_LOC_STEP : 'specifyProjectLocation',
		CHOOSE_DATA_FILTERS_STEP : 'chooseDataFilters',
		CHOOSE_DATA_VARIABLES_STEP : 'chooseDataVariables',
		PROCESS_DATA_STEP :'processData',

		DATE_FORMAT : 'YYYY-MM-DD',
		DATE_FORMAT_URL : 'DMMMYYYY'
	};

	return config;
});