/* jslint browser: true */
/* global expect */

define([
	'jquery',
	'moment',
	'backbone',
	'views/NWISDataView'
], function($, moment, Backbone, NWISDataView){

	describe('views/NWISDataView', function() {
		var testView;
		var testModel;
		var $testDiv;
		var variables;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			variables = new Backbone.Collection([
				{
					name : 'Discharge cubic feet per second Daily Mean',
					parameterCd : '4343',
					statCd : '1111',
					startDate : moment('2005-01-01', 'YYYY-MM-DD'),
					endDate : moment('2015-04-18', 'YYYY-MM-DD')
				},
				{
					name : 'PCode 80155 Daily Mean',
					parameterCd : '80155',
					statCd : '1111',
					startDate : moment('2002-01-01', 'YYYY-MM-DD'),
					endDate : moment('2016-04-18', 'YYYY-MM-DD')
				}
			]);

			testModel = new Backbone.Model({
				lat : '43.1346',
				lon : '-100.2121',
				siteNo : '04069530',
				name : 'PESHTIGO RIVER AT MOUTH NEAR PESHTIGO, WI',
				startDate : moment('2002-01-01', 'YYYY-MM-DD'),
				endDate : moment('2016-04-18', 'YYYY-MM-DD'),
				variables : variables
			});

			testView = new NWISDataView({
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

		it('Expects that when the view is initialized the context contains formatted parameters', function() {
			testView.render();

			expect(testView.context.distance).toEqual('1.344');
			expect(testView.context.variables.length).toBe(2);
			expect(testView.context.variables[0]).toEqual({
				id : variables.at(0).cid,
				name : 'Discharge cubic feet per second Daily Mean',
				parameterCd : '4343',
				statCd : '1111',
				startDate : '2005-01-01',
				endDate : '2015-04-18'
			});
			expect(testView.context.variables[1]).toEqual({
				id : variables.at(1).cid,
				name : 'PCode 80155 Daily Mean',
				parameterCd : '80155',
				statCd : '1111',
				startDate : '2002-01-01',
				endDate : '2016-04-18'
			});
		});

		it('Expects that the checkbox is checked if the selected property for a parameter is set to true when the view is rendered', function() {
			var variables = testModel.get('variables');
			variables.at(0).set('selected', true);
			testView.render();

			expect(testView.context.variables[0].selected).toBe(true);
		});

		it('Expects that when the checkbox is checked, the selected property is set to true', function() {
			var var1 = variables.at(1);
			testView.render();
			testView.$('[data-id="' + var1.cid + '"]').trigger('click');

			expect(var1.get('selected')).toBe(true);
		});

		it('Expects that when the checkbox is checked and then unchecked, the selected property is set to false', function() {
			var $checkbox;
			var var1 = variables.at(1);
			testView.render();
			$checkbox = testView.$('[data-id="' + var1.cid + '"]');
			$checkbox.trigger('click');

			expect(var1.get('selected')).toBe(true);

			$checkbox.trigger('click');

			expect(var1.get('selected')).toBe(false);
		});

		it('Expects that if a variable model\'s selected attributes changes, the checkbox for that variable reflects the change', function() {
			var $checkbox;
			var var1 = variables.at(1);
			testView.render();
			$checkbox = testView.$('[data-id="' + var1.cid + '"]');
			var1.set('selected', true);

			expect($checkbox.prop('checked')).toBe(true);

			var1.set('selected', false);

			expect($checkbox.prop('checked')).toBe(false);
		});
	});
});