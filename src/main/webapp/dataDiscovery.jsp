<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
	<head>
		<%@include file="/WEB-INF/jsp/head.jsp"%>
		<link rel="stylesheet" type="text/css" href="bower_components/select2/dist/css/select2.min.css" />
		<link rel="stylesheet" type="text/css" href="bower_components/leaflet/dist/leaflet.css" />
		<link rel="stylesheet" type="text/css" href="bower_components/leaflet-draw/dist/leaflet.draw.css" />
		<link rel="stylesheet" type="text/css" href="bower_components/blueimp-file-upload/css/jquery.fileupload.css" />
	</head>
	<body>
		<div class="container-fluid">
			<header>
				<jsp:include page="WEB-INF/jsp/header.jsp"></jsp:include>
			</header>
			<div id="main-content"></div>
			<footer>
				<jsp:include page="WEB-INF/jsp/footer.jsp">
					<jsp:param name="development" value="<%=development%>"></jsp:param>
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
					'utils/VariableDatasetMapping' : {
						'variableDatasetMappingUrl' : 'json/variableDatasetMapping.json'
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
					'models/NWISCollection' : {
						'pmCodesUrl' : '<%=parameterCodesUrl%>',
						'sitesUrl' : '<%=nwisSitesUrl%>'
					},
					'views/ProcessDataView' : {
						'baseUrl' : '<%=baseUrl%>'
					},
					'views/MapView' : {
						'uploadGeoserverUrl' : '<%=shapefileuploadGeoserverUrl%>'
					}
				},
				baseUrl: "js/",
				paths: {
					"bootstrap" :  '../bower_components/bootstrap/dist/js/bootstrap',
					"jquery": '../bower_components/jquery/dist/jquery',
					'jquery-ui/ui/widget' : '../bower_components/blueimp-file-upload/js/vendor/jquery.ui.widget',
					'blueimp-file-upload': '../bower_components/blueimp-file-upload/js/jquery.fileupload',
					"backbone": '../bower_components/backbone/backbone',
					"underscore": '../bower_components/underscore/underscore',
					"select2": '../bower_components/select2/dist/js/select2.full',
					"handlebars": '../bower_components/handlebars/handlebars',
					"text": '../bower_components/text/text',
					"hbs" : '../bower_components/requirejs-hbs/hbs',
					'leaflet' : '../bower_components/leaflet/dist/leaflet',
					'leaflet-providers' : '../bower_components/leaflet-providers/leaflet-providers',
					'leaflet-draw' : '../bower_components/leaflet-draw/dist/leaflet.draw',
					'loglevel' : '../bower_components/loglevel/dist/loglevel',
					'backbone.stickit' : '../bower_components/backbone.stickit/backbone.stickit',
					'moment' : '../bower_components/moment/moment',
					'bootstrap-datetimepicker' : '../bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker',
					'csv' : '../bower_components/csv/lib/csv',
					'filesaver' : '../bower_components/filesaverjs/FileSaver'
				},
				shim: {
					"bootstrap": [ "jquery" ],
					'leaflet' : {
						exports: 'L'
					},
					'filesaver' : {
						exports: 'Filesaver'
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
						location: "../bower_components/requirejs-hbs",
						main : 'hbs'
					}
				]
			};
		</script>
		<% if (development) {
		%>
			<script data-main="init" src="bower_components/requirejs/require.js"></script>
		<%	}
			else {
		%>
			<script src="assets-build/init.js"></script>
		<% }
		%>
	</body>
</html>
