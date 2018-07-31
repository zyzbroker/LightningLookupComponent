global abstract class RST_RequestBase {
	
    global virtual Object rst_get(Map<String,Object> params){
        throw new AuraHandledException('The rst_get() is not implemented.');    
    }

    global virtual Object rst_update(Map<String,Object> params){
        throw new AuraHandledException('The rst_update() is not implemented.');    
    }

    global virtual Object rst_create(Map<String,Object> params){
        throw new AuraHandledException('The rst_create() is not implemented.');    
    }

    global virtual Object rst_delete(Map<String,Object> params){
        throw new AuraHandledException('The rst_delete() is not implemented.');    
    }    

}