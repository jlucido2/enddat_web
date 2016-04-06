/* jslint browser: true */

define([
	'jquery'
], function($) {
	"use strict";

	var utils = (function() {
		var self = {};

		self.xmlFind = function($el, namespace, tag) {
			return $el.find(namespace + '\\:' + tag + ', ' + tag);
		};

		self.createDivInContainer = function($container) {
			var $newDiv = $('<div />');
			$container.append($newDiv);

			return $newDiv;
		};

		return self;
	})();

	return utils;
});


