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
	if (!baseUrl.endsWith("/")) { baseUrl += "/"; }
	String version = props.getProperty("application.version");

	String parameterCodesUrl = props.getProperty("enddat.endpoint.nwis.pmcodes");
	String precipWFSGetFeatureUrl = props.getProperty("enddat.endpoint.precip.wfsgetfeature");
%>

<link rel="shortcut icon" type="image/ico" href="img/favicon.ico">
<jsp:include page="/template/USGSHead.jsp">
	<jsp:param name="shortName" value="Environmental Data Discovery and Transformation Service"/>
	<jsp:param name="relPath" value="<%= baseUrl %>" />
	<jsp:param name="title" value="EnDDaT" />
	<jsp:param name="description" value="EnDDaT is a data discovery, aggregation, and processing tool for scientific modelers focusing on Great Lakes beaches." />
	<jsp:param name="author" value="" />
	<jsp:param name="keywords" value="USGS, U.S. Geological Survey, water, earth science, hydrology, hydrologic, data, streamflow, stream, river, lake, flood, drought, quality, basin, watershed, environment, ground water, groundwater" />
	<jsp:param name="publisher" value="" />
	<jsp:param name="revisedDate" value="" />
	<jsp:param name="nextReview" value="" />
	<jsp:param name="expires" value="never" />
	<jsp:param name="google-analytics-account-code" value="" />
	<jsp:param name="development" value="<%=development%>" />
</jsp:include>
