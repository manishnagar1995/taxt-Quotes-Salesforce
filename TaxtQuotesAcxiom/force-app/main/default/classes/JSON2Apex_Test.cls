//
// Generated by JSON2Apex http://json2apex.herokuapp.com/
//

@IsTest
public class JSON2Apex_Test {
	
	static testMethod void testParse() {
		String json = '['+
		'  {\"SubTotal\":\"24000.0\",\"TotalTax\":\"0.0\",\"Total\":\"24000.0\",\"LineItems\":[{\"LineItem\":{\"LineItemNumber\":\"1\",\"TotalTax\":\"0.0\",\"TaxApplicabilityCode\":\"TX_DATASRG\",\"Status\":\"SUCCESS\"}},{\"LineItem\":{\"LineItemNumber\":\"1\",\"TotalTax\":\"0.0\",\"TaxApplicabilityCode\":\"TX_DATASRG\",\"Status\":\"SUCCESS\"}}]}'+
		']';
		List<JSON2Apex> obj = JSON2Apex.parse(json);
		System.assert(obj != null);
	}
}