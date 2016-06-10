/* jslint browser: true */
/* global jasmine, expect, sinon */

define([
	'jquery',
	'models/AOIModel',
	'views/LocationView'
], function($, AOIModel, LocationView) {
	"use strict";

	describe('views/LocationView', function() {
		var testView;
		var testModel;
		var $testDiv;
		var fakeServer;

		beforeEach(function() {
			fakeServer = sinon.fakeServer.create();
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			testModel = new AOIModel({
				latitude : '',
				longitude : '',
				radius : ''
			});
			testModel.set('step', testModel.SPECIFY_AOI_STEP);

			testView = new LocationView({
				el : $testDiv,
				model : testModel
			});
		});

		afterEach(function() {
			fakeServer.restore();
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
		});

		describe('Tests for render', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects a collapsible panel to be rendered', function() {
				var $panel = $testDiv.find('.collapsible-panel');
				expect($panel.length).toBe(1);
				expect($panel.find('.panel-heading').html()).toContain('Specify Project Location');
			});
		});

		describe('DOM event handler tests', function() {
			var $lat, $lng, $radius, $useLocBtn;
			beforeEach(function() {
				testView.render();
				$lat = $testDiv.find('#latitude');
				$lng = $testDiv.find('#longitude');
				$radius = $testDiv.find('#radius');
				$useLocBtn = $testDiv.find('.use-location-btn');

				spyOn(navigator.geolocation, 'getCurrentPosition');
			});

			it('Expects that changing the latitude updates the model\'s latitude property', function() {
				$lat.val('43.0').trigger('change');

				expect(testModel.get('latitude')).toEqual('43.0')

				$lat.val('42.0').trigger('change');

				expect(testModel.get('latitude')).toEqual('42.0');

				$lat.val('').trigger('change');

				expect(testModel.get('latitude')).toEqual('');
			});

			it('Expects that changing the longitude updates the model\'s longitude property', function() {
				$lng.val('-100.0').trigger('change');

				expect(testModel.get('longitude')).toEqual('-100.0');

				$lng.val('-101.0').trigger('change');

				expect(testModel.get('longitude')).toEqual('-101.0');

				$lng.val('').trigger('change');

				expect(testModel.get('longitude')).toEqual('');
			});

			it('Expects that geolocation is called if the use my location button is clicked', function() {
				$useLocBtn.trigger('click');
				expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
			});

			it('Expect that when the location button is clicked and the getCurrentPosition succeeds the model\'s location property is updated', function() {
				$useLocBtn.trigger('click');
				var successFnc = navigator.geolocation.getCurrentPosition.calls.argsFor(0)[0];
				successFnc({
					coords : {
						latitude : '43.0',
						longitude : '-100.0'
					}
				});

				expect(testModel.get('latitude')).toEqual('43.0');
				expect(testModel.get('longitude')).toEqual('-100.0');
			});

			it('Expects that changing the radius updates the model\'s radius property', function() {
				$radius.val('5').trigger('change');

				expect(testModel.get('radius')).toEqual('5');

				$radius.val('4').trigger('change');

				expect(testModel.get('radius')).toEqual('4');

				$radius.val('').trigger('change');

				expect(testModel.get('radius')).toEqual('');
			});
		});

		describe('Model event handlers', function() {
			var $lat, $lng, $radius;
			beforeEach(function() {
				testView.render();
				$lat = $testDiv.find('#latitude');
				$lng = $testDiv.find('#longitude');
				$radius = $testDiv.find('#radius');
			});

			it('Expects that when the model\'s latitude property is updated, the DOM is update', function() {
				testModel.set('latitude', '43.0');
				expect($lat.val()).toEqual('43.0');

				testModel.set('latitude', '44.0');
				expect($lat.val()).toEqual('44.0');

				testModel.set('latitude', '');
				expect($lat.val()).toEqual('');
			});

			it('Expects that when the model\'s longitude property is updated, the DOM is updated', function() {
				testModel.set('longitude', '-100.0');
				expect($lng.val()).toEqual('-100.0');

				testModel.set('longitude', '-101.0');
				expect($lng.val()).toEqual('-101.0');

				testModel.set('longitude', '');
				expect($lng.val()).toEqual('');
			});

			it('Expects that when then model\'s radius property is updated, the DOM is updated', function() {
				testModel.set('radius', '4');
				expect($radius.val()).toEqual('4');

				testModel.set('radius', '5');
				expect($radius.val()).toEqual('5');

				testModel.set('radius', '');
				expect($radius.val()).toEqual('');
			});
		});
	});
});