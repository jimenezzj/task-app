const searchAgregtHelper = (Schema, searchVal, fieldsToIgnore) => {
    const orArray = [];
    const fieldsProjection = { ...fieldsToIgnore }
    const newFieldsToString = {};
    const projectionToLower = {};
    Schema.schema.eachPath((docKey, schema) => {
        const regexToSearch = new RegExp(`${searchVal}`, 'i')
        if (docKey !== '__v' && docKey !== '_id') {
            let field;
            if (schema.instance !== 'String') {
                const newField = docKey + '';
                if (schema.instance === 'Array' && docKey !== 'fotos') {
                    projectionToLower[newField] = {
                        '$reduce': {
                            input: '$' + docKey,
                            initialValue: '',
                            in: { '$concat': ['$$value', '$$this'] }
                        }
                    };
                } else {
                    if (docKey !== 'fotos') newFieldsToString[newField] = { '$toString': '$' + docKey };
                    projectionToLower[newField] = 1;
                }
                // fieldsProjection[docKey] = 0;
                field = { [newField]: { '$regex': regexToSearch } }
            } else {
                projectionToLower[docKey] = 1;
                field = { [docKey]: { '$regex': regexToSearch } }
            }
            orArray.push(field);
        };
    });
    return {
        'addFields': newFieldsToString,
        'projectReduce': projectionToLower,
        'projectShowFields': fieldsProjection,
        'match': { '$or': orArray }
    }
}

exports.searchAgregtHelper = searchAgregtHelper;