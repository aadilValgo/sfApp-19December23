import { LightningElement, wire, track, api } from "lwc";
import fetchAllFields from "@salesforce/apex/FieldSelectorController.fetchAllFields";

const COLS = [
  {
    label: "Source Field",
    fieldName: "sourceField",
    type: "text",
    sortable: true,
    initialWidth: 150
  },
  {
    label: "Source Field and Data Type",
    fieldName: "combineFieldType",
    type: "text",
    sortable: true
  },
  {
    label: "Data Type",
    fieldName: "sourceDataType",
    type: "text",
    initialWidth: 150
  },
  {
    label: "Show Compatible Fields",
    fieldName: "compatibleCheckBox",
    type: "customCheckbox",
    initialWidth: 200,
    typeAttributes: {
      rowIndex: { fieldName: "rowIndex" },
      checkBoxVal: { fieldName: "checkBoxVal" }
    }
  },
  {
    label: "Target field",
    type: "fieldSelector",
    fieldName: "fieldSelector",
    editable: true,
    sortable: true,
    initialWidth: 250,
    typeAttributes: {
      fieldtype: { fieldName: "fieldtype" },
      objectapiname: { fieldName: "objectapiname" },
      compatible: { fieldName: "compatible" },
      rowId: { fieldName: "rowId" },
      selectedField: { fieldName: "selectedField" },
      options: { fieldName: "nameOptions" }
    }
  },
  {
    label: "Data Type",
    fieldName: "targetDataType",
    type: "text",
    initialWidth: 150
  }
];

export default class FieldMapping extends LightningElement {
  @api csvHeaders;
  @api selectedDmlAction; // ** no need to use this we'll only show the field selector cmp when user selects a dml action
  @api fieldsdata; // ** why is this being used ?? can't we call the wire method here only ?
  @api objectName; // to store Source Object Api Name
  @api preSelectedValue; // ** it is being used for what ??
  @track data = []; // to store data of data table
  showCompatibleColumn = false; // to show and hide compatible column
  hideSourceDataType = false; // to show and hide Source data type
  showCombinedFields = false; // to show and hide Combined Field Columns
  columnName = ""; // to store column to show or hide that column
  sortedBy;
  defaultSortDirection = "asc"; // ** remove variables which are not being used
  sortDirection = "asc";
  labels = {
    save: "Save",
    cancel: "Cancel"
  };
  columns = COLS.filter((col) => {
    return col.fieldName != "compatibleCheckBox";
  }).filter((col) => {
    return col.fieldName != "combineFieldType";
  });

  get showSaveButton() {
    return this.selectedDmlAction != undefined ? false : true;
  }

  connectedCallback() {
    console.log("connected : ", JSON.stringify(this.fieldsdata)); // ** if not being used for any prupose remove connected call back
  }

  // this method will fetch Source field Data through apex method
  @wire(fetchAllFields, { objectApiName: "$objectName" })
  wiredFetchSourceField({ data, error }) {
    // ** update method names also as it was done a long time ago
    if (data) {
      let index = 0;
      let temp = JSON.parse(JSON.stringify(data));
      let objectList = [];

      /* let objArr = [];
            let objTemp = {};
            for(let obj of temp){
                objTemp.label = obj.fieldLabel;
                objTemp.value = obj.fieldName;
                objArr.push(objTemp);
            }*/
      for (let obj of temp) {
        console.log(
          "header in field map ==> : ",
          JSON.stringify(this.csvHeaders)
        );
        if (this.csvHeaders && index < this.csvHeaders.length) {
          let objItem = {};
          objItem.nameOptions = temp;
          objItem.rowIndex = obj.fieldId;
          objItem.checkBoxVal = false;
          objItem.fieldId = obj.fieldId;
          objItem.combineFieldType = obj.fieldLabel + " - " + obj.fieldType;
          objItem.sourceDataType = obj.fieldType;
          objItem.sourceField = this.csvHeaders[index];
          if (this.fieldsdata != undefined) {
            if (this.fieldsdata.hasOwnProperty(objItem.sourceField)) {
              objItem.selectedField = this.fieldsdata[objItem.sourceField];
              console.log("in if ==>", objItem.selectedField);
            } else {
              console.log("in else : ==>");
              objItem.selectedField = "";
            }
          } else {
            console.log("in else else : ==>");
            objItem.selectedField = "";
          }
          //objItem.selectedField = '';
          objItem.fieldtype = obj.fieldType;
          objItem.fieldSelector = true;
          objItem.objectapiname = "Account";
          objItem.compatible = false;
          objItem.rowId = obj.fieldId;
          objItem.targetDataType = "";

          objectList.push(objItem);
          index++;
        }
      }
      this.data = JSON.parse(JSON.stringify(objectList));
    } else {
      console.log(
        "error occured in wired method fetch source field...... ",
        error
      );
    }
  }

