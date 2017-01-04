/* jslint browser: true */

/* global describe, it, expect */

define([
	'utils/geoSpatialUtils'
], function(geoSpatialUtils) {

	fdescribe('utils/geoSpatilutils', function() {

		var boundingBox = {
			south : 42.0,
			north : 43.0,
			west : -99.0,
			east : -98.0
		};

		it('Expects that a point expressed as number or string that is within boundingBox returns true', function() {
			expect(geoSpatialUtils.isInBoundingBox(42.1, -98.5, boundingBox)).toBe(true);
			expect(geoSpatialUtils.isInBoundingBox('42.1', '-98.5', boundingBox)).toBe(true);
		});

		it('Expects that a point that is outside boundingBox returns false', function() {
			expect(geoSpatialUtils.isInBoundingBox(43.1, -98.5, boundingBox)).toBe(false);
			expect(geoSpatialUtils.isInBoundingBox('42.1', '-99.5', boundingBox)).toBe(false);
			expect(geoSpatialUtils.isInBoundingBox(42.1, -97.5, boundingBox)).toBe(false);
			expect(geoSpatialUtils.isInBoundingBox('41.1', '-98.5', boundingBox)).toBe(false);
		})
	});
});

