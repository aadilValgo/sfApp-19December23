global class DataLoaderBatch implements Database.Batchable<sObject> {
    global List<sObject> records;
    global DataLoaderBatch(List<sObject> records){
        this.records = records;
    }
    
	global List<sObject> start(Database.BatchableContext BC) {
        return records;
    }
    
    global void execute(Database.BatchableContext BC, List<sObject> recordList) {
        Database.SaveResult[] sr =  Database.insert(recordList, false);
        
        System.debug('recordsss===>'+sr);
       /* for (Contact aContact : contactList) {
            aContact.AssistantName = '';
        } update contactList;*/
    }
    
    global void finish(Database.BatchableContext BC) {
        System.debug('in finish');
    }
}