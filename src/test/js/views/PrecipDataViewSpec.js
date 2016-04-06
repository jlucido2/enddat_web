/* jslint browser */
/* global expect */

define([
	'jquery',
	'backbone',
	'views/PrecipDataView'
], function($, Backbone, PrecipDataView) {

	fdescribe('views/PrecipDataView', function() {
		var testView;
		var testModel;
		var $testDiv;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');
			testModel = new Backbone.Model({
				lat : '43.1',
				lon : '-100.2',
				x : '514',
				y : '720'
			})
		});

		afterEach(function() {
			$testDiv.remove();
		});

		it('Expects that the checkbox is not checked if the selected property is not defined in the model when the view is rendered', function() {
			testView = new PrecipDataView({
				$el : $testDiv,
				model : testModel
			});
			testView.render();

			expect(testView.$('input:checkbox').is(':checked')).toBe(false);
		});

		it('Expects that the checkbox is checked if the selected property is set to true in the model when the view is rendered', function() {
			testModel.set('selected', true);
			testView = new PrecipDataView({
				$el : $testDiv,
				model : testModel
			});
			testView.render();

			expect(testView.$('input:checkbox').is(':checked')).toBe(true);
		});

		it('Expects that if the checkbox is checked, the selected property is set to true', function() {
			testView = new PrecipDataView({
				$el : $testDiv,
				model : testModel
			});
			testView.render();
			testView.$('input:checkbox').trigger('click');
			
			expect(testModel.get('selected')).toBe(true);
		});

		it('Expects that if the checkbox is clicked twice, the selected property is set back to false', function() {
			testView = new PrecipDataView({
				$el : $testDiv,
				model : testModel
			});
			testView.render();
			testView.$('input:checkbox').trigger('click');
			testView.$('input:checkbox').trigger('click');

			expect(testModel.get('selected')).toBe(false);
		});
	});
});