  // this method is to handle target field selection
  handleTargetFieldSelection(event) {
    console.log("handleFieldSelection handle function called");
    let selectedField = event.detail.selectedField;
    if (selectedField != undefined) {
      console.log("this.selectedField -> ", JSON.stringify(selectedField));

      this.data[selectedField.rowId - 1].targetDataType =
        selectedField.targetFieldType;
      this.data[selectedField.rowId - 1].selectedField = selectedField.name;
    } else {
      this.data[selectedField.rowId - 1].targetDataType = "";
    }
    this.data = [...this.data];
  }

  handleSaveRecords() {
    let fieldMap = this.handleMapCreate();
    console.log("field map==>", fieldMap);

    let customEvent = new CustomEvent("createmappinghandler", {
      detail: {
        mapValue: fieldMap
      }
    });
    this.dispatchEvent(customEvent);
  }

  //this method is to create mapping of source field or target field
  handleMapCreate(event) {
    let tempMap = new Map();
    for (var i = 0; i < this.data.length; i++) {
      tempMap.set(this.csvHeaders[i], this.data[i].selectedField);
    }
    return tempMap;
  }
  handleFieldChange(event) {
    console.log("handler field change ==>", event.detail.selectedField);
    this.data[event.detail.rowId - 1].selectedField =
      event.detail.selectedField;
    console.log("data==> ", this.data[event.detail.rowId - 1].selectedField);
  }

  handleOnCancel() {
    console.log("in handle cancel : ", this.data.length);
    for (let i = 0; i < this.data.length; i++) {
      this.data[i].selectedField = "";
      console.log("loop===>", i, "+ ", this.data[i].selectedField);
    }
    /*let customEvent = new CustomEvent('handlecancel', {
             composed: true,
            bubbles: true,
            cancelable: true
        });
        this.dispatchEvent(customEvent);*/
  }

  //this method is to handle custom check box change of compatibleCheckBox column in data table
  handleCustomCheckboxChange(event) {
    let customCheckBox = event.detail;
    this.data[customCheckBox.rowId - 1].compatible =
      customCheckBox.checkBoxVal === true;
  }

  // this event handler method is used to handle events of Checkboxes and handle the show and hide the visibilities of column on the basis of checkbox name
  handleCheckboxChange(event) {
    console.log(
      "inside checkbox handler to show or hide given column........."
    );
    let eventName = event.target.name;
    if (eventName == "compatibleCheckBox") this.showEditCompatibleField();
    else if (eventName == "sourceDataType") this.showEditSourceDataTypeField();
    else if (eventName == "combinedFieldType")
      this.showEditCombinedFieldDataType();
  }

  // to hide and show compatible column without distrupting other columns
  showEditCompatibleField() {
    this.showCompatibleColumn = !this.showCompatibleColumn;

    let checkedVal = this.template.querySelector(
      'lightning-input[data-name="combineFieldType"]'
    ).checked;
    console.log("checked Value --> ", checkedVal);

    if (this.showCompatibleColumn) {
      if (this.showCombinedFields) {
        this.columns = COLS.filter((col) => {
          return col.fieldName != "sourceField";
        }).filter((col) => {
          return col.fieldName != "sourceDataType";
        });
      } else {
        this.columns = COLS.filter((col) => {
          return col.fieldName != "combineFieldType";
        });
      }
    } else {
      if (this.showCombinedFields) {
        this.columns = COLS.filter((col) => {
          return col.fieldName != "sourceField";
        })
          .filter((col) => {
            return col.fieldName != "sourceDataType";
          })
          .filter((col) => {
            return col.fieldName != "compatibleCheckBox";
          });
      } else if (!this.showCombinedFields) {
        this.columns = COLS.filter((col) => {
          return col.fieldName != "combineFieldType";
        }).filter((col) => {
          return col.fieldName != "compatibleCheckBox";
        });
      }
    }
  }

