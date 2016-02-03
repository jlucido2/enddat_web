
<%@page import="java.io.File"%>
<%@page import="java.net.URL"%>
<%@page import="org.slf4j.Logger"%>
<%@page import="org.slf4j.LoggerFactory"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>

<%!    
    private static final Logger log = LoggerFactory.getLogger("index.jsp");
    protected DynamicReadOnlyProperties props = null;

    {
        try {
            URL applicationProperties = getClass().getClassLoader().getResource("application.properties");
            File propsFile = new File(applicationProperties.toURI());
            props = new DynamicReadOnlyProperties(propsFile);
            props = props.addJNDIContexts(new String[0]);
        } catch (Exception e) {
            log.error("Could not set up properties");
        }
    }

%>
<%
    boolean development = Boolean.parseBoolean(props.getProperty("enddat.development"));
    request.setAttribute("development", development);
    
    String applicationVersion = props.get("version");
    request.setAttribute("applicationVersion", props.get("version"));
    request.setAttribute("jqueryVersion", props.get("jquery.version"));
    request.setAttribute("bootstrapVersion", props.get("bootstrap.version"));
	request.setAttribute("select2Version", props.get("select2.version"));
	request.setAttribute("backboneVersion", props.get("backbone.version"));
	request.setAttribute("underscoreVersion", props.get("underscore.version"));
	request.setAttribute("handlebarsVersion", props.get("handlebars.version"));
    
    request.setAttribute("fontawesomeVersion", props.get("fontawesome.version"));
    request.setAttribute("jstsVersion", props.get("jsts.version"));

%>

