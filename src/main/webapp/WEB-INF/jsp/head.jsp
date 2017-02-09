<%@page import="java.io.File"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="org.apache.commons.lang.StringUtils"%>

<%!	
	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();
	{
		try {
			File propsFile = new File(getClass().getClassLoader().getResource("application.properties").toURI());
			props = new DynamicReadOnlyProperties(propsFile);
			props = props.addJNDIContexts(new String[0]);
		} catch (Exception e) {
			System.out.println("Could not find JNDI - Application will probably not function correctly");
		}
	}
%>
<%
	Boolean development = Boolean.parseBoolean(props.getProperty("enddat.development"));
	String baseUrl = props.getProperty("enddat.base.url", request.getContextPath());
	if (!baseUrl.endsWith("/")) { baseUrl += "/"; }	String version = props.getProperty("application.version");

	String parameterCodesUrl = props.getProperty("enddat.endpoint.nwis.pmcodes");
	String nwisSitesUrl = props.getProperty("enddat.endpoint.nwis.site");
	String precipWFSGetFeatureUrl = props.getProperty("enddat.endpoint.precip.wfsgetfeature");
	String cidaThreddsPrecipData = props.getProperty("enddat.cidathredds.precipdata");
	String glcfsWFSGetFeatureUrlErie = props.getProperty("enddat.endpoint.glcfs.wfsgetfeature.erie");
	String glcfsWFSGetFeatureUrlHuron = props.getProperty("enddat.endpoint.glcfs.wfsgetfeature.huron");
	String glcfsWFSGetFeatureUrlMichigan = props.getProperty("enddat.endpoint.glcfs.wfsgetfeature.michigan");
	String glcfsWFSGetFeatureUrlOntario = props.getProperty("enddat.endpoint.glcfs.wfsgetfeature.ontario");
	String glcfsWFSGetFeatureUrlSuperior = props.getProperty("enddat.endpoint.glcfs.wfsgetfeature.superior");
	String acisStnMetaUrl = props.getProperty("enddat.endpoint.acis.stnmeta");
	String shapefileuploadGeoserverUrl = props.getProperty("enddat.shapefileupload.geoserver.endpoint");
%>

<link rel="shortcut icon" type="image/ico" href="img/favicon.ico">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="keywords" content="USGS, U.S. Geological Survey, water, earth science, hydrology, hydrologic, data, streamflow, stream, river, lake, flood, drought, quality, basin, watershed, environment, ground water, groundwater">
<title>Environmental Data Discovery and Transformation Service</title>
<meta name="country" content="USA">
<meta name="language" content="EN">
<meta name="description" content="EnDDaT is a data discovery, aggregation, and processing tool for scientific modelers focusing on Great Lakes beaches and hydro-climate data.">
<meta name="expires" content="never">
<link type="text/css" rel="stylesheet" href="css/usgs_style.css" />
<link type="text/css" rel="stylesheet" href="css/custom.css" />

<%-- https://insight.usgs.gov/web_reengineering/SitePages/Analytics_Instructions.aspx --%>
<%-- https://insight.usgs.gov/web_reengineering/SitePages/Analytics_FAQs.aspx --%>
<%if (!development) { %>
<script type="application/javascript" src="https://www2.usgs.gov/scripts/analytics/usgs-analytics.js"></script>
<% } %>

