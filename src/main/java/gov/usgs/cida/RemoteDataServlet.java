package gov.usgs.cida;

import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.TimeUnit;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.SchemeRegistryFactory;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author dmsibley
 */
public abstract class RemoteDataServlet extends HttpServlet {
	private static final long serialVersionUID = 6027329965159641594L;
	private final static Logger log = LoggerFactory.getLogger(RemoteDataServlet.class);
	
	// Connection pool setup
	private final static int CONNECTION_TTL = 15 * 60 * 1000;       // 15 minutes, default is infinte
	private final static int CONNECTIONS_MAX_TOTAL = 256;
	private final static int CONNECTIONS_MAX_ROUTE = 32;
	// Connection timeouts
	private final static int CLIENT_SOCKET_TIMEOUT = 5 * 60 * 1000; // 5 minutes, default is infinite
	private final static int CLIENT_CONNECTION_TIMEOUT = 15 * 1000; // 15 seconds, default is infinte
	
	protected ThreadSafeClientConnManager clientConnectionManager;
	protected HttpClient httpClient;

	@Override
	public void init() throws ServletException {
		super.init();

		// Initialize connection manager, this is thread-safe.  if we use this
		// with any HttpClient instance it becomes thread-safe.
		clientConnectionManager = new ThreadSafeClientConnManager(SchemeRegistryFactory.createDefault(), CONNECTION_TTL, TimeUnit.MILLISECONDS);
		clientConnectionManager.setMaxTotal(CONNECTIONS_MAX_TOTAL);
		clientConnectionManager.setDefaultMaxPerRoute(CONNECTIONS_MAX_ROUTE);
		log.info("Created HTTP client connection manager: maximum connections total = " + clientConnectionManager.getMaxTotal() + ", maximum connections per route = " + clientConnectionManager.getDefaultMaxPerRoute());

		HttpParams httpParams = new BasicHttpParams();
		HttpConnectionParams.setSoTimeout(httpParams, CLIENT_SOCKET_TIMEOUT);
		HttpConnectionParams.setConnectionTimeout(httpParams, CLIENT_CONNECTION_TIMEOUT);

		httpClient = new DefaultHttpClient(clientConnectionManager, httpParams);
	}

	@Override
	public void destroy() {
		super.destroy();
		clientConnectionManager.shutdown();
	}
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doPost(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		
		HttpContext localContext = new BasicHttpContext();
		
		try {
			HttpUriRequest pageRequest = getPageRequest(req);

			Header[] headers = pageRequest.getAllHeaders();
			for (int i = 0; i < headers.length; i++) {
				log.debug(headers[i].toString());
			}
			
			List<String> idaResponse = makeCall(httpClient, pageRequest, localContext);
			
			Map<String, String[]> respValues = parseResponse(idaResponse);
			
			dispatchResponse(resp, respValues);
			
		} catch (IOException e) {
			log.error("Something bad happened", e);
			dispatchError(resp, "General Error Occurred: " + e.getMessage());
		} catch (Exception e) {
			log.error("Something very bad happened", e);
			dispatchError(resp, "Unexpected General Error Occurred: " + e.getMessage());
		}
	}
	
	protected List<String> makeCall(HttpClient httpClient, HttpUriRequest req, HttpContext localContext) throws ClientProtocolException, IOException {
		List<String> result = new ArrayList<String>();
		
		HttpResponse methodResponse = null;
		if (null == localContext) {
			methodResponse = httpClient.execute(req);
		} else {
			methodResponse = httpClient.execute(req, localContext);
		}
		
		HttpEntity methodEntity = methodResponse.getEntity();
		
		if (methodEntity != null) {
			
			InputStream is = null;
			try {
				is = methodEntity.getContent();
				
				List<String> response = IOUtils.readLines(is);
				
				if (null != response) {
					result = response;
				}
				
			} finally {
				// This is important to guarantee connection release back into
                // connection pool for future reuse!
                EntityUtils.consume(methodEntity);
				
				IOUtils.closeQuietly(is);
			}
			
		}
		
		return result;
	}
	
	protected static void generateFirefoxHeaders(HttpUriRequest req, String referer) {
		req.addHeader("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:5.0) Gecko/20100101 Firefox/5.0");
		req.addHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
		req.addHeader("Accept-Language", "en-us,en;q=0.5");
		req.addHeader("Accept-Encoding", "gzip, deflate");
		req.addHeader("Accept-Charset", "ISO-8859-1,utf-8;q=0.7,*;q=0.7");
		req.addHeader("Connection", "keep-alive");
		if (null != referer) {
			req.addHeader("Referer", referer);
		}
		req.addHeader("Pragma", "no-cache");
		req.addHeader("Cache-Control", "no-cache");
	}
	
	protected abstract HttpUriRequest getPageRequest(HttpServletRequest clientRequest) throws IOException;
	
	protected abstract Map<String, String[]> parseResponse(List<String> serverResponse);
	
	protected void dispatchResponse(HttpServletResponse resp, Map<String, String[]> results) {
		if (null == results || 0 >= results.size()) {
			dispatchError(resp, "No Results");
		} else {
			resp.setCharacterEncoding("UTF-8");
			resp.setContentType("text/xml");
			
			PrintWriter out = null;
			try {
				out = resp.getWriter();
				
				writeResponse(out, results);
				
				out.flush();
			} catch (IOException e) {
				log.error("Error while writing response.", e);
			} finally {
				IOUtils.closeQuietly(out);
			}
		}
	}
	
	protected void dispatchError(HttpServletResponse resp, String msg) {
		try {
            resp.setCharacterEncoding("UTF-8");
			resp.setContentType("text/xml");
			PrintWriter out = null;
			try {
				out = resp.getWriter();
				
				writeError(out, msg);
				
				out.flush();
			} finally {
				IOUtils.closeQuietly(out);
			}
		} catch (IOException e) {
			log.error("Error while writing error.", e);
		} catch (IllegalStateException e) {
			log.error("Response already committed before writing error.", e);
		}
	}
	
	public static void writeResponse(PrintWriter out, Map<String, String[]> results) {
		if (null != out && !out.checkError()) {
			
			Collection<String[]> valuesCollection = results.values();
			Iterator<String[]> it = valuesCollection.iterator();
			String[] firstCol = it.next();
			
			int numRows = firstCol.length;
			out.append("<?xml version='1.0' encoding='UTF-8'?>");
            out.append("<success>");
			
			for (int i = 0; i < numRows; i++) {
				out.append("<data>");
				
				for (Entry<String, String[]> result : results.entrySet()) {
					String tag = result.getKey();
					String[] values = result.getValue();
					
					if (null != tag && !"".equals(tag) && null != values && 0 < values.length) {
						if (null != values[i] && !"".equals(values[i])) {
							out.append('<');
							out.append(tag);
							out.append('>');
							
							out.append(values[i]);
							
							out.append("</");
							out.append(tag);
							out.append('>');
						}
					}
					
				}
				
				out.append("</data>");
			}
			
			out.append("</success>");
		}
	}
	
	public static void writeError(PrintWriter out, String msg) {
		if (null != out && !out.checkError()) {
			out.append("<?xml version='1.0' encoding='UTF-8'?>");
            out.append("<failure>");
			
			if (null != msg ) {
				out.append("<error>");
				out.append("<reason>");
				out.append(msg);
				out.append("</reason>");
				out.append("</error>");
			}
			
			out.append("</failure>");
		}
	}
}
