({

    onInit: function(cmp, evt, h){
        h.init(cmp);
    },

    onFocus: function(cmp, evt, h){
        h.focus(cmp);
    },

    onBlur: function(cmp, evt, h){
        h.blur(cmp);
    },

    onKeydown: function(cmp, evt, h){
        h.keydown(cmp, evt);
    },

    onEnterResults: function(cmp, evt, h){
        h.enterResults(cmp, evt);
    },

    onLeaveResults: function(cmp, evt, h){
        h.leaveResults(cmp, evt);
    },

    onSelectOption: function(cmp, evt, h){
        evt.preventDefault();
        h.selectOption(cmp, evt);
    },

    onRemoveOption: function(cmp, evt, h){
        h.removeOption(cmp, evt);
    },


})