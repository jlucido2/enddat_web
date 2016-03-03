/* jslint browser: true */
/* global jasmine, expect */

define([
	'jquery',
	'models/WorkflowStateModel',
	'views/LocationView'
], function($, WorkflowStateModel, LocationView) {
	"use strict";

	describe('views/LocationView', function() {
		var testView;
		var testModel;
		var $testDiv;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			testModel = new WorkflowStateModel();
			testModel.set('step', testModel.PROJ_LOC_STEP);

			testView = new LocationView({
				el : $testDiv,
				model : testModel
			});
		});

		afterEach(function() {
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
			var $lat, $lng, $useLocBtn;
			beforeEach(function() {
				testView.render();
				$lat = $testDiv.find('#latitude');
				$lng = $testDiv.find('#longitude');
				$useLocBtn = $testDiv.find('.use-location-btn');

				spyOn(navigator.geolocation, 'getCurrentPosition');
			});

			it('Expects that changing the latitude updates the model\'s location property', function() {
				$lat.val('43.0').trigger('change');
				expect(testModel.get('location')).toEqual({
					latitude : '43.0',
					longitude : ''
				});

				$lat.val('42.0').trigger('change');
				expect(testModel.get('location')).toEqual({
					latitude : '42.0',
					longitude : ''
				});

				$lat.val('').trigger('change');
				expect(testModel.get('location')).toEqual({
					latitude : '',
					longitude : ''
				});
			});

			it('Expects that changing the longitude updates the model\'s location property', function() {
				$lng.val('-100.0').trigger('change');
				expect(testModel.get('location')).toEqual({
					latitude : '',
					longitude : '-100.0'
				});

				$lng.val('-101.0').trigger('change');
				expect(testModel.get('location')).toEqual({
					latitude : '',
					longitude : '-101.0'
				});

				$lng.val('').trigger('change');
				expect(testModel.get('location')).toEqual({
					latitude : '',
					longitude : ''
				});
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

				expect(testModel.get('location')).toEqual({
					latitude : '43.0',
					longitude : '-100.0'
				});
			});
		});

		describe('Model event handlers', function() {
			var $lat, $lng;
			beforeEach(function() {
				testView.render();
				$lat = $testDiv.find('#latitude');
				$lng = $testDiv.find('#longitude');
			});

			it('Expects that if the model\'s location property the latitude and longitude fields are updated', function() {
				testModel.set('location', {
					latitude : '43.0',
					longitude : '-100.0'
				});
				expect($lat.val()).toEqual('43.0');
				expect($lng.val()).toEqual('-100.0');

				testModel.set('location', {
					latitude : '43.0',
					longitude : ''
				});
				expect($lat.val()).toEqual('43.0');
				expect($lng.val()).toEqual('');

				testModel.set('location', {
					latitude : '',
					longitude : ''
				});
				expect($lat.val()).toEqual('');
				expect($lng.val()).toEqual('');
			});
		});
	});
});