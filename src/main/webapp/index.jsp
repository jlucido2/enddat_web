<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
	<head>
		<%@include file="/jsp/base.jsp"%>
		<meta name="fragment" content="!">
		<meta http-equiv="X-UA-Compatible" content="IE=Edge"/>
		<!-- JQuery -->
		<script type="text/javascript" src="webjars/jquery/${jqueryVersion}/jquery.js"></script>

		<script type="text/javascript">
			(function(){
				window.CONFIG = {};
				CONFIG.contextPath = "${pageContext.request.contextPath}";
				CONFIG.endpoint = {};
				CONFIG.endpoint.direct = {};

				//This is solely to not break IE, TODO: bring in logging lib
				if(!window.console) {
					window.console = {
						log : function() {},
						dir : function() {},
						error : function() {}
					};
				}
			}());
			$(document).ready(function() {
				$('#ie9-warning-modal').modal();
			});
		</script>
	</head>
	<body>
		<!--[if lt IE 10]>
			<div id="ie9-warning-modal" class="modal fade">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h4 class="modal-title">IE9 and lower not supported</h4>
						</div>
						<div class="modal-body">
							<p>The application has been tested in the latest versions of Chrome, Firefox, and Safari and has been tested on IE10 and IE11.</p>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
						</div>
					</div>
				</div>
			</div>
		<![endif]-->
		<div class="container-fluid">
			<div class="row site_body_content">
				<div id="site_content" class="col-xs-12">
				</div>
			</div>
		</div>
		<!-- Twitter Bootstrap -->
		<link rel="stylesheet" type="text/css" href="webjars/bootstrap/${bootstrapVersion}/css/bootstrap.css"/>
		<script type="text/javascript" src="webjars/bootstrap/${bootstrapVersion}/js/bootstrap.js"></script>
		<!-- select 2 style -->
		<link rel="stylesheet" type="text/css" href="webjars/select2/${select2Version}/select2.css" />
		<link rel="stylesheet" type="text/css" href="webjars/select2/${select2Version}/select2-bootstrap.css" />
		<!-- USGS CSS -->
		<link rel="stylesheet" type="text/css" href="css/usgs_common.css"/>
		<link rel="stylesheet" type="text/css" href="css/usgs_style_main.css"/>

		<!-- Site CSS -->
		<link rel="stylesheet" type="text/css" href="css/custom.css"/>
		<link rel="stylesheet" type="text/css" href="webjars/font-awesome/${fontawesomeVersion}/css/font-awesome.css"/>

		<!-- Our Bootstrap Theme -->
		<link rel="stylesheet" type="text/css" href="css/theme1.css"/>
		
		<!-- vendor libraries -->
		<script type="text/javascript" src="webjars/underscorejs/${underscoreVersion}/underscore.js"></script>
		<script type="text/javascript" src="webjars/backbonejs/${backboneVersion}/backbone.js"></script>
		<script type="text/javascript" src="webjars/handlebars/${handlebarsVersion}/handlebars.js"></script>
		<script type="text/javascript" src="webjars/jsts/${jstsVersion}/javascript.util.js"></script>
		<script type="text/javascript" src="webjars/jsts/${jstsVersion}/jsts.js"></script>
		
		<!-- order is important -->
		<script type="text/javascript" src="js/utils/templateLoader.js"></script>
		
		<script type="text/javascript" src="js/view/BaseView.js"></script>
		
		<script type="text/javascript" src="js/view/HomeView.js"></script>
		<script type="text/javascript" src="js/controller/ENDDATRouter.js"></script>
		
		<script type="text/javascript" src="js/init.js"></script>
	</body>
</html>
