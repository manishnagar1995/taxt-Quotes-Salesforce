public with sharing class taxQuoteController {
    
        private static API_Setting__mdt getCredentials(String IntegrationName){
        String org='Sandbox';
        //check if is sandbox
        Boolean isSandBox = [SELECT IsSandbox FROM Organization LIMIT 1].IsSandbox;
        
        If(!isSandbox){
            org = 'PROD';
        }
        else{
            // assuming all sandboxes will use same testing endpoint
            org = 'Sandbox';
        }
        
        //get endpoint and credentials
        return [select id,Environment__c, Endpoint__c, Username__c,Password__c from API_Setting__mdt WHERE Integration__c = :IntegrationName and Environment__c =: org limit 1];
    }
    
    @AuraEnabled
    public static List<Tax_Quote_Item__c> createTaxQuoteItems(String taxQuoteItems){
        List<Tax_Quote_Item__c> quoteItems = (List<Tax_Quote_Item__c>)System.JSON.deserialize(taxQuoteItems, List<Tax_Quote_Item__c>.class);
        if(quoteItems != null && !quoteItems.isEmpty()){
            insert quoteItems;
        }
        return quoteItems;
    }
    
    @AuraEnabled
    public static List<WrapperClass> calculateTax(String quoteItems, String taxQuoteID){
        Integer lineItemNumber = 1;

        Tax_Quote__c tquote = [SELECT ID, Street__c, City__c, State__c, Zip_Code__c, Country__c FROM Tax_Quote__c WHERE Id = :taxQuoteID LIMIT 1];
        List<Tax_Quote_Item__c> taxQuoteItems = (List<Tax_Quote_Item__c>)System.JSON.deserialize(quoteItems, List<Tax_Quote_Item__c>.class);
 
		// JSON generator class
		JSONGenerator gen = JSON.createGenerator(true);
     
        // Write data to the JSON string.
        gen.writeStartObject();
        gen.writeStringField('TaxDate', '2020-02-27');
        gen.writeStringField('Division', 'C0001');
        gen.writeFieldName('SalesItems');
        gen.writeStartArray();
        
        for(Tax_Quote_Item__c tqi : taxQuoteItems){
            gen.writeStartObject();
            gen.writeFieldName('SalesItem');

            gen.writeStartObject();
            gen.writeObjectField('LineItemNumber', lineItemNumber);
            gen.writeObjectField('SalesItemId', tqi.Sales_Item__c);
            gen.writeObjectField('Quantity', 1);
            gen.writeObjectField('ExtendedPrice', tqi.Amount__c);
            
            gen.writeFieldName('Address');
            gen.writeStartObject();
            gen.writeObjectField('StreetAddress1', tquote.Street__c);
            gen.writeObjectField('City', tquote.City__c);
            gen.writeObjectField('MainDivision', tquote.State__c);
            gen.writeObjectField('PostalCode', tquote.Zip_Code__c);
            gen.writeObjectField('Country', 'USA');
            gen.writeEndObject();
            gen.writeEndObject();
            gen.writeEndObject();

            LineItemNumber++;
        }
        gen.writeEndArray();
        gen.writeEndObject();

        // Get the JSON string.
        String payload =gen.getAsString();
        
        API_Setting__mdt mdt = [SELECT Endpoint__c, Username__c, Password__c, Label FROM API_Setting__mdt WHERE Label = 'SnapLogic Tax Quote- Sandbox' LIMIT 1];
        String endPointURL = mdt.Endpoint__c;
        String userName = mdt.Username__c;
        String password = mdt.Password__c;
        
        // Specify the required user name and password to access the endpoint 
        // As well as the header and header information 
        Blob headerValue = Blob.valueOf(userName + ':' + password);
        String authorizationHeader = 'BASIC ' +EncodingUtil.base64Encode(headerValue);
        Httprequest request = new HttpRequest();
        Http http = new Http();
        request.setBody(payload);          
        request.setMethod('POST');
        request.setEndpoint(endPointURL);
        request.setHeader('Content-Type', 'application/json');
        // Header info with remote server user name and password
        request.setHeader('Authorization', authorizationHeader);
        // timeout in milliseconds       
        request.setTimeout(120000);          
        //Making call to external REST API
        HttpResponse response = http.send(request);  
        String jsonString = response.getBody();
        System.debug('jsonString '+jsonString);
        List<WrapperClass> wrapperList = new List<WrapperClass>();
        List<JSON2Apex> jsItems = JSON2Apex.parse(jsonString);
        List<JSON2Apex.LineItems> lineItems = jsItems[0].LineItems;
        
        Boolean check=false;
        for(integer i = 0; i<taxQuoteItems.size() ; i++){
            WrapperClass wc = new WrapperClass();
            if(lineItems[i].LineItem.TaxApplicabilityCode == 'INVALID'){
                wc.hasError = true;
                wc.Error = lineItems[i].LineItem.Status;
                check = true;
                taxQuoteItems[i].Tax_Amount__c = null;
                taxQuoteItems[i].Tax_Rate__c  = null;
            }
            else{
                wc.hasError = false;
                wc.Error = '';
                taxQuoteItems[i].Tax_Amount__c = Decimal.valueOf(lineItems[i].LineItem.TotalTax);
                if(taxQuoteItems[i].Tax_Amount__c == 0.00){
                    taxQuoteItems[i].Tax_Rate__c  = 0;
                }else{
                    taxQuoteItems[i].Tax_Rate__c = (taxQuoteItems[i].Tax_Amount__c /taxQuoteItems[i].Amount__c) * 100;
                }
            }
                wc.taxQuoteItems=taxQuoteItems[i];
				wrapperList.add(wc);
        } 
        
        if(check){
			Tax_Quote__c tq = new Tax_Quote__c(Id = (id)taxQuoteID);
			delete tq;
        }
        else{
            if(taxQuoteItems != null && !taxQuoteItems.isEmpty())
            update taxQuoteItems;
        }
        return wrapperList;          
    }
    
    public class WrapperClass{
        @AuraEnabled
        public Tax_Quote_Item__c taxQuoteItems {get;set;}
        @AuraEnabled
        public Boolean hasError {get;set;}
        @AuraEnabled
        public String Error {get;set;}
    }
    
}