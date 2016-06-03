/* jslint browser: true */
/* global expect */

define([
	'jquery',
	'underscore',
	'backbone',
	'handlebars',
	'views/BaseDataView'
], function($, _, Backbone, Handlebars, BaseDataView) {
	"use strict";
	fdescribe('views/BaseDataView', function() {
		var TestView;
		var testView;
		var $testDiv;
		var testVariables, testModel;
		var hbsTemplate = '{{#each variables}}<input type="checkbox" {{#if selected}}checked{{/if}} data-id="{{id}}" />{{/each}}';

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');
			testVariables = new Backbone.Collection([
				{property : 'Prop1'},
				{property : 'Prop2'}
			]);
			testModel = new Backbone.Model({
				name : 'Test Site',
				variables : testVariables
			});
			TestView = BaseDataView.extend({
				template : Handlebars.compile(hbsTemplate),
				render : function() {
					this.context.variables = this.model.get('variables').map(function(varModel) {
						var result = _.clone(varModel.attributes);
						result.id = varModel.cid;
						return result;
					});

					BaseDataView.prototype.render.apply(this, arguments);
					return this;
				}
			});

			testView = new TestView({
				el : $testDiv,
				model : testModel,
				distanceToProjectLocation : '34'
			});
		});

		afterEach(function() {
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
		});

		it('Expects that the distanceToProjectLocation is a property on the view', function() {
			expect(testView.distanceToProjectLocation).toEqual('34');
		});

		describe('Model event listener tests', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects that if a variable is selected, the DOM is updated to set checkbox property to checked', function() {
				var var1 = testVariables.at(1);
				var $var1 = $testDiv.find('input[data-id="' + var1.cid + '"]');
				var1.set('selected', true);

				expect($var1.prop('checked')).toBe(true);
			});

			it('Expects that if a variable is selected and then unselected, the DOM is updated so that the checkbox checked property is false', function() {
				var var1 = testVariables.at(1);
				var $var1 = $testDiv.find('input[data-id="' + var1.cid + '"]');
				var1.set('selected', true);
				var1.set('selected', false);

				expect($var1.prop('checked')).toBe(false);
			});
		});

		describe('DOM event listener tests', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects that selecting the checkbox for a variable causes that variables selected property to be set to true', function() {
				var var0 = testVariables.at(0);
				var $var0 = $testDiv.find('input[data-id="' + var0.cid + '"]');
				$var0.trigger('click');

				expect(var0.get('selected')).toBe(true);
			});

			it('Expects that selecting then unselecting the checkbox for a variable causes that variables selected property to be set to false', function() {
				var var0 = testVariables.at(0);
				var $var0 = $testDiv.find('input[data-id="' + var0.cid + '"]');
				$var0.trigger('click');
				$var0.trigger('click');

				expect(var0.get('selected')).toBe(false);
			});
		});
	});
});