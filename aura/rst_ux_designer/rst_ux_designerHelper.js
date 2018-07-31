({
    lookupIdChanged: function(cmp, evt) {
        console.info('----- account id: %s', evt.getParam('value'));
    },

    contactIdChanged: function(cmp, evt) {
        console.info('----- contact id: %s', evt.getParam('value'));
    },

    init: function(cmp, evt) {
        cmp.set('v.caseId', '5006A000002397XQAQ');
    }
})
