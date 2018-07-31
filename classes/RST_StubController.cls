public without sharing class RST_StubController {
    
    @AuraEnabled
    public static Object rst_get(Map<String,Object> query){
        
        try
        {
          RST_RequestBase rstRequest = RST_Quiver.createRequestInstance(query);
          if(rstRequest == null){
            throw new AuraHandledException('null');
          }
          return rstRequest.rst_get(RST_Quiver.toStringObjectMap(query.get('body')));
        }
        catch(DmlException dmlEx)
        {
            throw new AuraHandledException(RST_Quiver.getDMLMessage(dmlEx));
        }
        catch(AuraHandledException auraEx)
        {
          throw auraEx;
        }
        catch(Exception ex){
          throw new AuraHandledException(ex.getStackTraceString() + ' :' + ex.getMessage());
        }
    }

    @AuraEnabled
    public static Object rst_update(Map<String,Object> query){

         try
        {
          RST_RequestBase rstRequest = RST_Quiver.createRequestInstance(query);
          return rstRequest.rst_update(RST_Quiver.toStringObjectMap(query.get('body')));
        }
        catch(DmlException dmlEx)
        {
            throw new AuraHandledException(RST_Quiver.getDMLMessage(dmlEx));
        }
        catch(AuraHandledException auraEx)
        {
          throw auraEx;
        }
        catch(Exception ex){
          throw new AuraHandledException(ex.getStackTraceString() + ' :' + ex.getMessage());
        }
    }

    @AuraEnabled
    public static Object rst_create(Map<String,Object> query){

         try
        {
          RST_RequestBase rstRequest = RST_Quiver.createRequestInstance(query);
          return rstRequest.rst_create(RST_Quiver.toStringObjectMap(query.get('body')));
        }
        catch(DmlException dmlEx)
        {
            throw new AuraHandledException(RST_Quiver.getDMLMessage(dmlEx));
        }
        catch(AuraHandledException auraEx)
        {
          throw auraEx;
        }
        catch(Exception ex){
          throw new AuraHandledException(ex.getStackTraceString() + ' :' + ex.getMessage());
        }
    }

    @AuraEnabled
    public static Object rst_delete(Map<String,Object> query){

         try
        {
          RST_RequestBase rstRequest = RST_Quiver.createRequestInstance(query);
          return rstRequest.rst_delete(RST_Quiver.toStringObjectMap(query.get('body')));
        }
        catch(DmlException dmlEx)
        {
            throw new AuraHandledException(RST_Quiver.getDMLMessage(dmlEx));
        }
        catch(AuraHandledException auraEx)
        {
          throw auraEx;
        }
        catch(Exception ex){
          throw new AuraHandledException(ex.getStackTraceString() + ' :' + ex.getMessage());
        }
    }
}