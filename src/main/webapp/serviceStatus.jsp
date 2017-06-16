<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<head>
</head>
<html>
    <head>
	<%@include file="/WEB-INF/jsp/head.jsp"%>

    </head>
    <body>
	<jsp:include page="WEB-INF/jsp/header.jsp">
	    <jsp:param name="baseUrl" value="<%=baseUrl%>"></jsp:param>
	</jsp:include>

	<jsp:include page="WEB-INF/jsp/sidebar.jsp"></jsp:include>

	<h1>Hello World!</h1>

	<jsp:include page="WEB-INF/jsp/footer.jsp">
	    <jsp:param name="development" value="<%=development%>"></jsp:param>
	</jsp:include>
    </body>
</html>
