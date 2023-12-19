public class DataLoaderController {
    
    @AuraEnabled(cacheable=true)
    public static String parseCSV(String documentId){	// ** rename method name as it is only returning file data
        ContentVersion content = [SELECT Id, VersionData FROM ContentVersion WHERE Id =: documentId LIMIT 1];
        System.debug('s ==>'+content.VersionData.Size());
        String csvData = content.VersionData.toString();
        return csvData;
    }
    
    @AuraEnabled()
    public static void insertRecords(String records){
        List<ContentDocument> conDoc = [SELECT Id FROM ContentDocument 
                                         where Id IN 
                                        (SELECT ContentDocumentId FROM ContentVersion)];
        if(!conDoc.isEmpty()){
            delete conDoc;
        }
        List<SObject> recordsToInsert = (List<Sobject>)JSON.deserialize(records, List<Sobject>.class);
        Id batchJobId = Database.executeBatch(new DataLoaderBatch(recordsToInsert), 200);
        System.debug('id==>'+batchJobId);
       	/*insert recordsToInsert;
        System.debug('recordsToInsert===>'+recordsToInsert);*/
        
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getFields(String objectApiName){
        List<String> editableFieldNames = new List<String>();
        try {
            // Get the SObject type token
            Schema.SObjectType objectType = Schema.getGlobalDescribe().get(objectApiName);
            if (objectType != null) {
                Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
                for (Schema.SObjectField field : objectDescribe.fields.getMap().values()) {
                    Schema.DescribeFieldResult fieldDescribe = field.getDescribe();
                    if (fieldDescribe.isUpdateable() && !fieldDescribe.getName().endsWithIgnoreCase('Date') && !fieldDescribe.getName().endsWithIgnoreCase('By')) {
                        editableFieldNames.add(fieldDescribe.getName());
                    }
                }
            }
        } catch (Exception e) {
            System.debug('Error fetching editable fields: ' + e.getMessage());	// ** create a class which will co	ntains common method such as error handling create a wrapper class which will handle the success or error response
        }
        return editableFieldNames;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getAllObjects(){	// ** I guess these methods are already created in some other class please use it for getFields also I think so
        List<String> objectNames = new List<String>();
        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();
        for (String objectName : globalDescribe.keySet()) {
            Schema.SObjectType objectType = globalDescribe.get(objectName);
            Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
            if (!objectDescribe.isDeprecatedAndHidden() && objectDescribe.isCreateable() && objectDescribe.isUpdateable()) {
                objectNames.add(objectName);
            }
        }
        return objectNames;
    }
    
    @AuraEnabled(cacheable=true)
    public static String getMappingJson(String objectName, String userId){
        List<Mapping__c> mapDelRec = new List<Mapping__c>();
        String maxJson = '';
        List<Mapping__c> mapRecords = [SELECT Id, UserId__c, JSON__c 
                                       FROM Mapping__c 
                                       where UserId__c =: userId and Object_Name__c =: objectName ];
        for(Mapping__c mapRec : mapRecords){
            if(String.isNotEmpty(mapRec.JSON__c) && mapRec.JSON__c.length() > maxJson.length() ){
                maxJson = mapRec.JSON__c;
            }
        }
        return maxJson;
    }
}