<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
	<head>
		
		<%@include file="/WEB-INF/jsp/head.jsp"%>
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<link rel="stylesheet" type="text/css" href="css/custom.css" />
	</head>
	<body>
		<div class="container-fluid">
			<header class="row">
				<jsp:include page="template/USGSHeader.jsp">
					<jsp:param name="site-title" value="Environmental Data Discovery and Transformation" />
				</jsp:include>
			</header>
			<div id="main-content" class="row"></div>
			<footer class="row">
				<jsp:include page="template/USGSFooter.jsp">
					<jsp:param name="site-url" value="http://cida.usgs.gov/enddat" />
					<jsp:param name="contact-info" value="<a href='mailto:enddat@usgs.gov'>Enddat Team</a>" />
				</jsp:include>
			</footer>	
		</div>
		<script>
			var require = {
				config: {
					'init': {
						'contextPath': "<%=baseUrl%>/"
					}
				},
				baseUrl: "<%=baseUrl%>/js/",
				paths: {
					"bootstrap" :  ["<%=baseUrl%>/bower_components/bootstrap/dist/js/bootstrap<%= development ? "" : ".min"%>"] ,
					"jquery": ["<%=baseUrl%>/bower_components/jquery/dist/jquery<%= development ? "" : ".min"%>"],
					"backbone": ['<%=baseUrl%>/bower_components/backbone/backbone<%= development ? "" : "-min"%>'],
					"underscore": ['<%=baseUrl%>/bower_components/underscore/underscore<%= development ? "" : "-min"%>'],
					"handlebars": ['<%=baseUrl%>/bower_components/handlebars/handlebars<%= development ? "" : ".min"%>'],
					"text": ['<%=baseUrl%>/bower_components/text/text'],
				},
				shim: {
					"bootstrap": [ "jquery" ]
				}
			};
		</script>
		<script data-main="init" src="<%=baseUrl%>/bower_components/requirejs/require.js"></script>
	</body>
</html>
