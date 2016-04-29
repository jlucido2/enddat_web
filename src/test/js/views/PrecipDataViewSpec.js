/* jslint browser */
/* global expect */

define([
	'jquery',
	'moment',
	'backbone',
	'views/PrecipDataView'
], function($, moment, Backbone, PrecipDataView) {

	describe('views/PrecipDataView', function() {
		var testView;
		var testModel;
		var $testDiv;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');
			testModel = new Backbone.Model({
				lat : '43.1346',
				lon : '-100.2121',
				x : '514',
				y : '720',
				startDate : moment('2002-01-01', 'YYYY-MM-DD'),
				endDate : moment('2016-04-18', 'YYYY-MM-DD')
			});
			testView = new PrecipDataView({
				$el : $testDiv,
				model : testModel,
				distanceToProjectLocation : '1.345'
			})
		});

		afterEach(function() {
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
		});

		it('Expects the view to be rendered with a context that contains the formatted contents of the model', function() {
			testView.render();

			expect(testView.context.distance).toEqual('1.345');
			expect(testView.context.x).toEqual('514');
			expect(testView.context.y).toEqual('720');
			expect(testView.context.lat).toEqual('43.135');
			expect(testView.context.lon).toEqual('-100.212');
			expect(testView.context.startDate).toEqual('2002-01-01');
			expect(testView.context.endDate).toEqual('2016-04-18');
		});

		it('Expects that the checkbox is not checked if the selected property is not defined in the model when the view is rendered', function() {
			testView.render();

			expect(testView.$('input:checkbox').is(':checked')).toBe(false);
		});

		it('Expects that the checkbox is checked if the selected property is set to true in the model when the view is rendered', function() {
			testModel.set('selected', true);
			testView.render();

			expect(testView.$('input:checkbox').is(':checked')).toBe(true);
		});

		it('Expects that if the checkbox is checked, the selected property is set to true', function() {
			testView.render();
			testView.$('input:checkbox').trigger('click');

			expect(testModel.get('selected')).toBe(true);
		});

		it('Expects that if the checkbox is clicked twice, the selected property is set back to false', function() {
			testView.render();
			testView.$('input:checkbox').trigger('click');
			testView.$('input:checkbox').trigger('click');

			expect(testModel.get('selected')).toBe(false);
		});

		it('Expects that if the model\'s selected attribute is updated the variable checkbox reflects it\'s state', function() {
			var $checkbox;
			testView.render();
			$checkbox = testView.$('input:checkbox');
			testModel.set('selected', false);

			expect($checkbox.prop('checked')).toBe(false);

			testModel.set('selected', true);
			expect($checkbox.prop('checked')).toBe(true);

			testModel.unset('selected');
			expect($checkbox.prop('checked')).toBe(false);
		});
	});
});