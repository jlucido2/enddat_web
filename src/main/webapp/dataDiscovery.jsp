<%@page import="java.io.File"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<!DOCTYPE html>
<%!	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();
	{
		try {
			File propsFile = new File(getClass().getClassLoader().getResource("application.properties").toURI());
			props = new DynamicReadOnlyProperties(propsFile);
			props = props.addJNDIContexts(new String[0]);
		} catch (Exception e) {
			System.out.println("Could not find JNDI - Application will probably not function correctly");
		}
	}
	private String getProp(String key) {
		String result = props.getProperty(key, "");
		return result;
	}
	boolean debug = Boolean.parseBoolean(getProp("development"));
	String version = getProp("application.version");
	String resourceSuffix = debug ? "" : "-" + version + "-min";
%>
<%
	String baseUrl = props.getProperty("enddat.base.url", request.getContextPath());
%>

<html>
	<head>
		<jsp:include page="template/USGSHead.jsp">
			<jsp:param name="relPath" value="" />
			<jsp:param name="shortName" value="EnDDaT UI" />
			<jsp:param name="title" value="EnDDaT UI" />
			<jsp:param name="description" value="" />
			<jsp:param name="author" value="" />
			<jsp:param name="keywords" value="" />
			<jsp:param name="publisher" value="" />
			<jsp:param name="revisedDate" value="" />
			<jsp:param name="nextReview" value="" />
			<jsp:param name="expires" value="never" />
			<jsp:param name="development" value="false" />
		</jsp:include>
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/js/bower_components/bootstrap/dist/css/bootstrap<%= debug ? ".css" : ".min.css"%>" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/js/bower_components/font-awesome/css/font-awesome<%= debug ? ".css" : ".min.css"%>" />
	</head>
	<body>
		<div class="container-fluid">
			<jsp:include page="template/USGSHeader.jsp"></jsp:include>
			<div class="row">
				<div id="main-content" class="col-xs-12"></div>
			</div>
			<jsp:include page="template/USGSFooter.jsp"></jsp:include>
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
					"bootstrap" :  ["<%=baseUrl%>/bower_components/bootstrap/dist/js/bootstrap<%= debug ? "" : ".min"%>"] ,
					"jquery": ["<%=baseUrl%>/bower_components/jquery/dist/jquery<%= debug ? "" : ".min"%>"],
					"backbone": ['<%=baseUrl%>/bower_components/backbone/backbone<%= debug ? "" : "-min"%>'],
					"underscore": ['<%=baseUrl%>/bower_components/underscore/underscore<%= debug ? "" : "-min"%>'],
					"handlebars": ['<%=baseUrl%>/bower_components/handlebars/handlebars<%= debug ? "" : ".min"%>'],
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
