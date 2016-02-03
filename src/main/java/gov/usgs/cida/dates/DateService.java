/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.dates;

import gov.usgs.webservices.framework.basic.FormatType;
import gov.usgs.webservices.framework.formatter.CitationFormatter;
import gov.usgs.webservices.framework.formatter.DataFlatteningFormatter;
import gov.usgs.webservices.framework.formatter.IFormatter;
import gov.usgs.webservices.framework.formatter.XMLPassThroughFormatter;
import gov.usgs.webservices.framework.transformer.ElementToAttributeTransformer;
import gov.usgs.webservices.jdbc.cache.CachedResponse;
import gov.usgs.webservices.jdbc.cache.RecordingWriter;
import gov.usgs.webservices.jdbc.routing.ActionType;
import gov.usgs.webservices.jdbc.routing.InvalidServiceException;
import gov.usgs.webservices.jdbc.routing.ReturnType;
import gov.usgs.webservices.jdbc.routing.UriRouter;
import gov.usgs.webservices.jdbc.service.WebService;
import gov.usgs.webservices.jdbc.spec.Spec;
import gov.usgs.webservices.jdbc.spec.SpecResponse;
import gov.usgs.webservices.jdbc.spec.SpecXMLReader;
import gov.usgs.webservices.jdbc.spec.mapping.ColumnMapping;
import gov.usgs.webservices.jdbc.util.ServiceUtils;
import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidParameterException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.fileupload.util.Streams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author dmsibley
 */
public class DateService extends WebService {
	private static final long serialVersionUID = -3150719269257347104L;
	private final static Logger log = LoggerFactory.getLogger(DateService.class);
	
	public DateService() {
		this.specMapping.put("default", DateListSpec.class);
		this.specMapping.put("upload", DateUploadSpec.class);
		this.specMapping.put("span", DateSpanSpec.class);
		this.enableCaching = false;
	}

	@Override
	protected Map<String, String[]> defineParameters(HttpServletRequest req, UriRouter router, Map<String, String[]> params) throws InvalidServiceException {
		Map<String, String[]> result = params;
		
		result.put("orderby", new String[]{"filterDate"});
		
		boolean isMultipart = ServletFileUpload.isMultipartContent(req);
		if (params.containsKey("qqfile") || params.containsKey("file") || isMultipart) { //This is an upload
			try {
				String uploadedFileValue = null;
				if (isMultipart) { // Handle form-based upload (from IE)
					ServletFileUpload upload = new ServletFileUpload();
					FileItemIterator iter = upload.getItemIterator(req);
					while (iter.hasNext()) {
						FileItemStream item = iter.next();
						InputStream stream = item.openStream();
						if (!item.isFormField()) {
							uploadedFileValue = Streams.asString(stream);
						}
					}

				} else { // Handle octet streams (from standards browsers)
					uploadedFileValue = Streams.asString(req.getInputStream());
				}
				if (null != uploadedFileValue) {
					Map<String, String[]> parsedParams = parseDateFile(uploadedFileValue, params.get("tz"));
					result.putAll(parsedParams);
				}
			} catch (Exception e) {
				log.error("Exception caught while uploading file", e);
			}
		}

		return result;
	}
	
	protected Map<String, String[]> parseDateFile(String fileContents, String[] tz) {
		Map<String, String[]> result = new HashMap<String, String[]>();
		
		String[] dates = fileContents.split("\n");
		
		if (null != dates && dates.length > 0) {
			
			if (null != dates[0] && dates[0].split(":").length < 3) {  /////// MAGIC NUMBER!!!!!!
				addSeconds(dates);
			}
			
			if (null != tz && tz.length > 0) {
				addTZInformation(dates, tz[0]);
			}

			result.put("reqDate", dates);

			UUID uid = UUID.randomUUID();

			result.put("requestId", new String[]{uid.toString()});
			
		}
		
		return result;
	}
	
	public static void addSeconds(String[] dates) {
		for (int i = 0; i < dates.length; i++) {
			dates[i] = dates[i] + ":00";
		}
	}
	
