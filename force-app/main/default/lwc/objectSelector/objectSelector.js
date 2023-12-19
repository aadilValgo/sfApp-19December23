import { LightningElement, track, wire, api } from 'lwc';
// import apex method from salesforce module 
import fetchAllObjects from '@salesforce/apex/SearchBarController.fetchAllObjects';

export default class ObjectSelector extends LightningElement {

    selectedObject = {};
    sObjectList = [];

    // wire function property to fetch all objects list
    @wire (fetchAllObjects)
    wiredObjectList({data, error}){
        if(data){
            this.sObjectList = data;
        }
        if(error){
            console.log('Error -> ', error);
        }   
    }

    handleObjectChange(event){
        let objectName = event.detail.value;
        let customEvent = new CustomEvent('objectselection', {detail : {selectedObject : objectName}});
        this.dispatchEvent(customEvent);
    }

    selectedObjectHanlder(event){
        this.selectedObject = event.detail.selectedRecord;
        console.log('Selected Object received on Parent Object -> ', JSON.stringify(this.selectedObject));
        this.handleObjectSelection();
    }
    
    handleObjectSelection(){
        if(this.selectedObject === undefined){ 
            this.selectedObject = {name : null, label : null};
        }
            
        let customEvent = new CustomEvent('objectselection', {detail : {selectedObject : this.selectedObject}});
        console.log('this.selectedObject -> ', this.selectedObject);
        this.dispatchEvent(customEvent);
    }
}