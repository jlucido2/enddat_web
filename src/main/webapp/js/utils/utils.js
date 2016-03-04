/*jslint browser: true */

define([
	'underscore',
	'jquery'
], function (_, $) {
	"use strict";
	
	var self = {};

	self.parseRDB = function(lines, importantColumns, onRowCallback) {
		var columnIndexes = $.extend({}, importantColumns);
		var isIndexesFound = false;
		var isIntoData = false;
		$.each(lines, function(lineIndex, el) {
			if (el && 0 < el.length && '#' !== el.charAt(0)) {
				var row = el.split('\t');

				if (!isIndexesFound) {
					isIndexesFound = true;
					//at beginning, get data indexes
					$.each(row, function(colIndex, colName) {
						if (columnIndexes.hasOwnProperty(colName)) {
							columnIndexes[colName] = colIndex;
						}
					});
				} else if(!isIntoData) {
					isIntoData = true;
					//skip line after column Headers
				} else {
					var columnValues = $.extend({}, importantColumns);

					//Load up the values
					$.each(columnIndexes, function(name, colIndex) {
						columnValues[name] = row[colIndex];
					});

					onRowCallback(columnValues);
				}
			}
		});
	};

	self.toTitleCase = function (str) {
		var lowerCase = str.toLowerCase();
	    return lowerCase.replace(/(?:^|\s)\w/g, function(match) {
	        return match.toUpperCase();
	    });
	}

	return self;
});