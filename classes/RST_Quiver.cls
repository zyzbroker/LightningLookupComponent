global without sharing class RST_Quiver {

    global static final String RSTNAMESPACE = RST_Quiver.class.getName().substringBefore('RST_Quiver').removeEnd('.');
    global static final String RSTNAMESPACEPREFIX = (String.isEmpty(RSTNAMESPACE)) ? '' : RSTNAMESPACE + '__';

    global static string namify(String fieldName){
        String result = fieldName.indexOf('__c') != -1 ? RSTNAMESPACEPREFIX + fieldName : fieldName;
        return result.toLowerCase();
    }

    global static string getString(Map<String,Object> query, String key){
        return query.get(key) != null ? string.valueOf(query.get(key)) : '';
    }

    global static integer getInteger(Map<String,Object> query, String key){
        String val = getString(query, key);
        try
        {
            return String.isNotEmpty(val) ? Integer.valueOf(val) : 0;
        }
        catch(Exception ex){
            return 0;
        }
    }

    global static string getDMLMessage(DmlException dml){
        List<String> msgs = new List<String>();
        for(Integer i=0; i < dml.getNumDml(); i++){
            msgs.add(dml.getDmlMessage(i));
        }
        return String.join(msgs, '. ');
    }

    global static RST_RequestBase createRequestInstance(Map<String,Object> query){
        String className = RST_Quiver.getString(query, 'class');

        if(String.isEmpty(className)){
            throw new AuraHandledException('Invalid Request: the class name is not specified.');
        }

        Type iType = Type.forName(RSTNAMESPACE, className);
        return (RST_RequestBase) iType.newInstance();
    }

    global static Map<String,Object> toStringObjectMap(Object mapObj){
        Map<String,Object> result = new Map<String,Object>();
        Map<Object,Object> objMap = (Map<Object,Object>) mapObj;

        for(Object obj: objMap.keySet()){
            result.put(String.valueOf(obj), objMap.get(obj));
        }

        return result;
    }
}
