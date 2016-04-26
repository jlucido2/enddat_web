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

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			testModel = new Backbone.Model({
				lat : '43.1346',
				lon : '-100.2121',
				siteNo : '04069530',
				name : 'PESHTIGO RIVER AT MOUTH NEAR PESHTIGO, WI',
				startDate : moment('2002-01-01', 'YYYY-MM-DD'),
				endDate : moment('2016-04-18', 'YYYY-MM-DD'),
				parameters : [
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
				]
			});

			testView = new NWISDataView({
				$el : $testDiv,
				model : testModel
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

			expect(testView.context.parameters.length).toBe(2);
			expect(testView.context.parameters[0]).toEqual({
				name : 'Discharge cubic feet per second Daily Mean',
				parameterCd : '4343',
				statCd : '1111',
				startDate : '2005-01-01',
				endDate : '2015-04-18'
			});
			expect(testView.context.parameters[1]).toEqual({
				name : 'PCode 80155 Daily Mean',
				parameterCd : '80155',
				statCd : '1111',
				startDate : '2002-01-01',
				endDate : '2016-04-18'
			});
		});

		it('Expects that the checkbox is checked if the selected property for a parameter is set to true when the view is rendered', function() {
			var parameters = testModel.get('parameters');
			parameters[0].selected = true;
			testView.render();

			expect(testModel.get('parameters')[0].selected).toBe(true);
		});

		it('Expects that when the checkbox is checked, the selected property is set to true', function() {
			testView.render();
			testView.$('#toggle-param1').trigger('click');

			expect(testModel.get('parameters')[1].selected).toBe(true);
		});

		it('Expects that when the checkbox is checked and then unchecked, the selected property is set to false', function() {
			testView.render();
			testView.$('#toggle-param1').trigger('click');
			testView.$('#toggle-param1').trigger('click');

			expect(testModel.get('parameters')[1].selected).toBe(false);
		});
	});
});