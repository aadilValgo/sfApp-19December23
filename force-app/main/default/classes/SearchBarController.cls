/**
 * @name : SearchBarController
 * @author : Kamya Tanwar
 * @used_for : Object selector component
 * @date : 01-12-2023
 * @change_history : 
 */
public class SearchBarController{
    
    public static List<SObjectWrapper> wrapperObjList = new List<SObjectWrapper>();
    //Method to fetch all SObjects in database custom and Standard both
    
    @AuraEnabled(cacheable = true)
    public static List<SObjectWrapper>  fetchAllObjects(){
    	
        Map<String, Schema.SObjectType> allObjectsMap = Schema.getGlobalDescribe();
        
        for(Schema.SObjectType obj : allObjectsMap.values()){
            
            Schema.DescribeSObjectResult objResult = obj.getDescribe();
            if(objResult.isCreateable()){
                SObjectWrapper wrapperObj = new SObjectWrapper();
                wrapperObj.value = objResult.getName();
                wrapperObj.label = objResult.getLabel();
                wrapperObjList.add(wrapperObj);
            }
            
        }
		wrapperObjList.sort();        
        System.debug('Sorted Object List -> '+wrapperObjList);
        return wrapperObjList;
    }
    /*//This method is to fetch filltered SObjects on the basis of given searchKey
    @AuraEnabled(cacheable = true)
    public static List<SObjectWrapper> fetchFillteredObjects(String searchKey){
    
        Map<String, Schema.SObjectType> allObjectsMap = Schema.getGlobalDescribe();
        
        for(Schema.SObjectType obj : allObjectsMap.values()){
            
            Schema.DescribeSObjectResult objResult = obj.getDescribe();
            if(objResult.getName().contains(searchKey)){
                System.debug('Object Name -> '+objResult.getName());
            	System.debug('Object Label -> '+objResult.getlabel());
                System.debug('........ Account name matched.......');
            	SObjectWrapper wrapperObj = new SObjectWrapper();
            	wrapperObj.name = objResult.getName();
            	wrapperObj.label = objResult.getLabel();
            	wrapperObjList.add(wrapperObj);
            }
        }
		wrapperObjList.sort();        
        System.debug('Sorted Object List -> '+wrapperObjList);
        return wrapperObjList;
    
    }*/
    public class SObjectWrapper implements Comparable{

    	@AuraEnabled public String value;
		@AuraEnabled public String label;        
        
        public Integer compareTo(Object obj){
            SObjectWrapper wrapperObj = (SObjectWrapper) obj;
            return this.label.compareTo(wrapperObj.label);
        }
	}			
}