<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
	<head>
		<%@include file="/WEB-INF/jsp/head.jsp"%>
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<link rel="stylesheet" type="text/css" href="<%=baseUrl%>bower_components/select2/dist/css/select2.min.css" />
		<link rel="stylesheet" type="text/css" href="<%=baseUrl%>bower_components/select2-bootstrap-theme/dist/select2-bootstrap.min.css" />
		<link rel="stylesheet" type="text/css" href="<%=baseUrl%>bower_components/leaflet/dist/leaflet.css" />
		<link rel="stylesheet" type="text/css" href="css/custom.css" />
	</head>
	<body>
		<div class="container-fluid">
			<header>
				<jsp:include page="template/USGSHeader.jsp">
					<jsp:param name="site-title" value="Environmental Data Discovery and Transformation" />
				</jsp:include>
			</header>
			<div id="main-content"></div>
			<footer>
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
						'contextPath': '<%=baseUrl%>',
						'development': '<%=development%>'
					},
					'models/SiteCollection': {
						'parameterCodesPath': '<%=parameterCodesUrl%>'
				 	},
					'models/PrecipitationCollection' : {
						'precipWFSGetFeatureUrl' : '<%=precipWFSGetFeatureUrl%>',
					}
				},
				baseUrl: "<%=baseUrl%>/js/",
				paths: {
					"bootstrap" :  '<%=baseUrl%>bower_components/bootstrap/dist/js/bootstrap<%= development ? "" : ".min"%>',
					"jquery": '<%=baseUrl%>bower_components/jquery/dist/jquery<%= development ? "" : ".min"%>',
					"backbone": '<%=baseUrl%>bower_components/backbone/backbone<%= development ? "" : "-min"%>',
					"underscore": '<%=baseUrl%>bower_components/underscore/underscore<%= development ? "" : "-min"%>',
					"select2": '<%=baseUrl%>bower_components/select2/dist/js/select2.full<%= development ? "" : ".min"%>',
					"handlebars": '<%=baseUrl%>bower_components/handlebars/handlebars<%= development ? "" : ".min"%>',
					"text": '<%=baseUrl%>bower_components/text/text',
					"hbs" : '<%=baseUrl%>bower_components/requirejs-hbs/hbs',
					'leaflet' : '<%=baseUrl%>bower_components/leaflet/dist/leaflet',
					'leaflet-providers' : '<%=baseUrl%>bower_components/leaflet-providers/leaflet-providers',
					'loglevel' : '<%=baseUrl%>bower_components/loglevel/dist/loglevel<%= development ? "" : ".min"%>',
					'backbone.stickit' : '<%=baseUrl%>bower_components/backbone.stickit/backbone.stickit'
				},
				shim: {
					"bootstrap": [ "jquery" ],
					'leaflet' : {
						exports: 'L'
					},
					'leaflet-providers' : ['leaflet']
				},
				packages : [
					{
						name : 'hbs',
						location: "<%=baseUrl%>bower_components/requirejs-hbs",
						main : 'hbs'
					}
				],
			};
		</script>
		<script data-main="init" src="<%=baseUrl%>bower_components/requirejs/require.js"></script>
	</body>
</html>
