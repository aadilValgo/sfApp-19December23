/**
 * @name : FieldSelectorController
 * @author : Kamya Tanwar
 * @used_for : Field select component
 * @date : 01-12-2023
 * @change_history : 
 */
public class FieldSelectorController {

    @AuraEnabled(cacheable=true)
        public Static List<FieldSelectorControllerWrapper> fetchAllFields(String objectApiName){
        
            Map <String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
            List<FieldSelectorControllerWrapper> wrapperFieldList = new List<FieldSelectorControllerWrapper>();
            System.debug('Selected object is:' + objectApiName);
            Map<String, Schema.SObjectField> fieldMap = schemaMap.get(objectApiName).getDescribe().fields.getMap();
           	Integer fieldId = 1;
            
            for(Schema.SObjectField sfieldValues : fieldMap.Values()){
                FieldSelectorControllerWrapper wrapperField = new FieldSelectorControllerWrapper();
                Schema.describefieldresult fieldData = sfieldValues.getDescribe();
                //if(fieldData.isUpdateable() && !fieldDescribe.getName().endsWithIgnoreCase('Date') 
                //&& !fieldDescribe.getName().endsWithIgnoreCase('By')){
                    wrapperField.fieldId = fieldId;
                    wrapperField.fieldName = fieldData.getName();
                    wrapperField.fieldLabel = fieldData.getLabel();
                    wrapperField.fieldType = String.valueOf(fieldData.getType());
                    wrapperFieldList.add(wrapperField);
                    fieldId++;
                //}  
            }
            Set<FieldSelectorControllerWrapper> wrapperSet = new Set<FieldSelectorControllerWrapper>();
            wrapperSet.addAll(wrapperFieldList);
            return wrapperFieldList;
            
     }
    
    // to fetch mapable target fields for any given source field 
	@AuraEnabled(cacheable=true)
    public static List<FieldSelectorControllerWrapper> fetchMapableFields(String sourceFieldType, String objectApiName, Boolean compatible ){
        
        Map<String, Schema.SObjectType> global_describe = Schema.getGlobalDescribe();
        Map<String, Schema.SObjectField> sourceFieldMap = global_describe.get('Lead').getDescribe().fields.getMap();
        Map<String, Schema.SObjectField> targetFieldMap = global_describe.get(objectApiName).getDescribe().fields.getMap();
        System.debug('targetFieldMap -> ' + targetFieldMap.keySet());
        List<FieldSelectorControllerWrapper> wrapperFieldList = new List<FieldSelectorControllerWrapper>();
        Integer fieldId = 1;
        
        //to fetch All Target Fields When compatible is flase 
        if(!compatible){
            wrapperFieldList = fetchAllFields(objectApiName);
            return wrapperFieldList;
        }
        
        Source_Data_Type__mdt sourceField = [SELECT ID, Label FROM Source_Data_Type__mdt WHERE Label =: sourceFieldType];
        List<Target_Field_Type__mdt> targetFieldsList = [SELECT Target_Field_Type__c FROM Target_Field_Type__mdt WHERE Source_Data_Type__c =: sourceField.ID];
        
        for(Schema.SObjectField target : targetFieldMap.values()){

            FieldSelectorControllerWrapper wrapperField = new FieldSelectorControllerWrapper();
            Schema.describefieldresult fieldData = target.getDescribe();
                
            //if(targetFieldsList.contains(fieldData.getType())){
                wrapperField.fieldId = fieldId;
             	wrapperField.fieldName = fieldData.getName();
                wrapperField.fieldLabel = fieldData.getLabel();
                wrapperField.fieldType = String.valueOf(fieldData.getType());
                wrapperFieldList.add(wrapperField);
                fieldId++;
        	//}      
        }
        
        //List<String> targetDatatypesList = '';
        /*
        Integer fieldId = 1;
		
        //to fetch sourceField and Data type 
        for(Schema.SObjectField source : sourceFieldMap.values()){
			
            FieldSelectorControllerWrapper wrapperField = new FieldSelectorControllerWrapper();
            Schema.describefieldresult fieldData = source.getDescribe();
                
            if(fieldData.isCreateable()){
                wrapperField.fieldId = fieldId;
             	wrapperField.fieldName = fieldData.getName();
                wrapperField.fieldLabel = fieldData.getLabel();
                wrapperField.fieldType = String.valueOf(fieldData.getType());
                wrapperFieldList.add(wrapperField);
                fieldId++;
        	}            
        }
        return wrapperFieldList; */
        return null;
    }
    // this method is to mapp lead fields to given object fields
    @AuraEnabled(cacheable=true)
    public static void leadConversionProcess(List<SObject> sourceToTargetList){
    	    
        
    }
    public class FieldSelectorControllerWrapper{
       
        @auraEnabled public Integer fieldId;
        @auraEnabled public String fieldName; //Yuvraj 05102022 - please change variable name 
        @auraEnabled public String fieldLabel;
        @auraEnabled public String fieldType;
    }
}