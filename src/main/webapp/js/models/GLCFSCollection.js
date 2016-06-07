/* jslint browser: true */

define([
	'loglevel',
	'module',
	'jquery',
	'underscore',
	'moment',
	'utils/VariableParameter',
	'models/BaseDatasetCollection',
	'models/BaseVariableCollection',
	'utils/jqueryUtils'
], function(log, module, $, _, moment, VariableParameter, BaseDatasetCollection, BaseVariableCollection, $utils) {
	"use strict";
	
//	var getUrl = function() {
//		var theUrl = 'http://cida.usgs.gov/enddat/OPeNDAP/archiveall/';
//			theUrl += this.lake.toLowerCase() + '/ncfmrc-2d/' + 'Lake_' + this.lake;
//			theUrl += '_-_Nowcast_-_2D_-_All_Years_best.ncd.ascii?lat[0:1:250][0:1:130],lon[0:1:250][0:1:130]';
//		return theUrl;
//	};
	var GET_FEATURE_URL = module.config().GLFCSWFSGetFeatureUrl;

	var collection = BaseDatasetCollection.extend({
		
		initialize : function(attributes, options) {
			Backbone.Collection.prototype.initialize.apply(this, arguments);
			this.lake = options.lake;
		},
		
		/* Fetches the grid data for the specified bounding box and updates the collection contents.
		 * If the fetch fails the collection is reset. The .dds document is also fetched using the precipitation service
		 * to determine the time_bounds parameter
		 * @param {Object} boundingBox - west, east, north, and south properties
		 * @returns a promise. Both rejected and resolved return the original jqXHR
		 */
		fetch : function() {
			$.ajax({
				url : GET_FEATURE_URL,
				success : function(xml, textStatus, jqXHR) {
					if ($utils.xmlFind($(xml), 'ows', 'ExceptionReport').length > 0) {
						log.debug('Precipitation GetFeature fetch failed with Exception from service');
					}
					else {
						xmlResponse = xml;
					}
				},
				error : function(jqXHR) {
					log.debug('Precipitation GetFeature fetch failed');
				}
			});
		},
	});

	return collection;
});