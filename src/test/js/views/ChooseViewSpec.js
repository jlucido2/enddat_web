/* jslint browser: true */
/* global jasmine, expect */

define([
	'jquery',
	'models/WorkflowStateModel',
	'views/ChooseView'
], function($, WorkflowStateModel, ChooseView) {
	"use strict";

	describe('views/ChooseView', function() {
		var testView;
		var testModel;
		var $testDiv;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			testModel = new WorkflowStateModel();
			testModel.set('step', testModel.PROJ_LOC_STEP);

			testView = new ChooseView({
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
				expect($panel.find('.panel-heading').html()).toContain('Choose Data');
			});
		});

		describe('DOM event handler tests', function() {
			var $rad;
			beforeEach(function() {
				testView.render();
				$rad = $testDiv.find('#radius');

			});

			it('Expects that changing the radius updates the model\'s radius property', function() {
				$rad.val('5').trigger('change');
				expect(testModel.get('radius')).toEqual('5');
			});
		});

		describe('Model event handlers', function() {
			var $rad;
			beforeEach(function() {
				testView.render();
				$rad = $testDiv.find('#radius');
			});

			it('Expects that if the model\'s radius property is updated the radius field is updated', function() {
				testModel.set('radius', '5');
				expect($rad.val()).toEqual('5');
			});
		});
	});
});