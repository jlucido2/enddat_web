<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
	<head>
		<%@include file="WEB-INF/jsp/head.jsp"%>
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
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
					<jsp:param name="site-title" value="Environmental Data Discovery and Transformation - BETA" />
				</jsp:include>
			</header>
			<div id="userGuideContent"></div>
			<footer>
				<jsp:include page="template/USGSFooter.jsp">
					<jsp:param name="site-url" value="https://cida.usgs.gov/enddat" />
					<jsp:param name="contact-info" value="<a href='mailto:enddat@usgs.gov'>Enddat Team</a>" />
				</jsp:include>
			</footer>
		</div>
	</body>
</html>