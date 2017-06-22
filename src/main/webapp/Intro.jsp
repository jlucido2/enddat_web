<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
	<head>
		<%@include file="/WEB-INF/jsp/head.jsp"%>
		<!-- ############### VIEWPORT META TAG ############### -->
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
		<!-- ################################################# -->
		<script src="bower_components/jquery/dist/jquery<%= development ? "" : ".min"%>.js"></script>
	</head>
	<body>
		<jsp:include page="WEB-INF/jsp/header.jsp">
			<jsp:param name="baseUrl" value="<%=baseUrl%>"></jsp:param>
		</jsp:include>

		<jsp:include page="WEB-INF/jsp/sidebar.jsp"></jsp:include>

		<div id="splashContent">

			<div id="tagline"><h4>Access and Integrate Environmental Observations with EnDDaT</h4></div>
			
			<p> NOTICE: This version of EnDDaT has replaced the old interface, which can still be accessed at <a href="https://cida.usgs.gov/enddat_legacy/">https://cida.usgs.gov/enddat_legacy/</a>. This site will be shutdown 
				on June 30, 2017. Please email <a href="mailto:enddat@usgs.gov?Subject=New%20EnDDaT%20Feedback">enddat@usgs.gov</a> 
				with any questions or concerns.

			<h2>Overview</h2>
			<p>
				Welcome to the Environmental Data Discovery and Transformation (EnDDaT) service;  
				a system you can use to discover data from our natural environment. This tool 
				accesses data from a variety of data sources, compiles and processes the data, 
				and performs common transformations. The result is that environmental data 
				from multiple sources is sorted into a single table that aids model development and 
				similar tasks. See the user guide for step-by-step instructions on obtaining data, 
				specifying transforms, and processing data.
			</p>

			<a href="datadiscovery"><button class="splashButton">Begin Data Discovery</button></a>

			<a href="userguide"><button class="splashButton">User Guide</button></a>

			<h2>Motivating Science Challenge</h2>
			<p>
				As environmental models have become more intricate and comprehensive, the amount of data 
				necessary to build and run the models has increased significantly. As a result, efficient 
				data discovery, aggregation and processing can be a barrier to environmental modeling efforts. 
			</p>	
			<p>
				For example, in order to develop near-shore water quality forecasting models, which are often 
				times used to predict bacteria concentrations at recreational beaches, two to five years of 
				historical data is commonly needed for model driven and model predicted parameters. 
			</p>	
			<p>
				Furthermore, real-time or near real-time data is necessary to run models for accurate and time-relevant 
				forecasting. In order to run the model from the previous example, real-time data with as little lag time 
				as possible (< 6 hours) is necessary in order to predict the bacteria concentrations for that day at a particular 
				beach. 
			</p>

			<h2>Solution</h2>
			<p>
				To meet these needs associated with environmental modeling, the EnDDaT tool was developed with the capabilities 
				of retrieving publicly available data resources through standard Web services, aggregating the disparate data 
				sources, and processing the data through a single online location.
			</p>
			<p>	
				In addition, the tool provides a variety of output formats and data visualization tools. Therefore, these 
				capabilities aid in model development and implementation by allowing scientists to efficiently obtain, aggregate and 
				manipulate the data necessary for these purposes.
			</p>

			<h2>Data Sources</h2>
			<p>
				EnDDaT is not the owner or provider of any data.  Instead, EnDDaT gathers data from a variety of data providers. 
				The data providers are listed on the left side bar. EnDDaT has been designed especially to gather data that uses 
				recognized web standards such as SOS, WQX, and THREDDS. However, if data is deemed useful for environmental modeling, 
				custom data gathering tools and data parsers can be included.
			</p>

			<h2>Feedback</h2>
			<p>
				Questions, comments, and requests are welcome.  Please email <a href="mailto:enddat@usgs.gov?Subject=New%20EnDDaT%20Feedback">enddat@usgs.gov</a>.
			</p>

			<h2>Disclaimer</h2>
			<p>
				This software is preliminary or provisional and is subject to revision. It is being provided to meet the need for timely 
				best science. The software has not received final approval by the U.S. Geological Survey (USGS). No warranty, expressed 
				or implied, is made by the USGS or the U.S. Government as to the functionality of the software and related material nor 
				shall the fact of release constitute any such warranty. The software is provided on the condition that neither the USGS 
				nor the U.S. Government shall be held liable for any damages resulting from the authorized or unauthorized use of the 
				software.
			</p>
		</div>

		<jsp:include page="WEB-INF/jsp/footer.jsp">
			<jsp:param name="development" value="<%=development%>"></jsp:param>
		</jsp:include>
	</body>
</html>
