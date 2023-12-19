import LightningDatatable from 'lightning/datatable';
import { LightningElement , api} from 'lwc';
import customfieldSelectorTemplate from './fieldSelectorDropDown.html';
import customCheckboxTemplate from './customCheckBox.html';
import customTypeTemplate from './customType.html';
import customValueEditTemplate from './customValueEdit.html';
import CustomButtonTemplate from './customButton.html';

export default class MyCustomTypeLightningDatatable extends LightningDatatable {
    @api preSelectedValue;
    static customTypes = {
        fieldSelector : {
            template: customfieldSelectorTemplate,
            standardCellLayout: true,
            typeAttributes: ['fieldtype', 'objectapiname', 'compatible', 'rowId', 'options', 'selectedField'],
        },
        customCheckbox : {
            template: customCheckboxTemplate,
            standardCellLayout: true,
            typeAttributes: ['rowIndex', 'checkBoxVal'],
        },
        defaultValue: {
            template: customTypeTemplate,
            editTemplate: customValueEditTemplate,
            standardCellLayout: true,
            typeAttributes: ['fieldtype', 'disabled', 'value'],
        },
        customButton : {
            template : CustomButtonTemplate,
            standardCellLayout: true,
            typeAttributes : ['iconName', 'variant', 'name', 'disabled']
        }
    }
}