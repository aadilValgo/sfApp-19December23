import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { createRecord } from "lightning/uiRecordApi";
import MAPPING_OBJECT from "@salesforce/schema/Mapping__c";
import USERID_FIELD from "@salesforce/schema/Mapping__c.UserId__c"; // ** remove field instead put it as USER_ID only
import JSON_FIELD from "@salesforce/schema/Mapping__c.JSON__c"; // ** same
import OBJECT_NAME_FIELD from "@salesforce/schema/Mapping__c.Object_Name__c"; // ** same
import parseCSV from "@salesforce/apex/DataLoaderController.parseCSV"; // ** use more meaningful name please parse csv is it parsing or just returning the csv file
import getMappingJson from "@salesforce/apex/DataLoaderController.getMappingJson";
import insertRecords from "@salesforce/apex/DataLoaderController.insertRecords";
import Id from "@salesforce/user/Id";
const MAX_FILE_SIZE = 1500000; // ** is this being used if not remove it
export default class SfDataLoader extends LightningElement {
  // ** put a lwc loader for when there is a function being performed we can show like selecting object saving field changes etc
  userId = Id;
  preSelectedValue; // ** pre selected value of what ?
  selectedObject;
  selectedFields;
  selectedDmlAction;
  uploadedFile;
  showObjectSelector = false;
  showFieldSelector = false;
  showFileUploader = false;
  showDmlAction = false;
  headers; // ** headers of what ? csv header or field header  ? also put all variable which don't have any values put these next to uploadedFile variable
  objects = [];
  fieldJson;
  csvFileData;
  label = {
    title: "SF Data Loader",
    selectDMLAction: "Select DML Action",
    uploadFile: "Upload CSV file"
  };

  get dmlOptions() {
    return [
      { label: "Insert", value: "insert" },
      { label: "Update", value: "update" }
    ];
  }

  get acceptedFormats() {
    return [".csv"];
  }

  connectedCallback() {} // ** if not being used remove it

  handleSelectedObject(event) {
    this.selectedObject = event.detail.selectedObject;
    getMappingJson({ objectName: this.selectedObject, userId: this.userId })
      .then((result) => {
        this.fieldJson = JSON.parse(result);
        console.log("field JSON==> : ", JSON.stringify(this.fieldJson));
      })
      .catch((error) => {
        console.log("error=>", error); // ** create a common show toast method for error handling just like we did in lucid take refernce from purchaseAgreement lwx
      });
    this.showFileUploader = true; // ** don't put it here put it in line no. 52 in case no fields show we don't need to show the component
    //this.showFieldSelector = this.selectedObject != null;
    // ** if user remove the selected object we need to hide the field selector line no. 59 was doing that only
  }

  handleSave(event) {
    this.selectedFields = event.detail;
  }

  handleUploadFinished(event) {
    this.uploadedFile = event.detail.files[0];
    parseCSV({ documentId: this.uploadedFile.contentVersionId })
      .then((result) => {
        this.parseCSVHeaders(result);
      })
      .catch((error) => {
        console.log("error", error);
      });
    this.showDmlAction = true; // ** put this on line no. 71 for same reason as line no. 58
     // ** same
  }

  parseCSVHeaders(csv) {
    const lines = csv.split(/\r\n|\n/);
    const headers = lines[0].split(",");
    // ** remove unnecessary spaces and extra lines
    this.headers = headers.map((header) => {
      return header.replace(/"/g, "");
    });
    const data = [];
    // iterate through csv file rows and transform them to format supported by the datatable
    lines.forEach((line, i) => {
      if (i === 0) return;

      const obj = {};
      const currentline = line.split(",");

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      data.push(obj);
    });
    this.csvFileData = data;
  }

  createMappingRecord(event) {
    let prossedRecords = JSON.stringify(this.csvFileData);

    let jsonMap = event.detail.mapValue;
    const json = JSON.stringify(Object.fromEntries(jsonMap));

    const fields = {};
    fields[USERID_FIELD.fieldApiName] = this.userId;
    fields[OBJECT_NAME_FIELD.fieldApiName] = this.selectedObject;
    fields[JSON_FIELD.fieldApiName] = json;
    const recordInput = { apiName: MAPPING_OBJECT.objectApiName, fields };
    createRecord(recordInput)
      .then((result) => {
        console.log("result==>", result); // ** show error or successfull toat of these such actions so the user can know that it is saved or not
      })
      .catch((error) => {
        console.log("create record error : ", error); // ** same
      });

    jsonMap.forEach((value, key) => {
      let replaceKey = '"\\"{replace_key}\\"":';
      let targetKey = '"\\"{target_key}\\"":';
      if (key != value) {
        prossedRecords = prossedRecords.replaceAll(
          replaceKey.replace("{replace_key}", key),
          targetKey.replace("{target_key}", value)
        );
      }
    });

    prossedRecords = prossedRecords.replaceAll('\\"', "");

    let prossedRecordsJSON = JSON.parse(prossedRecords);

    let dataRecords = [];
    prossedRecordsJSON.forEach((record) => {
      // ** here we will loop over every single record in csv file ??? will it not take too much time
      let attribut = {};
      attribut.type = this.selectedObject;
      let obj = {};
      obj = record;
      obj.attributes = attribut;
      dataRecords.push(obj);
    });

    let records = JSON.stringify(dataRecords);

    insertRecords({ records: records }) // ** finish for update record also then continue working on bulk logic
      .then((result) => {
        const event = new ShowToastEvent({
          title: "success",
          variant: "success",
          message: "record inserted successfully"
        });
        this.dispatchEvent(event);
        console.log("insert record result =>", result);
      })
      .catch((error) => {
        console.log("insert record error =>", error);
      });
  }

  handlecancel() {
    console.log("sfData loader cancel : ");
    this.selectedObject = ""; // set null to every other varibale too if user is terminating the changes
  }

  handleDMLChange(event) {
    console.log("Option selected with value: " + event.detail.value);
    this.selectedDmlAction = event.detail.value; // *** here put the logic to show the field selector component
    this.showFieldSelector = true;
  }
}