/*jslint browser: true */

define([
	'underscore'
], function (_) {
	"use strict";
	
	var self = {};

	self.parseRDB = function(lines, importantColumns, onRowCallback) {
		var columnIndexes = _.extend({}, importantColumns);
		var isIndexesFound = false;
		var isIntoData = false;
		_.each(lines, function(el, lineIndex) {
			if (el && 0 < el.length && '#' !== el.charAt(0)) {
				var row = el.split('\t');

				if (!isIndexesFound) {
					isIndexesFound = true;
					//at beginning, get data indexes
					_.each(row, function(colName, colIndex) {
						if (_.has(columnIndexes,colName)) {
							columnIndexes[colName] = colIndex;
						}
					});
				} else if(!isIntoData) {
					isIntoData = true;
					//skip line after column Headers
				} else {
					var columnValues = _.extend({}, importantColumns);

					//Load up the values
					_.each(columnIndexes, function(colIndex, name) {
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