/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.dates;

import gov.usgs.webservices.jdbc.spec.Spec;
import gov.usgs.webservices.jdbc.spec.mapping.ColumnMapping;
import gov.usgs.webservices.jdbc.spec.mapping.SearchMapping;

/**
 *
 * @author dmsibley
 */
public class DateSpanSpec extends Spec {
	private static final long serialVersionUID = -4206298381566690832L;

	@Override
	public boolean setupAccess_DELETE() {
		return false;
	}

	@Override
	public boolean setupAccess_INSERT() {
		return false;
	}

	@Override
	public boolean setupAccess_READ() {
		return true;
	}

	@Override
	public boolean setupAccess_UPDATE() {
		return false;
	}

	@Override
	public ColumnMapping[] setupColumnMap() {
		throw new UnsupportedOperationException("Not supported yet.");
	}

	@Override
	public String setupDocTag() {
		return "dates";
	}

	@Override
	public String setupRowTag() {
		return "date";
	}

	@Override
	public SearchMapping[] setupSearchMap() {
		throw new UnsupportedOperationException("Not supported yet.");
	}

	@Override
	public String setupTableName() {
		return "DATES";
	}
	
}
