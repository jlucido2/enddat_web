/* jslint browser: true */

define([
	'leaflet'
], function(L) {
	"use strict";

	var toOptionsHtml = function(filterOptions) {
		return filterOptions.map(function(option) {
			return '<option value="' + option.id + '">' + option.text + '</option>';
		}).join('');
	}
	/*
	 * @constructs
	 * @param {Object} options
	 *		New properties
	 *		@prop {Array of Object} filterOptions - objects have id and text property used to initialize the select widget
	 *		@prop {String} tooltip (optional) - tooltip will be displayed when hovering over control
 	 *		@prop {String} initialValue (optional) - Should match one of the objects' id property in options
 	 *		@prop {Function} changeHandler (optional) - Called when the select is updated
	 *			@prop {Object} ev - The DOM change event object
	 */
	var Control = L.Control.extend({
		options: {
			position : 'topright',
			tooltip : '',
			initialValue : '',
			filterOptions : [],
			changeHandler : undefined
		},

		initialize : function(options) {
			L.setOptions(this, options);
			L.Control.prototype.initialize.call(this, options);

			this._selectEl = undefined;
		},

		setValue : function(newValue) {
			if (this._selectEl) {
				this._selectEl.value = newValue;
			}
		},

		getValue : function() {
			this._selectEl.value;
		},

		updateFilterOptions : function(newFilterOptions) {
			this._selectEl.innerHTML = toOptionsHtml(newFilterOptions);
		},

		onAdd : function(map) {
			var container = L.DomUtil.create('div', 'leaflet-select-filter-div');
			this._selectEl = L.DomUtil.create('select', 'leaflet-filter-picker', container);
			if (this.options.tooltip) {
				this._selectEl.title = this.options.tooltip;
			}
			this._selectEl.innerHTML = toOptionsHtml(this.options.filterOptions);
			if (this.options.changeHandler) {
				L.DomEvent.addListener(this._selectEl, 'change', this.options.changeHandler);
				L.DomEvent.disableClickPropagation(this._selectEl);
			}

			return container;
		},

		onRemove : function(map) {
			if (this.options.changeHandler) {
				L.DomEvent.removeListener(this._selectEl, 'change', this.options.changeHandler);
			}
		}
	});

	var control = function(options) {
		return new Control(options);
	};

	return control;
});

