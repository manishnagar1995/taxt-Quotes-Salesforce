import { LightningElement, track } from 'lwc';
import createTaxQuoteItems  from '@salesforce/apex/taxQuoteLWCController.createTaxQuoteItems';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import calculateTax from '@salesforce/apex/taxQuoteLWCController.calculateTax';

export default class TaxQuoteLWC extends LightningElement {

    @track salesItems = [];
    @track taxQuote;
    @track showSpinner = true;
    @track taxCalculated = false;

    connectedCallback(){
        this.salesItems.push({
            Sales_Item__c : undefined,
            Amount__c : undefined,
            Tax_Quote__c : undefined,
            Tax_Amount__c : undefined,
            Tax_Rate__c : undefined
        });
        this.showSpinner = false;
    }

    addRow(){
        this.connectedCallback();
    }

    handleSubmit(event){
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);

        if (allValid) {
            this.showSpinner = true;
            event.preventDefault();  // stop the form from submitting
            const fields = event.detail.fields;
            this.template.querySelector('lightning-record-edit-form').submit(fields);
        }
        
     }

     handleSuccess(event){
        const updatedRecord = event.detail.id;
        let data = this.salesItems;
        for(let i in data){
            data[i].Tax_Quote__c = updatedRecord;
            data[i].Id =  undefined;
        }
        console.log('onsuccess: ', updatedRecord);
        this.createQuoteItem(data);
     }

     handleError(){
         this.showSpinner = false;
     }

     createQuoteItem(data){
        createTaxQuoteItems({taxQuoteItems : JSON.stringify(data)})       
        .then(result => {
            this.calculateTaxData(result);
            
        })
        .catch(error => {
            this.showSpinner = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while trying to update the record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
     }

     calculateTaxData(data){
         
        calculateTax({quoteItems : JSON.stringify(data)})       
        .then(result => {
            this.showSpinner = false;
            this.taxCalculated = true;
            this.salesItems = result;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Record created',
                    variant: 'success'
                })
            );
            
        })
        .catch(error => {
            this.showSpinner = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while trying to update the record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
     }

     /*populateData(event){
        let value = event.detail.value;
        let field = event.currentTarget.dataset.field;
        let index = event.currentTarget.dataset.index;
        if(field == 'Sales_Item__c'){
            this.salesItems[index].Sales_Item__c = value;
        }else if(field == 'Amount__c'){
            this.salesItems[index].Amount__c = value;
        }else if(field == 'Tax_Rate__c'){
            this.salesItems[index].Tax_Rate__c = value;
            if(this.salesItems[index].Tax_Rate__c === 0){
                this.salesItems[index].Tax_Amount__c  = 0;
            }else{
                this.salesItems[index].Tax_Amount__c = (this.salesItems[index].Tax_Rate__c *this.salesItems[index].Amount__c) / 100;
            }
        }else if(field == 'Tax_Amount__c'){
            this.salesItems[index].Tax_Amount__c = value;
            if(this.salesItems[index].Tax_Amount__c === 0){
                this.salesItems[index].Tax_Rate__c  = 0;
            }else{
                this.salesItems[index].Tax_Rate__c = (this.salesItems[index].Tax_Amount__c /this.salesItems[index].Amount__c) * 100;
            }
        }
        
        

        console.log('this.salesItems--', this.salesItems);
     }
     */

     handleReset(){
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }

         let salesItems = this.salesItems;
         for(let i in salesItems){
             
            salesItems[i].Sales_Item__c = undefined;
            salesItems[i].Amount__c = undefined;
            salesItems[i].Tax_Quote__c = undefined;
            salesItems[i].Tax_Amount__c = undefined;
            salesItems[i].Tax_Rate__c = undefined;
         }
         this.salesItems = salesItems;
         this.taxCalculated = false;
     }
     

     deleteRow(){

     }
}