import { LightningElement,wire,track } from 'lwc';
import getArticles from '@salesforce/apex/categoriesClass.getArticles';

export default class ArticleList extends LightningElement {
    @track article;
    @track error;
    @track ArticleList;

    @wire(getArticles)
    ArticlesResult(result){
        if(result.data){

            console.log('result.data',JSON.stringify(result.data));
            this.ArticleList=result.data;
        }
    }




}