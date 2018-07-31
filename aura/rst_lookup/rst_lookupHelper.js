({
    API: {
        LookUp: {
            'class': 'RST_LookupRequest',
            'method': 'rst_get'
        }
    },

    KEYCODES: {
        'ESC': 27,
        'TAB': 9,
        'ENTER': 13,
        'ARROWDONW': 40,
        'ARROWUP': 38,
        'ARROWLEFT': 37,
        'ARROWRIGHT': 39
    },

    init: function(cmp) {
        cmp.set('v.controlId', this._getNextControlId());
    },

    focus: function(cmp) {
        var results = cmp.get('v.results') || [];
        cmp.set('v.focused', true);

        if (!!cmp.get('v.keyword')) {
            this._showResults(cmp, 1);
        }
    },

    blur: function(cmp) {
        function onBlur(cmp) {
            if (!!cmp.get('v.skipBlur')) {
                return;
            }
            cmp.set('v.focused', false);
            cmp.set('v.value', cmp.get('v.keyword'));
            this._showResults(cmp, 0);
        }
        this._debounce(cmp, onBlur, 10);
    },

    keydown: function(cmp, evt) {
        var keyCode = evt.keyCode;
        if ([this.KEYCODES.ARROWLEFT, this.KEYCODES.ARROWRIGHT].indexOf(keyCode) !== -1) {
            return;
        }

        if ([this.KEYCODES.ESC, this.KEYCODES.TAB].indexOf(keyCode) !== -1) {
            cmp.set('v.isSearching', false);
            cmp.set('v.value', cmp.get('v.keyword'));
            this._showResults(cmp, 0);
            return;
        }
        if ([this.KEYCODES.ARROWUP, this.KEYCODES.ARROWDONW].indexOf(keyCode) !== -1) {
            this._handleArrowKeys(cmp, keyCode);
            return;
        }

        if (keyCode === this.KEYCODES.ENTER) {
            this._handleEnterKey(cmp);
            return;
        }

        if (!evt.target.value) {
            cmp.set('v.keyword', '');
            cmp.set('v.value', '');
            cmp.set('v.beginToSearch', false);
            this._resetResults(cmp);
            this._setSearchFlag(cmp, 0);
            this._showResults(cmp, 0);
            return;
        }

        this._showResults(cmp, 1);
        this._resetResults(cmp);
        cmp.set('v.keyword', evt.target.value);
        cmp.set('v.beginToSearch', true);
        this._waitForInput(cmp, true);
        this._debounce(cmp, this._search, cmp.get('v.debounceDuration'));
    },

    _handleEnterKey: function(cmp) {
        var results = cmp.get('v.results');
        var selPos = this._findSelectedIndex(results);
        var found = selPos !== -1;

        function callback(cmp) {
            if (found) {
                cmp.set('v.id', results[selPos].id);
                cmp.set('v.value', results[selPos].title);

            } else {
                cmp.set('v.id', '');
                cmp.set('v.value', '');
            }
            cmp.set('v.keyword', '');
            cmp.set('v.results', []);
            this._showResults(cmp, 0);
            this._showSelectedValue(cmp, found);
        }

        this._async(cmp, callback, 10);
    },

    _handleArrowKeys: function(cmp, keyCode) {
        var pos,
            nextSelPos,
            results = cmp.get('v.results') || [];
        if (results.length === 0) {
            return;
        }

        pos = this._findSelectedIndex(results);

        if (keyCode === this.KEYCODES.ARROWDONW) {
            nextSelPos = pos + 1;
            if (nextSelPos < results.length) {
                if (pos !== -1) {
                    results[pos].selected = false;
                }
                results[nextSelPos].selected = true;
                cmp.set('v.results', results);
            }
            return;
        }

        if (pos === -1) {
            results[0].selected = true;
            cmp.set('v.results', results);
        } else {
            nextSelPos = pos - 1;
            if (nextSelPos >= 0) {
                results[pos].selected = false;
                results[nextSelPos].selected = true;
                cmp.set('v.results', results);
            }
        }

    },

    _findSelectedIndex: function(results) {
        if (results.some(function(r) {
            return r.selected === true
        })) {
            for (var i = 0; i < results.length; i++) {
                if (results[i].selected) {
                    return i;
                }
            }
        }
        return -1;
    },

    enterResults: function(cmp, evt) {
        cmp.set('v.skipBlur', true);
    },

    leaveResults: function(cmp, evt) {
        cmp.set('v.skipBlur', false);
    },

    selectOption: function(cmp, evt) {
        var id,
            results = cmp.get('v.results'),
            el = evt.target;

        el = this._findParent(el, 'A');

        if (!!el) {
            id = el.getAttribute('data-id');
            results.forEach(function(r) {
                if (r.id == id) {
                    r.selected = true;
                } else {
                    r.selected = false;
                }
            });
            cmp.set('v.results', results);
        }
        this._handleEnterKey(cmp);
    },

    _findParent: function(el, tagName) {
        if (el.tagName === tagName) {
            return el;
        }

        el = el.parentElement;
        return this._findParent(el, tagName);
    },

    removeOption: function(cmp, evt) {
        this._resetResults(cmp);
        cmp.set('v.value', '');
        cmp.set('v.keyword', '');
        cmp.set('v.skipBlur', false);
        this._showSelectedValue(cmp, false);
        this._async(cmp, function(cmp) {
            cmp.find('lookupInput').getElement().focus();
        }, 250);
    },

    _showSelectedValue: function(cmp, shown) {
        var container = cmp.find('lookupContainer');
        cmp.set('v.isValueSelected', shown);
        this._adjustClass(container, 'slds-has-selection', shown);
    },

    _resetResults: function(cmp) {
        cmp.set('v.id', '');
        cmp.set('v.results', []);
    },

    _isValueKey: function(keyCode) {
        if ((keyCode > 47 && keyCode < 91) || (keyCode > 95 && keyCode < 106) || (keyCode > 185 && keyCode < 223)) {
            return 1;
        }
        return 0;
    },

    _search: function(cmp) {
        var keyword = cmp.get('v.keyword');
        this._waitForInput(cmp, false);
        if (!keyword) {
            return;
        }

        this._setSearchFlag(cmp, true);

        var body = {
            'sobject': cmp.get('v.sobject'),
            'keyword': keyword,
            'searchField': cmp.get('v.searchField'),
            'orderByField': cmp.get('v.orderField'),
            'ascending': !!cmp.get('v.ascending')
                ? '1'
                : '0',
            'nodupe': !!cmp.get('v.noDuplicate')
                ? '1'
                : '0',
            'pageSize': cmp.get('v.pageSize'),
            'subTitleFields': cmp.get('v.subTitleFields'),
            'where': cmp.get('v.filter')
        };

        this._doLookup(cmp, body);
    },

    _doLookup: function(cmp, body) {

        function successHandler(cmp, response) {
            cmp.set('v.results', this._shapeResults(cmp, response));
            this._setSearchFlag(cmp, false);
        }

        function errorHandler(cmp, error) {
            this._msgBox('error', error);
            this._setSearchFlag(cmp, false);
            this._showResults(cmp, false);
        }

        this._dispatcher(cmp).className(this.API.LookUp.class).action(this.API.LookUp.method).body(body).onSuccess(successHandler).onError(errorHandler).execute();
    },

    _shapeResults: function(cmp, response) {
        var data = response || [],
            results = [],
            subTitle,
            searchField = (cmp.get('v.searchField') || '').toLowerCase(),
            subTitleFields = (cmp.get('v.subTitleFields') || '').toLowerCase().split(','),
            noDupe = cmp.get('v.noDuplicate');

        function getSubTitle(d) {
            if (subTitleFields.length === 0) {
                return '';
            }
            var result = [];
            subTitleFields.forEach(function(f) {
                if (!!d[f]) {
                    result.push(d[f]);
                }
            });
            return result.join(' ⋅ ');
        }

        if (data.length === 0) {
            return [];
        }
        if (!!noDupe) {
            return data.map(function(d) {
                return {'id': d[searchField], 'title': d[searchField], 'selected': false, subtitle: ''};
            });
        }

        return data.map(function(d) {
            return {'id': d['id'], 'title': d[searchField], 'selected': false, 'subtitle': getSubTitle(d)};
        });
    },

    _waitForInput: function(cmp, waiting) {
        cmp.set('v.isTyping', waiting);
    },

    _setSearchFlag: function(cmp, isSearch) {
        cmp.set('v.isSearching', isSearch);
        cmp.set('v.beginToSearch', isSearch);
    },

    _showResults: function(cmp, visible) {
        var lookup = cmp.find('lookup');
        this._adjustClass(lookup, 'slds-is-open', visible);
    },

    _adjustClass: function(el, cssClass, isAdd) {

        if (!!isAdd) {
            if (!$A.util.hasClass(el, cssClass)) {
                $A.util.addClass(el, cssClass);
            }
        } else {
            if ($A.util.hasClass(el, cssClass)) {
                $A.util.removeClass(el, cssClass);
            }
        }
    },

    _getNextControlId: function() {
        return 'ctl' + Math.floor(100000 + Math.random() * 90000);
    }
})
