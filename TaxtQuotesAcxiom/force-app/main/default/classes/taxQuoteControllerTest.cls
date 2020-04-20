@isTest
public class taxQuoteControllerTest {
    
    public static TestMethod void createTaxQuoteItems()
    {
        Tax_Quote__c tq = new Tax_Quote__c();
        tq.Opportunity_Name__c = 'Test';
        tq.Client_Name__c = 'Test';
        tq.Date__c = System.today();
        tq.Street__c = 'Test ABC';
        tq.State__c = 'AZ';
        tq.City__c = 'ABC';
		tq.Zip_Code__c = 'ABC123';
        tq.Country__c = 'US';
        insert tq;
        
        Tax_Quote_Item__c tqm = new Tax_Quote_Item__c();
        tqm.Sales_Item__c = 'Test';
        tqm.Amount__c = 100;
        tqm.Tax_Quote__c = tq.Id;
        tqm.Tax_Amount__c = 0;
        tqm.Tax_Rate__c = 0;
        insert tqm;
        
        Map<String,string> mymap = new Map<String,string>();
        String amt = String.valueOf(tqm.Amount__c);
        String rate = String.valueOf(tqm.Tax_Rate__c);
        String taxamt = String.valueOf(tqm.Tax_Amount__c);
        mymap.put('Sales_Item__c', tqm.Sales_Item__c);
        mymap.put('Amount__c', amt);
        mymap.put('Tax_Quote__c', tqm.Tax_Quote__c);
        String s = JSON.serialize(mymap);
        String newString = '['+ s + ']';
        System.debug('STTT '+newString);

        taxQuoteController.createTaxQuoteItems(newString);
    }
    
    @isTest
    public static void calculateTax()
    {
        Tax_Quote__c tq = new Tax_Quote__c();
        tq.Opportunity_Name__c = 'Test';
        tq.Client_Name__c = 'Test';
        tq.Date__c = System.today();
        tq.Street__c = 'Test ABC';
        tq.State__c = 'AZ';
        tq.City__c = 'ABC';
		tq.Zip_Code__c = 'ABC123';
        tq.Country__c = 'US';
        insert tq;
        
        Tax_Quote_Item__c tqm = new Tax_Quote_Item__c();
        tqm.Sales_Item__c = 'Test';
        tqm.Amount__c = 100;
        tqm.Tax_Quote__c = tq.Id;
        tqm.Tax_Amount__c = 0;
        tqm.Tax_Rate__c = 0;
        insert tqm;
        
        Map<String,string> mymap = new Map<String,string>();
        String amt = String.valueOf(tqm.Amount__c);
        String rate = String.valueOf(tqm.Tax_Rate__c);
        String taxamt = String.valueOf(tqm.Tax_Amount__c);
        mymap.put('Sales_Item__c', tqm.Sales_Item__c);
        mymap.put('Amount__c', amt);
        mymap.put('Tax_Quote__c', tqm.Tax_Quote__c);
        mymap.put('Id', tqm.Id);
        String s = JSON.serialize(mymap);
        String newString = '['+ s + ']';
        System.debug('STTT '+newString);
		Test.startTest();
        Test.setMock(HttpCalloutMock.class, new Test_HttpResponse.HttpAutomatedJiraIssue());
        taxQuoteController.calculateTax(newString, tq.Id);
        Test.stopTest();
    }
}