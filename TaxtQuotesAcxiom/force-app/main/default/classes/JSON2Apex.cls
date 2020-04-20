public class JSON2Apex {

	public class LineItems {
		public LineItem LineItem;
	}


	public String TotalTax;
	public String Total;
	public List<LineItems> LineItems;

	public class LineItem {
		public String LineItemNumber;
		public String TotalTax;
		public String TaxApplicabilityCode;
		public String Status; 
	}

	
	public static List<JSON2Apex> parse(String json) {
		return (List<JSON2Apex>) System.JSON.deserialize(json, List<JSON2Apex>.class);
	}
}