	public static void addTZInformation(String[] dates, String tz) {
		String[] tzSplit = tz.split("_");
		int tzHour = Integer.parseInt(tzSplit[0]);
		
		String tzString = String.format("%1$+03d:00", new Object[] {new Integer(tzHour)});
		
		for (int i = 0; i < dates.length; i++) {
			dates[i] = dates[i] + tzString;
		}
	}
	
//	This is what really should be overridden in the jsl
//	public static String defineMimeType(HttpServletRequest req, FormatType outputType) {
//		return outputType.getMimeType();
//	}
	
	public static String defineContentType(HttpServletRequest req, FormatType outputType) {
		String result = outputType.getMimeType();
		
		boolean isMultipart = ServletFileUpload.isMultipartContent(req);
		if (isMultipart) {
			result = "text/html";
		}
		
		return result; 
	}
	
	
	// !!!!!!!!!!BAD OVERRIDE!!!!!!!!!!
	// we don't have a nice fancy way of overriding the content type, so I've
	// got to do this
		@SuppressWarnings("unchecked")
	public void doResultStream(Connection con, HttpServletRequest req,
			HttpServletResponse resp, UriRouter router,
			Map<String, String> cacheKey) throws XMLStreamException,
			SQLException, IOException, InvalidServiceException {

		CachedResponse toCache = (null != cacheKey) ? new CachedResponse()
				: null;

		Map<String, String[]> modMap = new HashMap<String, String[]>();
		modMap.putAll(req.getParameterMap());

		Map<String, String[]> params = defineParameters(req, router, modMap);

		Spec spec = getQuerySpecFromRequestUri(router, params);
		if (params != null)
			Spec.loadParameters(spec, params);

		ReturnType returnType = null;
		try {
			returnType = router.getReturnTypeFromUri();
		} catch (InvalidServiceException e) {
			log.debug("CAUGHT EXCEPTION:" + e.getMessage());
			returnType = this.getSpecialCaseReturnType(router);
		}

		FormatType outputType = returnType.getFormat();
		boolean isJsonP = returnType == ReturnType.jsonp;

		SpecResponse specResponse = new SpecResponse();
		try {
			ActionType actionType = router.getActionTypeFromUri();
			if (ActionType.create != actionType) {
				checkForValidParams(spec);
			}
			
			logSearch(spec, req.getRemoteAddr());
			specResponse = Spec.runSpecAction(spec, actionType, con);
		} catch (InvalidParameterException ipe) {
			//TODO allow implementors to choose whether this is an
			//Empty response, or if it's an error.
			log.debug(ipe.getMessage() + ": " + con.hashCode() + "-sending empty response.");
			specResponse = new SpecResponse(spec, null, 0, null);
		}

		XMLStreamReader reader = ServiceUtils.makeXMLReader(specResponse);
		IFormatter formatter = null;

		String mimeType = defineContentType(req, outputType);
		
		log.trace("mimetype:" + mimeType);
		resp.setContentType(mimeType);
		if (null != toCache) {
			toCache.setContentType(mimeType);
		}

		switch (outputType) {
		case CSV: // fall through
		case EXCEL: // fall through
		case TAB:
			String filename = this.delimitedValueFileName;
			if (null == filename)
				filename = "default";

			resp.setHeader("Content-Disposition", "attachment; filename=\""
					+ filename + "." + outputType.getFileSuffix() + "\"");
			if (null != toCache) {
				toCache.setHeader1("Content-Disposition");
				toCache.setHeader2("attachment;filename=\"" + filename + "."
						+ outputType.getFileSuffix() + "\"");
			}

			// Empty results check.
			if (specResponse.rset.isBeforeFirst()) {
				reader = ServiceUtils.makeXMLReaderWithEmptyHeaderRow(specResponse.rset,
						specResponse.responseSpec, specResponse.fullRowCount);
			} else {
				reader = ((SpecXMLReader) reader).makeEmptyWSSpecStreamReader();
			}

			{ // Configure the formatter
				DataFlatteningFormatter df = new DataFlatteningFormatter(
						outputType);
				ElementToAttributeTransformer transformer = new ElementToAttributeTransformer();

				df.setRowElementName(specResponse.responseSpec.getRowTag());
				// use column map to add content-defined elements
				for (ColumnMapping col : specResponse.responseSpec.getQueryColumns()) {
					ColumnMapping.Attribute[] attributes = col.getAttributes();
					if (attributes != null)
						for (int attributeIndex = 0; attributeIndex < attributes.length; attributeIndex++) {
							ColumnMapping.Attribute attribute = attributes[attributeIndex];
							if (attribute.isContentDefinedElement) {
								df.addContentDefinedElement(col
										.getXmlElement(attribute.depth),
										attribute.name);
							}
						}

					String[] extraXmlToInject = col.getInjectXmlArray();
					if (extraXmlToInject != null)
						for (int extraXmlIndex = 1; extraXmlIndex < extraXmlToInject.length; extraXmlIndex += 3) {
							String xmlElement = col.getXmlElement(0);
							String extraXml = extraXmlToInject[extraXmlIndex];
							transformer.addTargetElement(xmlElement, extraXml);
							df.addContentDefinedElement(xmlElement, extraXml);
						}

				}
				formatter = df;
				reader = transformer.transform(reader);
				toCache = null; // We don't want to cache files.
			}

			break;
		case RIS: // fall through
		case BIBTEX:// fall through
			formatter = new CitationFormatter(outputType);
			if (!reader.hasNext()) {
				log.debug("Writing empty file");

				return;
			}
			// log.debug("comment me out when you actually have this implemented!");
			return;
		case JSON:
			formatter = ServiceUtils.getJSONFormatter(specResponse.responseSpec, isJsonP);
			if (!reader.hasNext()) {
				log.debug("Writing JSON empty result:"
						+ ServiceUtils.getJSONEmptyResult(specResponse.responseSpec, specResponse.fullRowCount,
								isJsonP));
				resp.getWriter().write(
						ServiceUtils.getJSONEmptyResult(specResponse.responseSpec, specResponse.fullRowCount,
								isJsonP));
				return;
			}
			break;
		case XML:
		default:
			formatter = new XMLPassThroughFormatter();
			if (!reader.hasNext()) {
				log.debug("Writing XML based empty result:"
						+ ServiceUtils.getXMLEmptyResult(specResponse.responseSpec, specResponse.fullRowCount));
				if (returnType == ReturnType.rss)
					resp.getWriter()
							.write(ServiceUtils.getRSSEmptyResult(specResponse.responseSpec));
				else
					resp.getWriter().write(
							ServiceUtils.getXMLEmptyResult(specResponse.responseSpec, specResponse.fullRowCount));
				return;
			}
			if (returnType == ReturnType.rss) {
				reader = ServiceUtils.transformXmlToRssReader(this.rssBaselink,
						specResponse.responseSpec, reader);
				toCache = null; // We don't want to cache RSS readers
			}
			break;
		}
		try {
			if (null != toCache && null != cacheKey) {

				// copy the response and send it
				RecordingWriter recordingWriter = new RecordingWriter(resp
						.getWriter());
				recordingWriter.setRecordLimit(50000);
				formatter.dispatch(reader, recordingWriter);
				log.debug(recordingWriter.getNumberOfCharactersWritten() * 2
						/ 1000.0 + " KB response for key: "
						+ cacheKey.toString());
				if (!recordingWriter.isLimitExceeded()) {
					String response = recordingWriter.getRecordedResponse();

					// store the response & supplemental data in the cache.
					log.debug("Storing to cache:" + cacheKey.toString());
					toCache.setResponse(response);
					this.cache.put(cacheKey, toCache);
				}
			} else {
				formatter.dispatch(reader, resp.getWriter());
			}

		} catch (Exception e) {
			log.error("Error encountered: " + e);
			e.printStackTrace();
		}
	}
}
