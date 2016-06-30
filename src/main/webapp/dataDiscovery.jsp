<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
	<head>
		<%@include file="/WEB-INF/jsp/head.jsp"%>
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<link rel="stylesheet" type="text/css" href="<%=baseUrl%>bower_components/select2/dist/css/select2.min.css" />
		<link rel="stylesheet" type="text/css" href="<%=baseUrl%>bower_components/leaflet/dist/leaflet.css" />
		<link rel="stylesheet" type="text/css" href="<%=baseUrl%>bower_components/leaflet-draw/dist/leaflet.draw.css" />
		<link rel="stylesheet" type="text/css" href="bower_components/blueimp-file-upload/css/jquery.fileupload.css" />
		<link rel="stylesheet" type="text/css" href="css/custom.css" />
                <script>
                    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                       m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

                ga('create', 'UA-79713582-1', 'auto');
                ga('send', 'pageview');

                </script>
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
						'baseUrl': '<%=baseUrl%>',
						'development': '<%=development%>'
					},
					'models/NWISCollection': {
						'parameterCodesPath': '<%=parameterCodesUrl%>'
				 	},
					'models/PrecipitationCollection' : {
						'precipWFSGetFeatureUrl' : '<%=precipWFSGetFeatureUrl%>',
						'cidaThreddsPrecipData' : '<%=cidaThreddsPrecipData%>'
					},
					'models/GLCFSCollection' : {
						'glcfsWFSGetFeatureUrls' : {
							'Erie' : '<%=glcfsWFSGetFeatureUrlErie%>',
							'Huron' : '<%=glcfsWFSGetFeatureUrlHuron%>',
							'Michigan' : '<%=glcfsWFSGetFeatureUrlMichigan%>',
							'Ontario' : '<%=glcfsWFSGetFeatureUrlOntario%>',
							'Superior' : '<%=glcfsWFSGetFeatureUrlSuperior%>'
						}
					},
					'models/ACISCollection' : {
						'acisStnMetaUrl' : '<%=acisStnMetaUrl%>'
					},
					'views/ProcessDataView' : {
						'baseUrl' : '<%=baseUrl%>'
					},
					'views/MapView' : {
						'uploadGeoserverUrl' : '<%=shapefileuploadGeoserverUrl%>'
					}
				},
				baseUrl: "<%=baseUrl%>js/",
				paths: {
					"bootstrap" :  '<%=baseUrl%>bower_components/bootstrap/dist/js/bootstrap<%= development ? "" : ".min"%>',
					"jquery": '<%=baseUrl%>bower_components/jquery/dist/jquery<%= development ? "" : ".min"%>',
					'jquery.ui.widget' : '<%=baseUrl%>bower_components/blueimp-file-upload/js/vendor/jquery.ui.widget',
					'blueimp-file-upload': '<%=baseUrl%>bower_components/blueimp-file-upload/js/jquery.fileupload',
					"backbone": '<%=baseUrl%>bower_components/backbone/backbone<%= development ? "" : "-min"%>',
					"underscore": '<%=baseUrl%>bower_components/underscore/underscore<%= development ? "" : "-min"%>',
					"select2": '<%=baseUrl%>bower_components/select2/dist/js/select2.full<%= development ? "" : ".min"%>',
					"handlebars": '<%=baseUrl%>bower_components/handlebars/handlebars<%= development ? "" : ".min"%>',
					"text": '<%=baseUrl%>bower_components/text/text',
					"hbs" : '<%=baseUrl%>bower_components/requirejs-hbs/hbs',
					'leaflet' : '<%=baseUrl%>bower_components/leaflet/dist/leaflet',
					'leaflet-providers' : '<%=baseUrl%>bower_components/leaflet-providers/leaflet-providers',
					'leaflet-draw' : '<%=baseUrl%>bower_components/leaflet-draw/dist/leaflet.draw',
					'loglevel' : '<%=baseUrl%>bower_components/loglevel/dist/loglevel<%= development ? "" : ".min"%>',
					'backbone.stickit' : '<%=baseUrl%>bower_components/backbone.stickit/backbone.stickit',
					'moment' : '<%=baseUrl%>bower_components/moment/<%=development ? "" : "min/"%>moment<%=development ? "" : ".min"%>',
					'bootstrap-datetimepicker' : '<%=baseUrl%>bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker'
				},
				shim: {
					"bootstrap": [ "jquery" ],
					'leaflet' : {
						exports: 'L'
					},
					'leaflet-draw' : ['leaflet'],
					'leaflet-providers' : ['leaflet'],
					'backbone' : {
						deps : ['jquery', 'underscore'],
						exports : 'Backbone'
					},
					'backgrid': {
						deps: ['jquery', 'underscore', 'backbone'],
						exports: 'Backgrid'
					},
					'backbone.stickit' : ['backbone', 'underscore'],
					'bootstrap-datetimepicker' : ['jquery', 'bootstrap', 'moment']
				},
				packages : [
					{
						name : 'hbs',
						location: "<%=baseUrl%>bower_components/requirejs-hbs",
						main : 'hbs'
					}
				]
			};
		</script>
		<script data-main="init" src="<%=baseUrl%>bower_components/requirejs/require.js"></script>
	</body>
</html>
