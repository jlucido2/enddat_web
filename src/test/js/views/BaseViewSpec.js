/*jslint browser:true*/
/*global expect*/
/*global jasmine*/
/*global describe*/
/*global beforeEach*/
/*global afterEach*/
/*global it*/


define([
	'views/BaseView'
],
function(BaseView) {
	describe('BaseView', function() {
		var testView;
		var $testDiv;
		var templateSpy;
		var TestView;
		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			templateSpy = jasmine.createSpy('templateSpy').and.returnValue('Template content');

			TestView = BaseView.extend({
				template : templateSpy
			});
		});

		afterEach(function() {
			testView.remove();
			$testDiv.remove();
		});

		it('Expects the template property to be used to render this view if not overridden in options', function() {
			testView = new TestView({
				el : $testDiv
			});

 			expect(testView.template()).toEqual('Template content');
		});

		it('Expects the template passed in via instantiation to override the template property when rendering', function() {
			var testTemplate = jasmine.createSpy('secondTemplateSpy').and.returnValue('New template content');
			testView = new TestView({
				el : $testDiv,
				template : testTemplate
			});

			expect(testView.template()).toEqual('New template content');
		});

		it('Expects a call to render to call the template function and render the content', function() {
			testView = new TestView({
				el : $testDiv
			}).render();
			testView.render();
			expect(templateSpy).toHaveBeenCalled();
			expect($testDiv.html()).toEqual('Template content');
		});

		it('Expects that if the view is instantiated with a context, that context is called by the template function', function() {
			testView = new TestView({
				el : $testDiv,
				template : templateSpy,
				context : {
					prop1 : 'One',
					prop2 : 'Two'
				}
			}).render();

			expect(templateSpy).toHaveBeenCalledWith({
					prop1 : 'One',
					prop2 : 'Two'
			});
		});
	});

});