/* jslint browser */
/* global expect */

define([
	'utils/geoSpatialUtils',
	'models/AOIModel'
], function(geoSpatialUtils, AOIModel) {
	"use strict";

	fdescribe('models/AOIModel', function() {

		var testModel;

		beforeEach(function() {
			testModel = new AOIModel();
		});

		describe('Tests for usingProjectLocation', function() {
			it('Expects an empty model to return false', function() {
				expect(testModel.usingProjectLocation()).toBe(false);
			});

			it('Expects that if the model contains latitude, longitude and radius properties, the function returns true', function() {
				testModel.set({
					latitude : '',
					longitude : '',
					radius : ''
				});
				expect(testModel.usingProjectLocation()).toBe(true);
			});

			it('Expects that if the model does not contain latitude, longtiude and radius properties, the function returns false', function() {
				expect(testModel.usingProjectLocation()).toBe(false);
				testModel.set('aoiBox', {});

				expect(testModel.usingProjectLocation()).toBe(false);

				testModel.unset('aoiBox');
				testModel.set('latitude', '');

				expect(testModel.usingProjectLocation()).toBe(false);

				testModel.set('longitude', '');

				expect(testModel.usingProjectLocation()).toBe(false);
			});
		});

		describe('Tests for usingAOIBox', function() {
			it('Expects an empty model to return false', function() {
				expect(testModel.usingAOIBox()).toBe(false);
			});

			it('Expects that if the model contains aoiBox property, the function returns true', function() {
				testModel.set('aoiBox', '');
				expect(testModel.usingAOIBox()).toBe(true);
			});

			it('Expects that if the model does not contain aoiBox property, the function returns false', function() {
				expect(testModel.usingAOIBox()).toBe(false);
				testModel.set({
					latitude : '',
					longitude : '',
					radius : ''
				});

				expect(testModel.usingAOIBox()).toBe(false);
			});
		});

		describe('Tests for hasValidAOI', function() {
			it('Expects that if the model is empty, the function returns false', function() {
				expect(testModel.hasValidAOI()).toBe(false);
			});

			it('Expects that if the model contains a partially defined location/radius, the function returns false', function() {
				testModel.set({
					latitude : '',
					longitude : '',
					radius : ''
				});

				expect(testModel.hasValidAOI()).toBe(false);

				testModel.set('radius', 2);
				expect(testModel.hasValidAOI()).toBe(false);
			});

			it('Expects that if the model contains a valid location/radius, the function returns true', function() {
				testModel.set({
					latitude : 43.0,
					longitude : -100.0,
					radius : 2
				});

				expect(testModel.hasValidAOI()).toBe(true);
			});

			it('Expects that if the model contains a partially defined aoiBox property, the function returns false', function() {
				testModel.set('aoiBox', '');

				expect(testModel.hasValidAOI()).toBe(false);
			});

			it('Expects that if the model contains a fully defined aoiBox property, the function returns true', function() {
				testModel.set('aoiBox', {
					south : 43.0,
					west : -102.0,
					north : 44.0,
					east : -101.0
				});
			});
		});

		describe('Tests for getBoundingBox', function() {
			it('Expects an empty model to return undefined', function() {
				expect(testModel.getBoundingBox()).toBeUndefined();
			});

			it('Expects that a partially defined location/radius returns undefined', function() {
				testModel.set({
					latitude : '',
					longitude : '',
					radius : ''
				});

				expect(testModel.getBoundingBox()).toBeUndefined();

				testModel.set('latitude', 43.0);

				expect(testModel.getBoundingBox()).toBeUndefined();

				testModel.set('radius', 2);

				expect(testModel.getBoundingBox()).toBeUndefined();
			});

			it('Expects that a fully defined location/radius returns the expected bounding box', function() {
				var testValue = {
					latitude : 43.0,
					longitude : -100.0,
					radius : 2
				};
				testModel.set(testValue);

				expect(testModel.getBoundingBox()).toEqual(geoSpatialUtils.getBoundingBox(testValue.latitude, testValue.longitude, testValue.radius));
			});

			it('Expects that a paritally defined aoiBox returns undefined', function() {
				testModel.set('aoiBox', {});

				expect(testModel.getBoundingBox()).toBeUndefined();
			});

			it('Expects that a fully defined aoiBox returns the expected bounding box', function() {
				var testValue = {
					south : 42.0,
					west : -101.0,
					north : 43.0,
					east : -100.0
				};
				testModel.set('aoiBox', testValue);

				expect(testModel.getBoundingBox()).toEqual(testValue);
			});
		});
	});
});