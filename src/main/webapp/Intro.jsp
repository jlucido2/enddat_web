<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
	<head>
		<%@include file="WEB-INF/jsp/head.jsp"%>
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
                <!-- ############### VIEWPORT META TAG ############### -->
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
                <!-- ################################################# -->
		<link rel="stylesheet" type="text/css" href="css/custom.css" />
                <link rel="stylesheet" type="text/css" href="css/splash.css" />
                <script src="<%=baseUrl%>bower_components/jquery/dist/jquery<%= development ? "" : ".min"%>.js"></script>
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
	<jsp:include page="template/USGSHeader.jsp">
		<jsp:param name="site-title" value="Environmental Data Discovery and Transformation" />
	</jsp:include>
        
	 
	
	<jsp:include page="WEB-INF/jsp/sidebar.jsp"></jsp:include>
	
        <div id="splashContent">
            
            <div id="tagline"><h4>Access and Integrate Environmental Observations for Coastal Decision Support</h4></div>     
            
            <h2>Overview</h2>
            <p>
                Welcome to the Environmental Data Discovery and Transformation (EnDDaT) service.  
                EnDDaT is a tool used to discover data from our natural environment.  This tool 
                accesses data from a variety of data sources, compiles and processes the data, 
                and performs common transformations.  The end result is that environmental data 
                from multiple sources is sorted into a single table. See the user guide for step-by-step 
                instructions on obtaining data, specifying transforms, and processing data.
            </p>
            
            <a href="datadiscovery"><button class="splashButton">Begin Data Discovery</button></a>
            
            <a href="UserGuide.jsp"><button class="splashButton">User Guide</button></a>
            
            <h2>Motivation</h2>
            <p>
                As environmental models have become more intricate and comprehensive, the amount of data 
                necessary to build and run the models has increased significantly. As a result, efficient 
                data discovery, aggregation and processing can be a barrier to environmental modeling efforts. 
                For example, in order to develop near-shore water quality forecasting models, which are often 
                times used to predict bacteria concentrations at recreational beaches, two to five years of 
                historical data is commonly needed for model driven and model predicted parameters. 
                Furthermore, real-time or near real-time data is necessary to run models for accurate and time-relevant 
                forecasting.  In order to run the model from the previous example, real-time data with as little lag time 
                as possible (< 6 hours) is necessary in order to predict the bacteria concentrations for that day at a particular 
                beach. 
                To meet these needs associated with environmental modeling, the Environmental Data Discovery and Transformation 
                (EnDDaT) tool was developed with the capabilities of retrieving publicly available data resources through standard 
                Web services, aggregating the disparate data sources, and processing the data through a single Web-accessible user 
                interface. In addition, the tool provides a variety of output formats and data visualization tools. Therefore, these 
                capabilities aid in model development and implementation by allowing scientists to efficiently obtain, aggregate and 
                manipulate the data necessary for these purposes.
            </p>
            
            <h2>Data Sources</h2>
            <p>
                EnDDaT is not the owner or provider of any data.  Instead, EnDDaT gathers data from a variety of data providers. 
                The data providers are listed on the left side bar. 
                EnDDaT has been designed especially to gather data that uses recognized web standards such as SOS, WQX, and Thredds.  
                However, if data is deemed useful for environmental modeling, custom data gathering tools and data parsers can be 
                included.
            </p>
            
            <h2>Feedback</h2>
            <p>
                Questions, comments, and requests are welcome.  Please email enddat@usgs.gov
            </p>
        </div>
			  
	<jsp:include page="template/USGSFooter.jsp">
		<jsp:param name="site-url" value="http://cida.usgs.gov/enddat" />
		<jsp:param name="contact-info" value="<a href='mailto:enddat@usgs.gov'>Enddat Team</a>" />
	</jsp:include>
        
        
   </body>
</html>
