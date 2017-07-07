<%@page import="java.io.File"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="org.apache.commons.lang.StringUtils"%>

<%
	String nwisstatUrlMatch = props.getProperty("enddat.status.nwisstat.urlmatch");
	String nwisstatDisplay = props.getProperty("enddat.status.nwisstat.display");
	String nwispmcodeUrlMatch = props.getProperty("enddat.status.nwispmcode.urlmatch");
	String nwispmcodeDisplay = props.getProperty("enddat.status.nwispmcode.display");
	String nwissiteUrlMatch = props.getProperty("enddat.status.nwissite.urlmatch");
	String nwissiteDisplay = props.getProperty("enddat.status.nwissite.display");
	String precipUrlMatch = props.getProperty("enddat.status.precip.urlmatch");
	String precipDisplay = props.getProperty("enddat.status.precip.display");
	String metadataUrlMatch = props.getProperty("enddat.status.metadata.urlmatch");
	String precipmetadataUrlMatch = props.getProperty("enddat.status.precipmetadata.urlmatch");
	String precipmetadataDisplay = props.getProperty("enddat.status.precipmetadata.display");
	String eriemetadataUrlMatch = props.getProperty("enddat.status.eriemetadata.urlmatch");
	String eriemetadataDisplay = props.getProperty("enddat.status.eriemetadata.display");
	String huronmetadataUrlMatch = props.getProperty("enddat.status.huronmetadata.urlmatch");
	String huronmetadataDisplay = props.getProperty("enddat.status.huronmetadata.display");
	String michiganmetadataUrlMatch = props.getProperty("enddat.status.michiganmetadata.urlmatch");
	String michiganmetadataDisplay = props.getProperty("enddat.status.michiganmetadata.display");
	String ontariometadataUrlMatch = props.getProperty("enddat.status.ontariometadata.urlmatch");
	String ontariometadataDisplay = props.getProperty("enddat.status.ontariometadata.display");
	String superiormetadataUrlMatch = props.getProperty("enddat.status.superiormetadata.urlmatch");
	String superiormetadataDisplay = props.getProperty("enddat.status.superiormetadata.display");
	String ecUrlMatch = props.getProperty("enddat.status.ec.urlmatch");
	String ecDisplay = props.getProperty("enddat.status.ec.display");
	String acisUrlMatch = props.getProperty("enddat.status.acis.urlmatch");
	String acisDisplay = props.getProperty("enddat.status.acis.display");
	String glcfsUrlMatch = props.getProperty("enddat.status.glcfs.urlmatch");
	String glcfsDisplay = props.getProperty("enddat.status.glcfs.display");
%>