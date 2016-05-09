/* jslint browser: true */
define([], function() {
	"use strict";
	/*
	 * Contains constants used by multiple modules
	 */
	var config = {
		NWIS_DATASET : 'NWIS',
		PRECIP_DATASET : 'PRECIP',
		ALL_DATASETS : ['NWIS', 'PRECIP'],

		PROJ_LOC_ICON_URL : 'bower_components/leaflet/dist/images/marker-icon.png',
		DATASET_ICON : {
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


