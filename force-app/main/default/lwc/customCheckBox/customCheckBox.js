import { LightningElement, api } from 'lwc';

export default class CustomCheckBox extends LightningElement {

    @api rowIndex = '';
    @api checkBoxVal;
    
    handleCheckboxChange(event){
        console.log('inside the custom Checkbox handler.....');
        console.log('event.tagret -> ', JSON.stringify(event.target.value));
        this.checkBoxVal = event.target.checked;
        console.log('this.checkBoxVal -> ', this.checkBoxVal);
        const customEvent = new CustomEvent('customcheckboxchange', {detail : {checkBoxVal : this.checkBoxVal, rowId : this.rowIndex},
         bubbles : true, composed : true});
        this.dispatchEvent(customEvent);
        console.log('event dispatched...');
    }
}