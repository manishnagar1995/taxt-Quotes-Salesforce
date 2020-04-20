@isTest
global class Test_HttpResponse  {
    
    global class HttpAutomatedJiraIssue implements HttpCalloutMock {  
        global HTTPResponse respond(HTTPRequest req) {
            system.debug(req);
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('[{"SubTotal":"324312.0","TotalTax":"18161.47","Total":"342473.47","LineItems":[{"LineItem":{"LineItemNumber":"1","TotalTax":"18161.47","TaxApplicabilityCode":"INVALID","Status":"ERROR: Invalid Sales Item ID"}}]}]');
            res.setStatusCode(200);
          
            return res;
        }
    }
}