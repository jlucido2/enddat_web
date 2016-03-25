define([
	'loglevel',
	'module',
	'jquery',
	'backbone',
	'utils/jqueryUtils'
], function(log, module, $, Backbone, $utils) {
	"use strict";

	var getInteger = function(str) {
		return str.split('.')[0];
	};

	var collection = Backbone.Collection.extend({

		url : module.config().precipWFSGetFeatureUrl,

		parse : function(xml) {
			var result = [];
			$utils.xmlFind($(xml), 'wfs', 'member').each(function() {
				var $this = $(this);
				result.push({
					x : getInteger($utils.xmlFind($this, 'sb', 'x').text()),
					y : getInteger($utils.xmlFind($this, 'sb', 'y').text()),
					lon : $utils.xmlFind($this, 'sb', 'X1').text(),
					lat : $utils.xmlFind($this, 'sb', 'X2').text()
				});
			});
			return result;
		},

		fetch : function (boundingBox) {
			var self = this;
			var fetchDeferred = $.Deferred();

			$.ajax({
				url : this.url,
				data : {
					srsName : 'EPSG:4269',
					bbox : [boundingBox.south, boundingBox.west, boundingBox.north, boundingBox.east].join(',')
				},
				success : function(xml) {
					self.reset(self.parse(xml));
					log.debug('Precipitation fetch succeeded, fetched ' + self.size() + ' grid');
					fetchDeferred.resolve();
				},
				error : function(jqXHR) {
					log.debug('Precipitation fetch failed');
					fetchDeferred.reject(jqXHR);
				}
			});

			return fetchDeferred.promise();
		}

	});

	return collection;
});


