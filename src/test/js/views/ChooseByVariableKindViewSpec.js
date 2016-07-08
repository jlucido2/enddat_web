/*jslint browser: true */
/* global expect */

define([
	'jquery',
	'select2',
	'backbone',
	'views/ChooseByVariableKindView'
], function($, select2, Backbone, ChooseByVariableKindView) {
	"use strict";
	describe('views/ChooseByVariableKindView', function() {
		var testView;
		var $testDiv;
		var testModel;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			spyOn($.fn, 'select2');

			testModel = new Backbone.Model();
			testView = new ChooseByVariableKindView({
				el : $testDiv,
				model : testModel
			});
		});

		afterEach(function() {
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
		});

		describe('Tests for render', function() {
			it('Expects that the select2 is initialized', function() {
				testView.render();

				expect($.fn.select2).toHaveBeenCalled();
				expect($.fn.select2.calls.mostRecent().object.attr('id')).toEqual('variable-select');
			});

			it('Expects the value of the select2 to be set to the value of the variableKinds property in the model', function() {
				testModel.set('variableKinds', ['maxTemperature']);
				testView.render();

				expect($('#variable-select').val()).toEqual(['maxTemperature']);
			});
		});

		describe('Tests for model event handlers', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects that if variableKinds is updated, the select value is also updated', function() {
				var $select = $('#variable-select');
				testModel.set('variableKinds', ['maxTemperature']);

				expect($select.val()).toEqual(['maxTemperature']);

				testModel.set('variableKinds', ['maxTemperature', 'precipitation']);

				expect($select.val()).toEqual(['precipitation', 'maxTemperature']);

				testModel.set('variableKinds', []);

				expect($select.val()).toEqual(null);
			});
		});

		describe('Tests for DOM event handlers', function() {

			beforeEach(function() {
				testView.render();
			});
			// Have to call the select2 event handlers directly
			it('Expects that changing the variable select updates the model\'s variableKinds property', function() {
				var ev = {
					params : {
						data : {id : 'maxTemperature'}
					}
				};
				testView.selectVariable(ev);
				expect(testModel.get('variableKinds')).toEqual(['maxTemperature']);

				testView.resetVariable(ev);
				expect(testModel.get('variableKinds')).toEqual([]);
			});
		});
	});
});
