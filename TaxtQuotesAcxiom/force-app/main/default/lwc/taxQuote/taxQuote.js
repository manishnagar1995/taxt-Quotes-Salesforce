/* eslint-disable vars-on-top */
/* eslint-disable @lwc/lwc/no-async-operation */
/* eslint-disable guard-for-in */
/* eslint-disable eqeqeq */
/* eslint-disable no-console */
import { LightningElement, track } from 'lwc';
import createTaxQuoteItems  from '@salesforce/apex/taxQuoteController.createTaxQuoteItems';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import calculateTax from '@salesforce/apex/taxQuoteController.calculateTax';

export default class TaxQuoteLWC extends LightningElement {

    @track salesItems = [];
    @track taxQuote;
    @track showSpinner = true;
    @track taxCalculated = false;
    @track rowDelete = false;
    @track time=0;
    @track showError = false;

    connectedCallback(){
        this.salesItems.push({
            ID : undefined,
            Sales_Item__c : undefined,
            Amount__c : undefined,
            Tax_Quote__c : undefined,
            Tax_Amount__c : undefined,
            Tax_Rate__c : undefined,
            hasError : undefined,
            errorMessage : undefined
        });
        this.showSpinner = false;
        }
    
    addRow(){
        this.time+=1;
        this.rowDelete=true;
        
        this.timeout = setTimeout(function() {
            this.template.querySelectorAll('.crossButton')[0].style.display='none';
        }.bind(this), 1);
        // console.log('Element got is ====>',this.template.querySelectorAll('.crossButton')[0]);
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
        console.log('onsuccess data: ', data);
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
        console.log('$$$datacreateQuoteItem ',JSON.stringify(data));
        createTaxQuoteItems({taxQuoteItems : JSON.stringify(data)})       
        .then(result => {
            console.log('$$$result ',JSON.stringify(result));
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
         console.log('$$$data ',JSON.stringify(data));
         console.log('$$$data.Tax_Quote__c '+JSON.stringify(data[0].Tax_Quote__c));
         console.log('$$$data.Tax_Quote__c '+data[0].Tax_Quote__c);
        calculateTax({quoteItems : JSON.stringify(data),
                    taxQuoteID : data[0].Tax_Quote__c
                    })       
        .then(result => {
            console.log('$$$result from class result '+JSON.stringify(result));
            
            this.showSpinner = false;
            this.taxCalculated = true;
            this.salesItems=[];
            var isError = false;
            var errorMsg = '';
            for(var i=0;i< result.length;i++){
                this.salesItems.push(result[i].taxQuoteItems);
                if(result[i].hasError === true){
                    this.salesItems[i].hasError= 'slds-has-error';
                    isError = true;
                    this.salesItems[i].errorMessage = result[i].Error;
                    this.errorMsg = result[i].Error;
                }
                else{
                    this.salesItems[i].hasError = '';
                    this.salesItems[i].errorMessage = '';
                }
            }
            console.log('$$$result from class salesItems'+JSON.stringify(this.salesItems));

            if(isError){
               this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while trying to update the record',
                        variant: 'error'
                    })
                );    
            }
            else{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record created',
                        variant: 'success'
                    })
                );
            }
            
        })
        
        .catch(error => {
            console.log('$$$result ERROR from class '+error);
            this.showSpinner = false;
            if(error.body.message == 'Read timed out'){
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while trying to update the record',
                        message: 'Looks like the server is taking too long to respond, please try again in sometime',
                        variant: 'error'
                    })
                );
            }
            else{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while trying to update the record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            }
        });
     }

     populateData(event){
        let value = event.detail.value;
        let field = event.currentTarget.dataset.field;
        let index = event.currentTarget.dataset.index;
        console.log('this.111index--', index);
        console.log('this.111index--', JSON.stringify(index));
        if(field == 'Sales_Item__c'){
            this.salesItems[index].Sales_Item__c = value;

            if(this.salesItems[index].Sales_Item__c == undefined || this.salesItems[index].Sales_Item__c == ''){
                this.salesItems[index].hasError = '';
            }

            console.log('this.22index--', JSON.stringify(index));
            console.log('this.22index--', index);
        }
        
        
        else if(field == 'Amount__c'){
            this.salesItems[index].Amount__c = value;
        }
        /*
        else if(field == 'Tax_Rate__c'){
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
        }  */
        
        

        console.log('this.salesItems--', this.salesItems);
     } 
     

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
     
     deleteRow(event){
        let index = event.currentTarget.dataset.index;
        console.log('this.333index--', index);
        this.salesItems.splice(index,1);
     }
}