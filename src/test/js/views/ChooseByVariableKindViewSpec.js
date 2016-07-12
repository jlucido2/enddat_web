/*jslint browser: true */
/* global expect, jasmine, spyOn */

define([
	'squire',
	'jquery',
	'select2',
	'backbone',
	'views/BaseView'
], function(Squire, $, select2, Backbone, BaseView) {
	"use strict";
	describe('views/ChooseByVariableKindView', function() {
		var ChooseByVariableKindView;
		var testView;
		var $testDiv;
		var testModel;
		var injector;

		var setElDateViewSpy, renderDateViewSpy, removeDateViewSpy;

		var injector;

		beforeEach(function(done) {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			spyOn($.fn, 'select2').and.callThrough;

			setElDateViewSpy = jasmine.createSpy('setElDateViewSpy');
			renderDateViewSpy = jasmine.createSpy('renderDateViewSpy');
			removeDateViewSpy = jasmine.createSpy('removeDateViewSpy');

			testModel = new Backbone.Model();

			injector = new Squire();
			injector.mock('jquery', $);
			injector.mock('views/DataDateFilterView', BaseView.extend({
				setElement : setElDateViewSpy.and.returnValue({
					render : renderDateViewSpy
				}),
				render : renderDateViewSpy,
				remove : removeDateViewSpy
			}));

			injector.require(['views/ChooseByVariableKindView'], function(View) {
				ChooseByVariableKindView = View;

				testView = new ChooseByVariableKindView({
					el : $testDiv,
					model : testModel
				});

				done();
			});
		});

		afterEach(function() {
			injector.remove();
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
		});

		it('Expects that the DataDateFilterView is initialized', function() {
			expect(setElDateViewSpy).toHaveBeenCalled();
		});

		describe('Tests for remove', function() {
			beforeEach(function() {
				testView.render();
			});
			it('Expects the DataDateFilterView to be removed', function(){
				testView.remove();

				expect(removeDateViewSpy).toHaveBeenCalled();
			});
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

			it('Expects the DataDateFilter to be rendered', function() {
				setElDateViewSpy.calls.reset();
				testView.render();

				expect(setElDateViewSpy).toHaveBeenCalled();
				expect(renderDateViewSpy).toHaveBeenCalled();
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
