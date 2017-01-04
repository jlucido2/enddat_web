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
		EC_DATASET : 'EC',
		ALL_DATASETS : ['GLCFS', 'NWIS', 'PRECIP', 'ACIS', 'EC'],

		PROJ_LOC_ICON_URL : 'bower_components/leaflet/dist/images/marker-icon.png',
		PUBLIC_BEACH_ICON : 'img/yellow_triangle.png',
		USGS_MODEL_BEACH_ICON : 'img/green_triangle.png',

		BEACH_ICONS: {
			'Public Beaches': {
				iconUrl : 'img/yellow_triangle.png',
				iconSize : [10, 10]
			},
			'USGS Model Beaches': {
				iconUrl : 'img/green_triangle.png',
				iconSize : [10, 10]
			}
		},

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
			},
			'EC' : {
				iconUrl: 'img/ec.png',
				iconSize: [12, 12]
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
