/* jslint browser: true */
/* global expect */

define([
	'jquery',
	'moment',
	'backbone',
	'views/ECDataView'
], function($, moment, Backbone, ECDataView) {
	"use strict";

	fdescribe('views/ECDataView', function() {
		var testView;
		var testModel;
		var $testDiv;
		var variables;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			variables = new Backbone.Collection([
				{
					startDate : moment('2016-12-06', 'YYYY-MM-DD'),
					endDate : moment('2017-01-05', 'YYYY-MM-DD'),
					description : 'Description 1'
				}, {
					startDate : moment('2017-01-02', 'YYYY-MM-DD'),
					endDate : moment('2017-01-05', 'YYYY-MM-DD'),
					description : 'Description 2'
				}
			]);
			testModel = new Backbone.Model({
				siteId : '01A20304',
				name: 'Site Name',
				variables: variables
			});

			testView = new ECDataView({
				$el: $testDiv,
				model: testModel,
				distanceToProjectLocation: '1.25'
			});
		});

		afterEach(function() {
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
		});

		it('Expects that when the view is rendered the context contains formatted paramters', function() {
			testView.render();

			expect(testView.context.distance).toEqual('1.25');
			expect(testView.context.variables.length).toBe(2);
			expect(testView.context.variables[0]).toEqual({
				id : variables.at(0).cid,
				description: 'Description 1',
				startDate: '2016-12-06',
				endDate: '2017-01-05'
			});
			expect(testView.context.variables[1]).toEqual({
				id : variables.at(1).cid,
				description: 'Description 2',
				startDate: '2017-01-02',
				endDate: '2017-01-05'
			});
			expect(testView.context.name).toEqual('Site Name');
		});

		it('Expects that a variables checkbox is checked if the variable has selected set to true', function() {
			var variables = testModel.get('variables');
			variables.at(0).set('selected', true);
			testView.render();

			expect(testView.context.variables[0].selected).toBe(true);
		});
	});
});
