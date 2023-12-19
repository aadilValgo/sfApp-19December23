import { LightningElement, api } from 'lwc';
export default class CustomFieldSelector extends LightningElement {
 //   @api selectedField;   
    //@api preSelectedValue;          // to store selected target field record
    @api options;
    @api selectedField;
    @api rowId = '';                // to store row index number/ row Id
    @api sourceFieldType = '';      // to store the data type of  the field
    @api objectApiName = '';        // to store the object name to fetch fields
    @api compatible = '';  
    
    get hasDefaultValue() {
        return this.selectedField != '' ? true : false;
    }

    connectedCallback() {
        console.log('rowId=> : ',this.rowId);
        console.log('sourceFieldType=> : ',this.sourceFieldType);
        console.log('objectApiName=> : ',this.objectApiName);
        console.log('compatible=> : ',this.compatible);
        console.log('selectedField==>',this.selectedField);
    }


    handleOnChange(event){
        console.log('on change : ', event.target.value);
        console.log('rowId==> : ',this.rowId);
        this.selectedField = event.target.value;
        const custEvt = new CustomEvent("fieldchanged", {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                selectedField : this.selectedField,
                rowId : this.rowId
            }
        });
        this.dispatchEvent(custEvt);
        console.log('event : ',custEvt);
    }
}