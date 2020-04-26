import { LightningElement,track,api, wire } from 'lwc';
import getDataCategories from '@salesforce/apex/categoriesClass.getDataCategories';
import getRecordTypeName from '@salesforce/apex/categoriesClass.getRecordType';



export default class KnowlegdePage extends LightningElement {

    @track multiple = true;
    @track statusList;
    @track RtNameList;
    @track xyz= 'All';
    @track sign = '[+]';
    @track articletype= 'Article Type';
    

    
    

    @wire(getDataCategories)wiredResult(result) { 
    
        if (result.data) {
            // eslint-disable-next-line no-console
            console.log(result.data);
        this.statusList=result.data;
        console.log('this.statusList',JSON.stringify(this.statusList));
        }
    
    }
    @wire(getRecordTypeName)RTnameResult(result){ 
        if (result.data) {
        
            console.log(result.data);
        this.RtNameList=result.data;
        }
    }

    
   
    
    handleclicktag1(event)
    {
        var re = event.currentTarget.dataset.index;
        var element;
        var y=this.template.querySelectorAll('.help');
        console.log('yyyy====',y);
       
        console.log('res====',re);
        element = this.template.querySelector(`[data-id="${re}"]`);
        element.classList.remove('slds-hidden');
        element.classList.add('slds-visible');
        console.log('element',element);
        

    }
    handleChange()
    {
       
            let i;
            let checkboxes = this.template.querySelectorAll('[data-id="checkbox"]')
            for(i=0; i<checkboxes.length; i++) {
                checkboxes[i].checked = event.target.checked;
            }
        
    }
    

 
}