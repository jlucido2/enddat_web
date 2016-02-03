package gov.usgs.cida;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;
import org.owasp.esapi.ESAPI;


public final class SanitizeInputsRequestWrapper extends HttpServletRequestWrapper {

	public SanitizeInputsRequestWrapper(HttpServletRequest servletRequest) {
		super(servletRequest);
	}
	
	private static final Log LOG = LogFactory.getLog(SanitizeInputsRequestWrapper.class);

	@Override
	public String[] getParameterValues(String parameter) {
		LOG.debug("VALUES FOR PARAM: " + parameter);
		String[] values = super.getParameterValues(parameter);
		if (values == null) {
			return null;
		}
		int count = values.length;
		String[] encodedValues = new String[count];
		for (int i = 0; i < count; i++) {
			encodedValues[i] = stripXSS(values[i]);
		}
		return encodedValues;
	}

	public String getParameter(String parameter) {
		LOG.debug("PARAM: " + parameter);
		String value = super.getParameter(parameter);
		if (value == null) {
			return null;
		}
		return stripXSS(value);
	}

	public String getHeader(String name) {
		LOG.debug("HEADER: " + name);
		String value = super.getHeader(name);
		if (value == null)
			return null;
		return stripXSS(value);
	}


	/**
	 * Strips any potential XSS threats out of the value
	 * @param value
	 * @return
	 */
	public static String stripXSS( String value )
	{
		LOG.debug("Value before stripping: " + value);
		if( value != null )
		{
			// Use the ESAPI library to avoid encoded attacks.
			value = ESAPI.encoder().canonicalize( value );

			// Avoid null characters
			value = value.replaceAll("\0", "");

			// Clean out HTML
			value = Jsoup.clean( value, Whitelist.none() );
		}
		LOG.debug("Value after stripping: " + value);
		return value;
	}

}