  // to hide and show source data type field without distrupting other fields
  showEditSourceDataTypeField() {
    this.hideSourceDataType = !this.hideSourceDataType;

    if (this.hideSourceDataType) {
      if (!this.showCompatibleColumn) {
        this.columns = COLS.filter((col) => {
          return col.fieldName != "sourceDataType";
        })
          .filter((col) => {
            return col.fieldName != "compatibleCheckBox";
          })
          .filter((col) => {
            return col.fieldName != "combineFieldType";
          });
      } else {
        this.columns = COLS.filter((col) => {
          return col.fieldName != "sourceDataType";
        }).filter((col) => {
          return col.fieldName != "combineFieldType";
        });
      } // ** remove  white spaces and extra line gap between code

      if (this.showCombinedFields) {
        this.template.querySelector(
          'lightning-input[data-name="combineFieldType"]'
        ).checked = false;
        this.showCombinedFields = false;
      }
    } else {
      if (!this.showCompatibleColumn) {
        this.columns = COLS.filter((col) => {
          return col.fieldName != "compatibleCheckBox";
        }).filter((col) => {
          return col.fieldName != "combineFieldType";
        });
      } else {
        this.columns = COLS.filter((col) => {
          return col.fieldName != "combineFieldType";
        });
      }

      /*if( this.showCombinedFields ){  // ** remove commented code also  
                
                this.template.querySelector('lightning-input[data-name="combineFieldType"]').checked = false;
                this.showCombinedFields = false;
            }*/
    }
  }

  // to hide and show combined field data type  column without disrupting other columns in data table
  showEditCombinedFieldDataType() {
    this.showCombinedFields = !this.showCombinedFields;

    if (this.showCombinedFields) {
      if (!this.showCompatibleColumn) {
        this.columns = COLS.filter((col) => {
          return col.fieldName != "sourceDataType";
        })
          .filter((col) => {
            return col.fieldName != "compatibleCheckBox";
          })
          .filter((col) => {
            return col.fieldName != "sourceField";
          });
      } else {
        this.columns = COLS.filter((col) => {
          return col.fieldName != "sourceDataType";
        }).filter((col) => {
          return col.fieldName != "sourceField";
        });
      }

      if (this.hideSourceDataType) {
        this.template.querySelector(
          'lightning-input[data-name="sourceDataType"]'
        ).checked = false;
        this.hideSourceDataType = false;
      }
    } else {
      if (!this.showCompatibleColumn) {
        this.columns = COLS.filter((col) => {
          return col.fieldName != "compatibleCheckBox";
        }).filter((col) => {
          return col.fieldName != "combineFieldType";
        });
      } else {
        this.columns = COLS.filter((col) => {
          return col.fieldName != "combineFieldType";
        });
      }

      /*if( this.hideSourceDataType ){

                this.template.querySelector('lightning-input[data-name="sourceDataType"]').checked = true;
                this.hideSourceDataType = true;
            
            }*/
    }
  }

  // used to sort the data on the basis of field name and sort direction
  sortBy(field, reverse, primer) {
    const key = primer
      ? function (x) {
          return primer(x[field]);
        }
      : function (x) {
          return x[field];
        };

    return function (a, b) {
      a = key(a);
      b = key(b);
      return reverse * ((a > b) - (b > a));
    };
  }

  // this method will be handling the event of onsort
  onHandleSort(event) {
    const { fieldName: sortedBy, sortDirection } = event.detail;
    const cloneData = [...this.data];

    cloneData.sort(this.sortBy(sortedBy, sortDirection === "asc" ? 1 : -1));
    let rowId = 1;

    for (const obj of cloneData) {
      obj.rowId = rowId;
      obj.rowIndex = rowId;
      console.log("obj -> ", JSON.stringify(obj));
      rowId++;
    }

    this.data = cloneData;
    this.data = [...this.data];
    this.sortDirection = sortDirection;
    this.sortedBy = sortedBy;
  }
}