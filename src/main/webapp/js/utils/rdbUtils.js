/*jslint browser: true */

define([
	'underscore'
], function (_) {
	"use strict";
	
	var self = {};

	/* @param	[Array] lines - array containing each line from an rdb file
	 * @param	{Object} importantColumns - object of tab-delimited columns found in lines
	 * returns	[Array} columnsArray - array of objects where each object holds key/value(s)
	 *					corresponding to the parsed column(s) from a line
	 */
	self.parseRDB = function(lines, importantColumns) {
		var columnIndexes = _.extend({}, importantColumns);
		var isIndexesFound = false;
		var isIntoData = false;
		var columnsArray = [];
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

					columnsArray.push(columnValues);
				}
			}
		});
		return columnsArray;
	};

	self.toTitleCase = function (str) {
		var lowerCase = str.toLowerCase();
	    return lowerCase.replace(/(?:^|\s)\w/g, function(match) {
	        return match.toUpperCase();
	    });
	}

	return self;
});