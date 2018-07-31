({
    //need override if payload is not associated with onSuccess()
    _onSuccess: function(cmp, response, action) {
        this._msgBox('error', 'The success callback method is not implemented.');
    },

    //need override if payload is not attached with onError
    _onError: function(cmp, error, action) {
        this._msgBox('error', error);
    },

    _info: function(pattern, params){
        console.info(pattern, params);
    },

    _error: function(pattern, params){
        console.error(pattern, params);
    },

    _warn: function(pattern, params){
        console.warn(pattern, params);
    },

    _log: function(pattern, params){
        console.log(pattern, params);
    },

    _dispatcher: function(cmp) {
        var _className, _action, _body, _query, _successCallback, _errorCallback, 
        self = this, _internal = {};
        
        _internal.className = function(c) {
            _className = c;
            return _internal;
        };

        
        _internal.action = function(a) {
            _action = a;
            return _internal;
        };


        _internal.body = function(b){
            _body = b;
            return _internal;
        };

        _internal.onSuccess = function(f){
            _successCallback = f;
            return _internal;
        };

        _internal.onError = function(f){
            _errorCallback = f;
            return _internal;
        };

        _internal.execute = function(){
           
            var payload = {
            'action': _action,
            'data': {
                'query': {
                    'class': _className,
                    'body': _body
                }
            },
            'onSuccess': _successCallback,
            'onError': !!_errorCallback ? _errorCallback : 0
            };

            self._sys_dispatch(cmp, payload);
        };

        return _internal;

    },

    _sys_dispatch: function(cmp, payload) {
        var request, errors, state, self = this,
            cmp = cmp.getConcreteComponent();

        function successCallback(cmp, response){
            if (!!payload.onSuccess) 
            {
                payload.onSuccess.call(self, cmp, response);
                  
            } 
            else 
            {
                self._onSuccess.call(self, cmp, response, payload.action);
            }
        }

        function failureCallback(cmp, errMsg){
            if (!!payload.onError) 
            {
                payload.onError.call(self, cmp, errMsg);
            } 
            else 
            {
                self._onError.call(self, cmp, errMsg, payload.action);
            }
        }

        function handleResponse(response) {
            state = response.getState();
            if (!cmp.isValid()) {
                self._msgBox('error', 'The component is out of scope.');
                return;
            }
            switch (state) {
                case 'SUCCESS':
                    successCallback(cmp, response.getReturnValue());
                    break;
                case 'ERROR':
                    errors = response.getError();
                    if (!!errors && !!errors[0] && !!errors[0].message) {
                        failureCallback(cmp, errors[0].message);
                    } else {
                        failureCallback(cmp, 'The system runs into an error.');
                    }
                    break;
                case 'INCOMPLETE':
                    failureCallback(cmp, 'The system runs into an incomplete state.');
                    break;
                default:
                    failureCallback(cmp, 'The system runs into an unknown state.');
                    break;
            }
        }

        try {
            request = cmp.get('c.' + payload.action);
            request.setParams(payload.data || {});
            
            if (!!payload.storable) {
                request.setStorable();
            }
            request.setCallback(self, handleResponse);
            $A.enqueueAction(request);
        } catch (ex) {
            console.log(ex);
            failureCallback('error', ex.message);
        }
    },

    _msgBox: function(msgType, msg) {
        var evt = $A.get('e.force:showToast');
        evt.setParams({
            message: msg,
            type: msgType,
            mode: msgType === 'error' ? 'sticky' : 'dismissible'
        });
        evt.fire();
    },

    _async: function(cmp, callback, duration) {
        if (!callback) {
            return;
        }
        var self = this;
        duration = duration || 200;
        var id = window.setTimeout($A.getCallback(function() {
            window.clearTimeout(id);
            if (cmp.isValid()) {
                callback.call(self,cmp);
            }
        }), duration);

        return id;
    },

    _throttle: function(cmp, callback, duration) {
        var self = this;
        var lock = cmp.get('v.rst_lock');
        var firstTime = cmp.get('v.rst_firsttime_lock');

        function onTimeout(cmp){
            if(!!callback){
                callback(cmp);
            }
            cmp.set('v.lock',false);
        }

        if(!!lock) {return;}
        cmp.set('v.lock', true);
        
        if(!!firstTime){
            cmp.set('v.rst_firsttime_lock', false);
            duration = 0;
        }

        this._async(cmp, onTimeout, duration);
    },

    _debounce: function(cmp, callback, duration){
        var wait = duration || 250,
            self = this,
            timeoutId = cmp.get('v.rst_timeout_id');

        function wrapCallback(cmp){
            if(!!callback){
                callback.call(self,cmp);
            }
            cmp.set('v.rst_timeout_id',0);
        }

        if(!!timeoutId){
            window.clearTimeout(timeoutId);
        }

        timeoutId = this._async(cmp, wrapCallback, wait);
        cmp.set('v.rst_timeout_id', timeoutId);
    },

})