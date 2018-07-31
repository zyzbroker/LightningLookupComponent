public with sharing class RST_LookupRequest extends RST_RequestBase {

    List<String> SelectFields {get; private set;}

    public RST_LookupRequest(){
        this.SelectFields = new List<String>();
    }

	public override Object rst_get(Map<String,Object> params){
        Map<String,String> query = parseParameters(params);

        validateQuery(query);
        return runQuery(query);
    }

    Map<String,String> parseParameters(Map<String,Object> paramMap){
        Map<String,String> query = new Map<String,String>();

        query.put('sobject', RST_Quiver.getString(paramMap, 'sobject'));
        query.put('keyword', RST_Quiver.getString(paramMap, 'keyword'));
        query.put('searchField', RST_Quiver.getString(paramMap, 'searchField'));
        query.put('orderByField', RST_Quiver.getString(paramMap, 'orderByField'));
        query.put('ascending', RST_Quiver.getString(paramMap, 'ascending'));
        query.put('nodupe', RST_Quiver.getString(paramMap, 'nodupe'));
        query.put('pageSize', RST_Quiver.getString(paramMap, 'pageSize'));
        query.put('subTitleFields', RST_Quiver.getString(paramMap, 'subTitleFields'));
        query.put('where', RST_Quiver.getString(paramMap, 'where'));

        return query;
    }

    void validateQuery(Map<String,String> query){
        if(String.isEmpty(query.get('sobject'))){
            throw new AuraHandledException('The lookup table is not specified.');
        }
        if(String.isEmpty(query.get('keyword'))){
            throw new AuraHandledException('The lookup keyword is required.');
        }
        if(String.isEmpty(query.get('searchField'))){
            throw new AuraHandledException('The look search field is required.');
        }
    }

    List<Map<String,Object>> runQuery(Map<String,String> query){
        List<Map<String,Object>> results = new List<Map<String,Object>>();
        String sqlStatement = buildSQL(query);
        List<SObject> rowset = Database.query(sqlStatement);

        for(SObject obj: rowset){
            results.add(transformSObject(obj, query));
        }

        return results;
    }

	List<String>parseSubTitleFields(String fields){
		if(String.isNotEmpty(fields)){
			return fields.split(',');
		}
		return new List<String>();
	}

    String buildSQL(Map<String,String> query){
        List<String> sqls = new List<String>();
        List<String> predicates = new List<String>();
        String noDupe = query.get('nodupe');
        String searchField = RST_Quiver.namify(query.get('searchField'));
		String orderField = RST_Quiver.namify(query.get('orderByField'));
        String keyword = query.get('keyword');
        String whereClause = query.get('where');
		List<String> subTitleFields = parseSubTitleFields(query.get('subTitleFields'));
        integer pageSize = RST_Quiver.getInteger(query,'pageSize');
        pageSize = pageSize == 0 ? 5 : pageSize;
		boolean doNotDupe = noDupe == '1';

        sqls.add('SELECT');
        this.SelectFields.add(searchField);
		if(!doNotDupe){
			this.SelectFields.add('id');
			for(String fld: subTitleFields){
				if(String.isNotEmpty(fld)){
					this.SelectFields.add(RST_Quiver.namify(fld));
				}
			}
		}
		sqls.add(String.join(this.SelectFields,','));
        sqls.add('FROM');
        sqls.add(RST_Quiver.namify(query.get('sobject')));
        sqls.add('WHERE');
        sqls.add(searchField + ' LIKE \'' + keyword + '%\'');

		if(String.isNotEmpty(whereClause)){
            sqls.add(' AND ' + whereClause);
        }

		If(doNotDupe){
			sqls.add('GROUP BY ' + searchField);
		} else if (String.isNotEmpty(orderField)) {
			sqls.add('ORDER BY ' + orderField);
		}

        sqls.add('LIMIT ' + String.valueOf(pageSize));

        return String.join(sqls,' ');
    }

    Map<String,Object> transformSObject(SObject record, Map<String,String> query){
        Map<String,Object> result = new Map<String,Object>();
        for(String fld: this.SelectFields){
            result.put(fld, record.get(fld));
        }
        return result;
    }
}
