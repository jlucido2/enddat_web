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

		PROJ_LOC_STEP : 'specifyProjectLocation',
		CHOOSE_DATA_STEP : 'chooseData',
		PROCESS_DATA_STEP :'processData',

		DATE_FORMAT : 'YYYY-MM-DD',
		DATE_FORMAT_URL : 'DMMMYYYY'
	};

	return config;
});


