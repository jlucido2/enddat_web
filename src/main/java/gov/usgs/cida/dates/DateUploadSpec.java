package gov.usgs.cida.dates;

import gov.usgs.testing.statemock.MockResultSet;
import gov.usgs.webservices.jdbc.spec.Spec;
import gov.usgs.webservices.jdbc.spec.mapping.ColumnMapping;
import gov.usgs.webservices.jdbc.spec.mapping.SearchMapping;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 *
 * @author dmsibley
 */
public class DateUploadSpec extends Spec {
	private static final long serialVersionUID = -1101939578291823613L;

	@Override
	public boolean setupAccess_DELETE() {
		return false;
	}

	@Override
	public boolean setupAccess_INSERT() {
		return true;
	}

	@Override
	public boolean setupAccess_READ() {
		return false;
	}

	@Override
	public boolean setupAccess_UPDATE() {
		return false;
	}

	@Override
	public ColumnMapping[] setupColumnMap() {
		return new ColumnMapping[] {
			new ColumnMapping("REQUEST_ID", "fileId"),
			new ColumnMapping("REQUEST_DATE", "filterDate")
		};
	}

	@Override
	public String setupDocTag() {
		return "success";
	}

	@Override
	public String setupRowTag() {
		return "file";
	}

	@Override
	public SearchMapping[] setupSearchMap() {
		return new SearchMapping[] {
			new SearchMapping("requestId", "REQUEST_ID", "requestId", null, null, null, null),
			new SearchMapping(null, "REQUEST_DATE", "reqDate", null, null, "TO_TIMESTAMP_TZ(" + USER_VALUE_KEY + ",'MM/DD/RRRR HH24:MI:SSTZH:TZM')", null)
		};
	}

	@Override
	public String setupTableName() {
		return "DATES";
	}

	@Override
	public ResultSet getInsertedRows(Connection con) throws SQLException {
		String uuid = this.userWhere.get("requestId").getValue();
		
		MockResultSet rs = new MockResultSet();
		
		rs.setColumnNames("REQUEST_ID", "REQUEST_DATE");
		rs.addRow(uuid, null);
		
		return rs;
	}
	
	
	
}
