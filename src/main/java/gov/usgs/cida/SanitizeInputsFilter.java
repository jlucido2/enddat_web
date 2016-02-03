package gov.usgs.cida;
import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;


/**
 * This filter is  used to sanitize inputs context. 
 * <p>
 * 
 * @author jcotter
 *
 */
public class SanitizeInputsFilter implements Filter  {

	/** LOG for class. */
	@SuppressWarnings("unused")
	private static final Log LOG = LogFactory.getLog(SanitizeInputsFilter.class);
    private FilterConfig filterConfig;

	/**
	 * @param inRequest the request
	 * @param inResponse the response
	 * @param chain the filter chain
	 * @throws ServletException exception
	 * @throws IOException exception
	 */
	@Override
	public void doFilter(final ServletRequest inRequest, final ServletResponse inResponse,
			final FilterChain chain) throws IOException, ServletException {

		HttpServletRequest request = (HttpServletRequest) inRequest;
		chain.doFilter(new SanitizeInputsRequestWrapper(request), inResponse);
	}

	/**
	 * Nothing to implement.
	 * @see javax.servlet.Filter#destroy()
	 */
	@Override
	public void destroy() {
		this.filterConfig = null;
	}


	/**
	 * Initializes the API builder.
	 * @param filterConfig filterConfig
	 * @throws ServletException exception
	 */
	@Override
	public void init(final FilterConfig filterConfig) throws ServletException {
		this.filterConfig = filterConfig;

	}

}