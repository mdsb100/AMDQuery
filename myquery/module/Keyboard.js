myQuery.define("module/Keyboard", ["main/event", "main/CustomEvent", "module/object", "hash/charcode"]
, function ($, event, CustomEvent, object, charcode) {
    "use strict"; //启用严格模式
    var Keyboard = object.Class("Keyboard", {
        constructor: Keyboard
        , init: function (container, keyList) {
            this._super();
            this.keyList = [];
            this.container = container;
            if (this.container.getAttribute("tabindex") == undefined) {
                this.container.setAttribute("tabindex", Keyboard.tableindex++);
            }
            this._initHandler().enable().addKeys(keyList);
        }
        , _initHandler: function () {
            //            if (!this.container) {
            //                return this;
            //            }
            //            var container = this.container, self = this, fun = function (e) {
            //                //console.log(e.keyCode);
            //                self.routing(this, e);
            //            }
            //            event.on(container, "keydown", fun)
            //            .on(container, "keypress", fun)
            //            .on(container, "keyup", fun);
            var self = this;
            this.event = function (e) {
                self.routing(this, e);
            }
            return this;
        }
        , enable: function () {
            event
            .on(this.container, "keydown", this.event)
            .on(this.container, "keypress", this.event)
            .on(this.container, "keyup", this.event);
            return this;
        }
        , disable: function () {
            event
            .off(this.container, "keydown", this.event)
            .off(this.container, "keypress", this.event)
            .off(this.container, "keyup", this.event);
            return this;
        }
        , _push: function (ret) {
            if (!(this.iterationKeyList(ret))) {//检查重复
                this.keyList.push(ret);
            }
            return this;
        }
        , addKey: function (obj) {
            var keyCode = obj.keyCode, ret;
            if ($.isArr(keyCode)) {
                for (var i = 0, len = keyCode.length, nObj; i < len; i++) {
                    $.easyExtend({}, obj);
                    nObj = obj;
                    nObj.keyCode = keyCode[i];
                    //                    ret = Keyboard.createOpt(nObj);
                    //                    this._push(ret);
                    //                    ret.fun && this.addHandler(Keyboard._getHandlerName(ret), ret.fun);
                    this.addKey(nObj);
                }
                return this;
            }
            else if ($.isStr(keyCode)) {
                ret = Keyboard.createOpt(obj);
                this._push(ret);
            }
            else if ($.isNum(keyCode)) {
                ret = obj;
                this._push(ret);
            }

            ret.fun && this.on(Keyboard._getHandlerName(ret), ret.fun);
            return this;
        }
        , addKeys: function (keyList) {
            if (!keyList) {
                return this;
            }
            var i = 0, len;
            if (!$.isArr(keyList)) {
                keyList = [keyList];
            }
            for (len = keyList.length; i < len; i++) {
                this.addKey(keyList[i]);
            }
            return this;
        }
        , changeKey: function (origin, evolution) {
            origin = Keyboard.createOpt(origin);
            var item;
            if (item = this.iterationKeyList(origin)) {
                $.extend(item, evolution);
            }
            return this;
        }
        , removeKey: function (obj) {
            var item, ret = Keyboard.createOpt(obj);
            if (item = this.iterationKeyList(ret)) {
                this.keyList.splice($.inArray(this.keyList, item), 1);
            }
            return this;
        }
        , iterationKeyList: function (e) {
            for (var i = 0, keyList = this.keyList, len = keyList.length, item, code, result = 0; i < len; i++) {
                code = e.keyCode || e.which;

                item = keyList[i];
                //console.log(e.type + ":" + code)

                if (
                e.type == item.type &&
                code == item.keyCode &&
                Keyboard.checkCombinationKey(e, item.combinationKey)
                ) {
                    return item;
                }
            }
            return false;
        }
        , routing: function (target, e) {
            e = event.event.document.getEvent(e);
            var item;
            if (item = this.iterationKeyList(e)) {
                //item.fun.call(this, e);i
                this.trigger(Keyboard._getHandlerName(item), target, e);
                event.event.document.preventDefault(e);
                event.event.document.stopPropagation(e);
            }
        }
    }, {
        codeToStringReflect: charcode.codeToStringReflect
        , stringToCodeReflect: charcode.stringToCodeReflect
        , createOpt: function (obj) {
            var keyCode = obj.keyCode;
            if (obj.combinationKey && obj.combinationKey.length) {
                if ($.isStr(keyCode)) {
                    keyCode = keyCode.length > 1 ? keyCode : keyCode.toUpperCase();
                }
                obj.type = 'keyup';
            }
            if ($.isStr(keyCode)) {
                obj.keyCode = Keyboard.stringToCode(keyCode);
            }

            return obj;
        }
        , codeToChar: function (code) {
            return $.isNum(code)
            ? String.fromCharCode(code)
            : code;
        }
        , codeToString: function (code) {
            return Keyboard.codeToStringReflect[code] || Keyboard.codeToChar(code);
        }
        , charToCode: function (c) {
            return $.isStr(c) ? c.charCodeAt(0) : c;
        }
        , stringToCode: function (s) {
            return Keyboard.stringToCodeReflect[s] || Keyboard.charToCode(s);
        }
        , checkCombinationKey: function (e, combinationKey) {
            var i = 0, j = 0, defCon = ["ctrl", "alt", "shift"], len = combinationKey ? combinationKey.length : 0, count1 = 0;
            if (e.combinationKey) {
                if (e.combinationKey.length == len) {
                    for (; i < len; i++) {
                        for (; j < len; j++) {
                            e.combinationKey[i] != combinationKey[j] && count1++;
                        }
                    }
                    if (len == count1) {
                        return 1;
                    }
                }
                else {
                    return 0;
                }
            }
            else {
                for (var count2 = combinationKey ? combinationKey.length : 0; i < len; i++) {
                    if (e[defCon[i] + "Key"] == true) count1++;

                    if (e[combinationKey[i] + "Key"] == false) { return 0; }
                }
                if (count1 > count2) {
                    return 0;
                }
            }
            //console.log(count1 + ":" + count2);
            return 1;
        }
        , _getHandlerName: function (obj) {
            //obj = Keyboard.createOpt(obj);
            var combinationKey = obj.combinationKey ? obj.combinationKey.join("+") + "+" : "";
            return obj.type + "." + combinationKey + Keyboard.stringToCode(obj.keyCode);
        }
        , tableindex: 9000
        , cache: []
        , getInstance: function (container, keyList) {
            var keyboard, i = 0, cache = Keyboard.cache, len = cache.length;
            for (; i < len; i++) {
                if (cache[i].container == container) {
                    keyboard = cache[i];
                }
            }
            if (!keyboard) {
                keyboard = new Keyboard(container, keyList);
                Keyboard.cache.push(keyboard);
            }
            return keyboard;
        }
    }, CustomEvent);

    return Keyboard;
});