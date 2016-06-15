/* jslint browser: true */
define([], function() {
	"use strict";
	/*
	 * Contains constants used by multiple modules
	 */
	var config = {
		GLCFS_DATASET_ERIE : 'GLCFS_ERIE',
		GLCFS_DATASET_HURON : 'GLCFS_HURON',
		GLCFS_DATASET_MICHIGAN : 'GLCFS_MICHIGAN',
		GLCFS_DATASET_ONTARIO : 'GLCFS_ONTARIO',
		GLCFS_DATASET_SUPERIOR : 'GLCFS_SUPERIOR',
		NWIS_DATASET : 'NWIS',
		PRECIP_DATASET : 'PRECIP',
		ACIS_DATASET : 'ACIS',
		ALL_DATASETS : ['GLCFS_ERIE', 'GLCFS_HURON', 'GLCFS_MICHIGAN', 'GLCFS_ONTARIO', 'GLCFS_SUPERIOR', 'NWIS', 'PRECIP', 'ACIS'],

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
			},
			'ACIS' : {
				iconUrl : 'img/acis.png',
				iconSize : [10, 10]
			}
		},

		SPECIFY_AOI_STEP : 'specifyAOI',
		CHOOSE_DATA_FILTERS_STEP : 'chooseDataFilters',
		CHOOSE_DATA_VARIABLES_STEP : 'chooseDataVariables',
		PROCESS_DATA_STEP :'processData',

		DATE_FORMAT : 'YYYY-MM-DD',
		DATE_FORMAT_URL : 'DMMMYYYY'
	};

	return config;
});
