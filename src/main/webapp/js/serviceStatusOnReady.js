/* jslint browser: true */
/* global $ */
/* global Handlebars */
/* global _ */
/* global ENDDAT */

$(document).ready(function() {
    console.log('Starting set up code.');
    var TIME_TOKEN = /^Service status:/;
    var URL_TOKEN = "URL:";
    var STATUS_TOKEN = " status:";
    
    var TABLE_HTML = '{{#each status}}' +
	    '<tr>' +
	    '<td>{{name}}</td>' +
	    '<td><a href="{{url}}">{{url}}</a></td>' +
	    '<td>{{status}}</td>' + 
	    '</tr>' + 
	    '{{/each}}';
    var tableTemplate = Handlebars.compile(TABLE_HTML);
    var $message = $('.alert-messages');
    
    /*
     * Assumes that the line contains the URL_TOKEN and that the line
     * can be split into three pieces by comma. First is the url, second is the 
     * response code, and the third is the status
     * @param {type} name
     * @param {type} line
     * @returns {state object for the line}
     * 
     */
    var getServiceState = function(name, line) {
	var lineInfo;
	var result = {
	    name: name
	};
	if (line) {
	    lineInfo = line.split(',')
	    result.url = lineInfo[0].slice(URL_TOKEN.length);
	    result.status = lineInfo[2].slice(STATUS_TOKEN.length);
	}
	else {
	    result.url = 'Not tested';
	    result.status = 'Unknown';
	}
	return result;
    };
    
    /*
     * @return 
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
	    var timeStr = '';
	    var timeStrIndex;
	    var i = 0;
	    while (timeStr === '' && i < respLines.length) {
		timeStrIndex = respLines[i].search(TIME_TOKEN);
		if (timeStrIndex !== -1) {
		    timeStr = respLines[i].replace(TIME_TOKEN, '');
		}
		i = i + 1;
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
    console.log('Made ajax call');
});



