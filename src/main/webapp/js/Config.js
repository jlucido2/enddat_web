/* jslint browser: true */
define([], function() {
	"use strict";
	/*
	 * Contains constants used by multiple modules
	 */
	var config = {
		GLCFS_DATASET : 'GLCFS',
		NWIS_DATASET : 'NWIS',
		PRECIP_DATASET : 'PRECIP',
		ACIS_DATASET : 'ACIS',
		ALL_DATASETS : ['GLCFS', 'NWIS', 'PRECIP', 'ACIS'],

		PROJ_LOC_ICON_URL : 'bower_components/leaflet/dist/images/marker-icon.png',

		DATASET_ICON : {
			'GLCFS' : {
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
				iconSize : [12, 12]
			}
		},

		SPECIFY_AOI_STEP : 'specifyAOI',
		CHOOSE_DATA_BY_SITE_FILTERS_STEP : 'chooseDataBySiteFilters',
		CHOOSE_DATA_BY_SITE_VARIABLES_STEP : 'chooseDataBySiteVariables',
		CHOOSE_DATA_BY_VARIABLES_STEP : 'chooseDataByVariables',
		PROCESS_DATA_STEP :'processData',

		DATE_FORMAT : 'YYYY-MM-DD',
		DATE_FORMAT_URL : 'DMMMYYYY'
	};

	return config;
});
