/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.dates;

import gov.usgs.webservices.jdbc.spec.Spec;
import gov.usgs.webservices.jdbc.spec.mapping.ColumnMapping;
import gov.usgs.webservices.jdbc.spec.mapping.SearchMapping;
import gov.usgs.webservices.jdbc.spec.mapping.WhereClauseType;
import gov.usgs.webservices.jdbc.util.CleaningOption;

/**
 *
 * @author dmsibley
 */
public class DateListSpec extends Spec {
	private static final long serialVersionUID = 6005029964647138675L;

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
		return new ColumnMapping[] {
			new ColumnMapping("DATE_PK", ""),
			new ColumnMapping("REQUEST_ID", ""),
			new ColumnMapping("FILTER_TIME", "filterDate", false, "filterDate", null, null, null, "TO_CHAR(REQUEST_DATE, 'YYYY-MM-DD\"T\"HH24:MI:SSTZH:TZM')", null, null)
		};
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
		return new SearchMapping[] {
			new SearchMapping("id", "REQUEST_ID", null, WhereClauseType.equals, CleaningOption.none, null, null)
		};
	}

	@Override
	public String setupTableName() {
		return "DATES";
	}
	
}
