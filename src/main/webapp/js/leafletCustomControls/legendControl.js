/* jslint browser: true */

define([
	'leaflet',
	'underscore',
	'Config'
], function(L, _, Config) {

	var COLLAPSE_ICON = 'fa fa-minus';
	var EXPAND_ICON = 'fa fa-plus';

	var Control = L.Control.extend({
		options : {
			position : 'topleft',
			collapsed : true
		},

		initialize : function(options) {
			L.setOptions(this, options);
			L.Control.prototype.initialize.call(this, options);

			this._legendDisplayDiv = undefined;
			this._panelToggle = undefined;
		},

		onAdd : function(map) {
			var container = L.DomUtil.create('div', 'leaflet-legend-div');
			var headerDiv = L.DomUtil.create('div', 'leaflet-legend-panel-header', container);
			var titleSpan = L.DomUtil.create('span', 'leaflet-legend-panel-header-title', headerDiv);
			var projLocDiv;

			headerDiv.title = "show/Hide Legend";
			titleSpan.innerHTML = 'Legend';
			this._panelToggle = L.DomUtil.create('span', 'leaflet-legend-panel-header-toggle', headerDiv);
			this._panelToggle.innerHTML = '<i></i>';

			this._legendDisplayDiv = L.DomUtil.create('div', 'leaflet-legend-body', container);

			projLocDiv = L.DomUtil.create('div', 'leaflet-legend-marker-div', this._legendDisplayDiv);
			projLocDiv.innerHTML = '<img src="' + Config.PROJ_LOC_ICON_URL + '" /><span>Project Location</span>';
			_.each(Config.DATASET_ICON, function(value, key) {
				var imgDiv = L.DomUtil.create('div', 'leaflet-legend-marker', this._legendDisplayDiv);
			    imgDiv.innerHTML = '<img src="' + value.iconUrl + '" /><span>' + key + '</span>';
			}, this);

			this.setVisibility(this.options.collapsed);

			//Add toggle handler for control collapse button
			L.DomEvent.on(headerDiv, 'click', this._toggleVisibilityHandler, this);
			L.DomEvent.disableClickPropagation(headerDiv);

			return container;
		},

		setVisibility : function(collapse) {
			var toggleEl = this._panelToggle.getElementsByTagName('i')[0];
			if (collapse) {
				toggleEl.className = EXPAND_ICON;
				this._legendDisplayDiv.style = "display:none;";
			}
			else {
				toggleEl.className = COLLAPSE_ICON;
				this._legendDisplayDiv.style = "display:block;";
			}
		},

		_toggleVisibilityHandler : function(ev) {
			var toggleEl = this._panelToggle.getElementsByTagName('i')[0];
			this.setVisibility(toggleEl.className === COLLAPSE_ICON);
		}
	});

	var control = function(options) {
		return new Control(options);
	};

	return control;
});


