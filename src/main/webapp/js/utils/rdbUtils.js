/*jslint browser: true */

define([
	'underscore'
], function (_) {
	"use strict";

	var self = {};

	/*
	 * Function assumes that the file uses rdb formatting, that columns are separated by tabs, that rows
	 * that begin with a # characters are comments, that the first non comment line are the column keys, and
	 * that the line following this line does not contain data.
	 * Note that the function handles Strings where the lines end in \n (linefeed) or in \r followed by \l
	 * (carriage return followed by linefeed)
	 * @param {String} data - Contents have rdb formatting.
	 * @returns {Array of Objects} - where object keys are the column names and the values are the column value
	 */
	self.parseRDB = function(data) {
		var lines = data.split('\n');
		var rows = []; // Array of Arrays - each representing a row and column
		var colKeys = [];

		rows = _.chain(lines)
			.reject(function(lineString) {
				return (lineString.length === 0) || lineString[0] === '#';
			})
			.map(function(rowString) {
				// Removes any trailing carriage return and then splits the row into columns
				if (_.last(rowString) === '\r') {
					rowString = rowString.substring(0, rowString.length - 2);
				}
				return rowString.split('\t');
			})
			.value();

		colKeys = rows[0];
		//Skip the line after the column headers
		return _.map(rows.slice(2), function(row) {
			return _.object(colKeys, row);
		});
	};

	/* @param	{Object} string
	 * returns	{Object} string - Removes special characters and capitalizes each character which follows a space.
	 */
	self.toTitleCase = function (str) {
		var lowerCase = str.toLowerCase();
	    return lowerCase.replace(/(?:^|\s)\w/g, function(match) {
	        return match.toUpperCase();
	    });
	};

	return self;
});