import { LightningElement , track , api, wire} from 'lwc';
import fetchAllFields from '@salesforce/apex/FieldSelectorController.fetchAllFields';


export default class FieldSelector extends LightningElement {

    //objectApiName = '';
    @api objectApiName;
    @track data; 
    @track error;
    draftValues=[];
    selectedData = {};

    columns = [
        
        {label : 'FieldName' , fieldName : 'fieldName' , type: 'text'},
        {label : 'Type' , fieldName: 'fieldType' , type : 'text'},
        {label : 'Overwrite by default' , fieldName : 'overWriteByDefault', type : 'customCheckbox' ,initialWidth : 200 ,
            typeAttributes: {
                rowIndex: {fieldName: 'rowIndex'},
                checkBoxVal: {fieldName: 'checkBoxVal'}
            } 
        },
        {
            label : 'Default value' , type : 'defaultValue' , editable: true, fieldName : 'defaultValue' ,
            typeAttributes: {
                fieldtype: {fieldName: 'apexDataType'},
                disabled: {fieldName: 'disabled'},
                value: {fieldName: 'defaultValue'},
            }
        }
    ];

    connectedCallback(){
        console.log('objectApiName=> ', this.objectApiName);
    
         fetchAllFields({objectApiName : this.objectApiName.name})
                .then(result => {
                    let tempData = JSON.parse(JSON.stringify(result));
                     tempData.forEach((row) => {
                        row.rowIndex = row.fieldId;
                        row.checkBoxVal = false;
                        row.disabled = true;
                        row.defaultValue = '';
                        switch(row.fieldType){
                            case "BOOLEAN":{
                                row.apexDataType = "CHECKBOX";
                                break;
                            }
                            case "STRING": {
                                row.apexDataType = "TEXT";
                                break;
                            }
                            case "PHONE":{
                                row.apexDataType = "TEL";
                                break;
                            }
                            case "DOUBLE":{
                                row.apexDataType = "NUMERIC";
                                break;
                            } default: {
                                row.apexDataType = row.fieldType;
                            }
                        }
                        
                    });
                    this.selectedData = JSON.parse(JSON.stringify(tempData));
                    let fieldsList = {};
                    fieldsList = tempData.filter(fields =>{
                        return (fields.fieldType != 'REFERENCE' && fields.fieldType != 'ID')
                    });
                    this.data = JSON.parse(JSON.stringify(fieldsList));
                    
                    
                })
                .catch(error => {
                    console.log('error is:',error);
                    this.error = error;
                });
            }

    
    handleCustomCheckboxChange(event){
        let customCheckBox = event.detail;
        for (let val of this.data) {
            if(customCheckBox.rowId == val.fieldId){
                val.disabled = !customCheckBox.checkBoxVal;

            }
            
            if(!val.disabled){
                const textVal = new CustomEvent("cellchange" , {detail : val.apexDataType});
                this.dispatchEvent(textVal);
            }
        }
    }

    handleChange(event) {
        
        this.draftValues = event.detail.draftValues;
        for(let value of this.data){
            
            if(value.fieldId==this.draftValues[0].fieldId){
                value.defaultValue = this.draftValues[0].defaultValue;
            }
            
        }
        
    }
    
    handleOnClick(event){
        let checkboxValue = this.template.querySelector('my-custom-type-lightning-datatable').checked;
    }

    handleRowSelection(event){
        
        let selectedRows = event.detail.selectedRows;
       /* for (let row of selectedRows) {
            console.log('row.fieldId:=>',row.fieldId);
            console.log('row overwriteByDefault value:=>',row.overWriteByDefault);
            console.log('row disabled value:=>',row.disabled);
            
        }*/
        this.selectedRows.overWriteByDefault = true;
        this.disabled = false;
       
       /* for(let i = 0; i<selectedRows.length;i++){
            console.log('selected rows in loop:=>',selectedRows[i]);
            console.log('selectedRow default value is:=>',selectedRows[i].defaultValue );
        }*/
    }
   
    handleSave(event){
        const updatedRecord = new CustomEvent("save" , {detail : this.selectedData});
        this.dispatchEvent(updatedRecord);
    }
    

}