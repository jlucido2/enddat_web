<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
	<%@include file="/WEB-INF/jsp/head.jsp"%>
	<%@include file="/WEB-INF/jsp/statusHead.jsp"%>
	<script src="bower_components/jquery/dist/jquery<%= development ? "" : ".min"%>.js"></script>
    </head>
    <body>
	<jsp:include page="WEB-INF/jsp/header.jsp">
	    <jsp:param name="baseUrl" value="<%=baseUrl%>"></jsp:param>
	</jsp:include>

	<div class="container">
	    <h1>Status for Enddat Data Source Services</h1>
	    <p class="alert-messages"></p>
	    <div class="col-sm-6">
	    <table class="status-table table table-striped">
		<thead>
		    <tr>
			<th>Service Name</th>
			<th>Status</th>
		    </tr>
		</thead>
		<tbody></tbody>
	    </table>
	    </div>
	</div>
	<jsp:include page="WEB-INF/jsp/footer.jsp">
	    <jsp:param name="development" value="<%=development%>"></jsp:param>
	</jsp:include>
	
	<script type="text/javascript" src="bower_components/jquery/dist/jquery<%=development ? "": "min"%>.js"></script>
	<script type="text/javascript" src="bower_components/handlebars/handlebars.js"></script>
	<script type="text/javascript" src="bower_components/underscore/underscore<%= development ? "" : "-min"%>.js"></script>
	
	<script type="text/javascript" src="js/serviceStatusOnReady.js"></script>
	<script>
	    var ENDDAT = ENDDAT || {};
	    ENDDAT.ServiceStatusConfig = [
		{
		    urlmatch: '<%=nwisstatUrlMatch%>',
		    display: '<%=nwisstatDisplay%>'
		}, {
		    urlmatch: '<%=nwispmcodeUrlMatch%>',
		    display: '<%=nwispmcodeDisplay%>'
		}, {
		    urlmatch: '<%=nwissiteUrlMatch%>',
		    display: '<%=nwissiteDisplay%>'
		}, {
		    urlmatch: '<%=precipUrlMatch%>',
		    display: '<%=precipDisplay%>'
		}, {
		    urlmatch: new RegExp('<%=metadataUrlMatch%>' + '(.*)' + '<%=precipmetadataUrlMatch%>'),
		    display: '<%=precipmetadataDisplay%>'
		},{
		    urlmatch: new RegExp('<%=metadataUrlMatch%>' + '(.*)' + '<%=eriemetadataUrlMatch%>'),
		    display: '<%=eriemetadataDisplay%>'
		}, {
		    urlmatch: new RegExp('<%=metadataUrlMatch%>' + '(.*)' + '<%=huronmetadataUrlMatch%>'),
		    display: '<%=huronmetadataDisplay%>'
		}, {
		    urlmatch: new RegExp('<%=metadataUrlMatch%>' + '(.*)' + '<%=michiganmetadataUrlMatch%>'),
		    display: '<%=michiganmetadataDisplay%>'
		}, {
		    urlmatch: new RegExp('<%=metadataUrlMatch%>' + '(.*)' + '<%=ontariometadataUrlMatch%>'),
		    display: '<%=ontariometadataDisplay%>'
		}, {
		    urlmatch: new RegExp('<%=metadataUrlMatch%>' + '(.*)' + '<%=superiormetadataUrlMatch%>'),
		    display: '<%=superiormetadataDisplay%>'
		}, {
		    urlmatch: '<%=ecUrlMatch%>',
		    display: '<%=ecDisplay%>'
		}, {
		    urlmatch: '<%=acisUrlMatch%>',
		    display: '<%=acisDisplay%>'
		}, {
		    urlmatch: '<%=glcfsUrlMatch%>',
		    display: '<%=glcfsDisplay%>'
		}
	    ];
	</script>
    </body>
</html>
