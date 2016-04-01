/* jslint browser: true */
/* global expect */

define([
	'utils/jqueryUtils'
], function($Utils) {
	describe('utils/jqueryUtils', function() {
		describe('Tests for xmlFind', function() {
			var testXML = '<?xml version="1.0" encoding="UTF-8"?>' +
				'<wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs/2.0"><wfs:member>Item1</wfs:member><wfs:member>Item2</wfs:member></wfs:FeatureCollection>';

			it('Expects that the function returns the correct namespaced tag elements', function() {
				var testXMLDoc = $.parseXML(testXML);
				var $result = $Utils.xmlFind($(testXMLDoc), 'wfs', 'member');
				var contents = [];
				expect($result.length).toBe(2);
				$result.each(function() {
					contents.push($(this).text());
				});
				expect(contents).toEqual(['Item1', 'Item2']);
			});
		});
	});
});