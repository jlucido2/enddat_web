/* jslint browser: true */
/* global expect */

define([
	'jquery',
	'moment',
	'backbone',
	'views/ACISDataView'
], function($, moment, Backbone, ACISDataView) {
	"use strict";

	describe('views/ACISDataView', function() {
		var testView;
		var testModel;
		var $testDiv;
		var variables;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			variables = new Backbone.Collection([
				{
					code : 'maxt',
					description : 'Maximum temperature(F)',
					startDate : moment('2005-01-01', 'YYYY-MM-DD'),
					endDate : moment('2015-04-18', 'YYYY-MM-DD')
				},
				{
					code : 'avgt',
					description : 'Average temperature (F)',
					startDate : moment('2002-01-01', 'YYYY-MM-DD'),
					endDate : moment('2016-04-18', 'YYYY-MM-DD')
				}
			]);

			testModel = new Backbone.Model({
				lat : '43.1346',
				lon : '-100.2121',
				name : 'ACIS Site L',
				sid : '1234ABCD',
				networks : [
					{id : '1234ABCD', code : '2', name : 'COOP'}
				],
				variables : variables
			});

			testView = new ACISDataView({
				$el : $testDiv,
				model : testModel,
				distanceToProjectLocation : '1.344'
			});
		});

		afterEach(function() {
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
		});

		it('Expects that when the view is rendered the context contains formatted parameters', function() {
			testView.render();

			expect(testView.context.distance).toEqual('1.344');
			expect(testView.context.variables.length).toBe(2);
			expect(testView.context.variables[0]).toEqual({
				id : variables.at(0).cid,
				code : 'maxt',
				description : 'Maximum temperature(F)',
				startDate : '2005-01-01',
				endDate : '2015-04-18'
			});
			expect(testView.context.variables[1]).toEqual({
				id : variables.at(1).cid,
				code : 'avgt',
				description : 'Average temperature (F)',
				startDate : '2002-01-01',
				endDate : '2016-04-18'
			});
			expect(testView.context.name).toEqual('ACIS Site L');
			expect(testView.context.siteId).toEqual('1234ABCD');
			expect(testView.context.networks).toEqual([
				{id : '1234ABCD', code : '2', name : 'COOP'}
			]);
		});

		it('Expects that a variables checkbox is checked if the variable has selected set to true', function() {
			var variables = testModel.get('variables');
			variables.at(0).set('selected', true);
			testView.render();

			expect(testView.context.variables[0].selected).toBe(true);
		});
	});
});


