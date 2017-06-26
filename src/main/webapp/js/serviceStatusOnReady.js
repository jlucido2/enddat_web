/* jslint browser: true */
/* global $ */
/* global Handlebars */
/* global _ */
/* global ENDDAT */

$(document).ready(function() {
    var TIME_TOKEN = /^Service status:/;
    var UP_TOKEN = 'UP';
    
    var TABLE_HTML = '{{#each status}}' +
	    '<tr>' +
	    '<td>{{name}}</td>' +
	    '<td>{{#if status_found}}' +
	    '{{#if is_up}}<i class="fa fa-lg fa-arrow-circle-up" style="color: green;"></i>' +
	    '{{else}}<i class="fa fa-lg fa-arrow-circle-down" style="color: red;"></i>' +
	    '{{/if}}' +
	    '{{else}}' + 
	    '<span>Not tested</span>' +
	    '{{/if}}</td>' + 
	    '</tr>' + 
	    '{{/each}}';
    var tableTemplate = Handlebars.compile(TABLE_HTML);
    var $message = $('.alert-messages');
    
    /*
     * Assumes that the line contains the URL_TOKEN and that the line
     * can be split into three pieces by comma. First is the url, second is the 
     * response code, and the third is the status
     * @param {String} name
     * @param {String} line
     * @returns {Object} which can be used as an element in tableTemplate's context
     */
    var getServiceState = function(name, line) {
	var lineInfo;
	var result = {
	    name: name
	};
	if (line) {
	    lineInfo = line.split(',')
	    result.is_up = lineInfo[2].search(UP_TOKEN) !== -1;
	    result.status_found = true;
	}
	else {
	    result.url = 'Not tested';
	    result.status_found = false;
	}
	return result;
    };
    
    /*
     * @param {Array of String} respLines
     * @return {Array of Objects} which can be used as the context object status in tableTemplate
     */
    var getStatus = function(respLines) {
	return ENDDAT.ServiceStatusConfig.map(function(serviceConfig) {
	    var foundLine = _.find(respLines, function(line) {
		return line.search(serviceConfig.urlmatch) !== -1;
	    });
	    return getServiceState(serviceConfig.display, foundLine);
	});
    };
    
    $.ajax({
	url: 'data/monitor_log.txt',
	type: 'GET',
	dataType: 'text',
	success: function(resp) {
	    var respLines = resp.split('\n');
	    var timeStrLine = _.find(respLines, function(line) {
		return line.search(TIME_TOKEN) !== -1;
	    });
	    var timeStr = '';
	    if (timeStrLine) {
		timeStr = timeStrLine.replace(TIME_TOKEN, '');
	    }
	    
	    if (timeStr) {
		$message.html('Status update at: ' + timeStr).addClass('bg-info');
	    }
	    else {
		$message.html('Can\'t find status update time.').addClass('bg-warning');
	    }
	    
	    $('.status-table tbody').html(tableTemplate({status: getStatus(respLines)}));
	},
	error : function() {
	    $message.html('Unable to retrieve the service status information').addClass('bg-danger');
	}
    });
});



