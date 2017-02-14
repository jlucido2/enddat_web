<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
	<head>
		<%@include file="WEB-INF/jsp/head.jsp"%>
		<script type="text/javascript">
			window.onload = function() {
				var imgs = document.getElementsByTagName('img'), i, img;
				for (i = 0; i < imgs.length; i++) {
				img = imgs[i];
				// center an image if it is the only element of its parent
				if (img.parentElement.childElementCount === 1)
					img.parentElement.style.textAlign = 'center';
				}
			};
		</script>
	</head>
	<body>
		<div class="container-fluid">
			<header>
				<jsp:include page="WEB-INF/jsp/header.jsp">
					<jsp:param name="baseUrl" value="<%=baseUrl%>"></jsp:param>
				</jsp:include>
			</header>
			<div id="userGuideContent">

				<h1>The Environmental Data Discovery and Transformation System</h1>

				<p>
					<em>This user guide is based on the re-implementation of the EnDDaT user interface: 
					<a href="https://cida.usgs.gov/enddat/">https://cida.usgs.gov/enddat/</a></em>
				</p>

				<h2><a href="#overview">Overview</a></h2>

				<p>
					The Environmental Data Discovery and Transformation (EnDDaT) service is a tool used to 
					discover data from a variety of data sources, aggregate and process the data, and perform basic 
					transformations. The end result is that environmental data from multiple sources is compiled into 
					a single table. This user guide will step through the process of specifying an area of interest, 
					choosing data, processing and obtaining data. It also describes available transforms and processing 
					available for the data.
				</p>

				<hr>

				<h2><a href="#dataDiscovery">Data Discovery</a></h2>

				<p>
					EnDDaT&#39;s data discovery starts with an area of interest. You can specify your area of interest in 
					one of two ways: 1) click a point on the map or enter the latitude and longitude of a point and specify a 
					search radius, or 2) by drawing a box. In either mode, you can upload a zipped shapefile for spatial reference 
					so you know how particular sites relate to your study zone.
				</p>

				<p>
					The image below shows a zip file containing four shapefile components that are required to show the data on a 
					map (1). The bounding box draw and edit tools (2) are on the left side of the map just below the legend. When 
					the edit tools are activated, as shown by 2, the corners can be dragged to change the size or shape of the box. 
					The whole box can also be moved by clicking and dragging the white dot in the middle of the box (3). Once you 
					are happy with your point and radius or your bounding box, you are ready to move on to Choose Data.
				</p>

				<p><img src="img/bbox.png" alt="">  </p>

				<h2><a href="#chooseData">Choose Data</a></h2>

				<p>
					EnDDaT provides two methods for selecting data. The first suited to looking closely at what is available from 
					particular sites and the other suited to getting all the data that is available for a given variable in your 
					area of interest. They are called: 1) &quot;Select from available variables one site at a time&quot; and 
					2) &quot;Select variables for many sites by variable type&quot;.
				</p>

				<h3>Select from available variables one site and a time</h3>

				<p>
					In this choose data mode, you specify data sources then discover the available variables for the sites which 
					the chosen data sources offer. As shown in the image below, clicking on the <em>Data Sources</em> field (1) 
					shows the data source options. The date filter (2) ensures that the sites shown have some data in the date 
					range desired. After a data source is chosen and the optional date range is set, sites are then displayed on 
					the map (3). When you click on a site, the variables available for the site are shown to the right of the map (4).
				</p>

				<p><img src="img/bySite.png" alt="">  </p>

				<hr>

				<p>
					As shown in the image below, when a site is clicked on the map (1), and variables from that site are selected 
					(2), those variables are added to the <em>Selected Variables</em> list for later use (3). Once all variables 
					of interest are added to the <em>Selected Variables</em> list, you are ready to move on to the Process Data step.
				</p>

				<p><img src="img/selected.png" alt="">  </p>

				<hr>

				<h3>Select variables for many sites by variable type</h3>

				<p>
					The second choose data method allows selection of all the variables of a specified type inside the area you&#39;ve 
					specified. In this case, you specify variables of interest and then have the option to deselect sites in the case 
					that data from that site is not desired. As shown in the image below, variables of interest and an optional date 
					filter are selected (1), sites can be clicked to deselect them (2), sites with a given variable are shown on the map 
					based on the pull down menu on the right of the map (3), and all selected sites/variables are listed in the 
					<em>Selected Variables</em> list (4). Once all variables of interest are selected, you are ready to move on to data 
					processing.
				</p>

				<p><img src="img/byVariable.png" alt=""></p>

				<div id="dataProcessing">
					<h2><a href="#dataProcessing">Data Processing</a></h2>
				</div>

				<p>
					EnDDaT&#39;s data processing service can apply temporal summaries, limit retrievals by date range or particular dates, 
					and offer data formatting options.  
				</p>

				<hr>

				<p>
					In the image below, (1) shows that a 24 hour sum of the 1 hr total precipitation is requested for three precipitation 
					sites and the 168 hour (7 day) mean is also being request for all the variables selected. Water-year 2015 is selected 
					in the date filter (2), and the output has been configured to use <code>NaN</code> as the missing value and to delimit 
					the file with commas (3). Time series processing is described in the <em>Statistical Processing</em> section below.
				</p>

				<p><img src="img/processSettings.png" alt="">  </p>

				<hr>
				
				<p>
					Click this ‘Upload Times’ button to upload a text file with a list of timestamps to filter the output data. If a file is not 
					uploaded, the entire time series will be retrieved. The timezone of these dates/times will be defaulted to GMT if not specified. 
					Acceptable formats:
				</p>

				<p>
					7/5/2010 13:30
					7/6/2010 09:30
					7/7/2010 15:30
					7/8/2010 13:30
					7/9/2010 13:30
				</p>

				<p>
					Or 
					07/05/2010 13:30
					07/06/2010 09:30
					07/07/2010 15:30
					07/08/2010 13:30
					07/09/2010 13:30
				</p>

				<p>
					Or
					07/05/2010 13:30 CDT
					07/06/2010 09:30 CDT
					07/07/2010 15:30 CDT
					07/08/2010 13:30 CDT
					07/09/2010 13:30 CDT
				</p>

				<h3>Obtaining Data</h3>

				<p>
					At this stage, the url to retrieve the data can be shown, the data can be downloaded, and a file containing site 
					metadata can be downloaded. In the case that a data request for all sites/variables fits in one URL, as in the 
					example shown for <em>Select from available variables one site and a time</em>, a single data processing URL is 
					shown for retrieving all of the chosen data. In the case that a single processing URL would be too long, the 
					<em>Get data</em> and <em>Download</em> buttons become inactive and only the <em>Show data processing url</em> 
					and <em>Download site metadata</em> buttons can be clicked.  
				</p>

				<p>
					The site metadata file, like shown in the image below, contains 9 columns: the data source, unique site number, 
					site name, longitude, latitude, elevation, elevation units, list of selected variables for that site, and the 
					EnDDaT services processing URL to get the variables listed. This file can be used in a script that will iterate 
					over the EnDDaT service URLs to download data for each site.<br>
					<img src="img/siteMetadata.png" alt="">
				</p>

				<p>Here is a snipit of R code that can be used to download data from the sitemetadata file.  </p>

				<pre><code>sitemetadata&lt;-read.delim(&#39;./sitemetadata.tsv&#39;,stringsAsFactors = FALSE)
				dlFiles&lt;-c()
				for(site in 1:length(sitemetadata$url)) {
				  fileName&lt;-paste0(sitemetadata$dataset[site],&#39;_&#39;,sitemetadata$siteNo[site],&#39;.tsv&#39;)
				  message(paste(&#39;Downloading file&#39;, site, &#39;of&#39;, length(sitemetadata$url), &#39;-&#39;, fileName))
				  dl&lt;-download.file(sitemetadata$url[site],fileName)
				  if (dl == 0) dlFiles&lt;-fileName
				}
				</code></pre>

				<h3>Statistical Processing</h3>

				<p>The following statistical processes are available: mean (μ), minimum, maximum, and summation (Σ), 
					difference (Δ), max difference (max Δ), and standard deviation (σ). They require the user to specify 
					a time period (e.g. mean over 6 hours). The equations are as follows:
				</p>

				<p><img src="img/statProcesses.png" alt="">  </p>

				<p>A simple example is provided to demonstrate how N is found. The requested period is 60 minutes.  </p>

				<table><thead>
				<tr>
				<th>Time (minutes)</th>
				<th>Value (x)</th>
				<th>Mean (μ)</th>
				<th>Min</th>
				<th>Max</th>
				<th>Summation (Σ)</th>
				<th>Difference (Δ)</th>
				<th>Max Diff (max Δ)</th>
				<th>St.Dev (σ)</th>
				</tr>
				</thead><tbody>
				<tr>
				<td>0</td>
				<td>1</td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				</tr>
				<tr>
				<td>15</td>
				<td>3</td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				</tr>
				<tr>
				<td>30</td>
				<td>2</td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				</tr>
				<tr>
				<td>45</td>
				<td>1</td>
				<td>1.75</td>
				<td>1</td>
				<td>3</td>
				<td>7</td>
				<td>0</td>
				<td>2</td>
				<td>0.829</td>
				</tr>
				<tr>
				<td>60</td>
				<td>1</td>
				<td>1.75</td>
				<td>1</td>
				<td>3</td>
				<td>7</td>
				<td>-2</td>
				<td>2</td>
				<td>0.829</td>
				</tr>
				<tr>
				<td>75</td>
				<td>2</td>
				<td>1.5</td>
				<td>1</td>
				<td>2</td>
				<td>6</td>
				<td>0</td>
				<td>1</td>
				<td>0.5</td>
				</tr>
				<tr>
				<td>90</td>
				<td>1</td>
				<td>1.25</td>
				<td>1</td>
				<td>2</td>
				<td>5</td>
				<td>0</td>
				<td>1</td>
				<td>0.433</td>
				</tr>
				</tbody></table>

			</div>
			<footer>
				<jsp:include page="WEB-INF/jsp/footer.jsp">
					<jsp:param name="development" value="<%=development%>"></jsp:param>
				</jsp:include>
			</footer>
		</div>
	</body>
</html>