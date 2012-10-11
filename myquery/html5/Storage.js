/// <reference path="../myquery.js" />

myQuery.define("html5/Storage",function ($, undefined) {
    "use strict"; //启用严格模式
    var localStorage = window.localStorage || globalStorage[location.host]
    , sessionStorage = window.sessionStorage;

    $.Storage = {};

    var Storage = function (storage) {
        this.storage = storage;
    };
    Storage.prototype = {
        constructor: Storage
            , addChangeHandler: function (fun) {
                /// <summary>绑定storge改变事件</summary>
                /// <para>e.key</para> 
                /// <para>e.newValue</para>
                /// <para>e.oldValue</para>
                /// <para>e.url</para>
                /// <para>e.storageArea</para>
                /// <param name="fun" type="Function">方法</param>
                /// <returns type="self" />

                return $.event.document.addHandler(window, "storage", fun);
            }
            , clear: function () {
                /// <summary>删除所有storge</summary>
                /// <returns type="this" />
                this.storge.clear();
                return this;
            }
            , get: function (key) {
                /// <summary>获得本地数据</summary>
                /// <param name="key" type="String">键</param>
                /// <returns type="self" />
                var value = this.storage.getItem(key);
                return value ? $.parseJSON(value) : value;
            }
            , set: function (key, value) {
                /// <summary>储存到本地数据</summary>
                /// <param name="key" type="String">键</param>
                /// <param name="value" type="any">值</param>
                /// <returns type="self" />
                this.storage.setItem(key, JSON.stringify(value));
                return this;
            }
            , getByList: function (keyList) {
                /// <summary>获得本地数据</summary>
                /// <param name="keyList" type="Array<String>">字符串数组</param>
                /// <returns type="Object" />
                var valueList = {};
                $.each(keyList, function (key) {
                    valueList[key] = this.get(key);
                }, this);
                return valueList;
            }
            , setByObject: function (object) {
                /// <summary>通过Object储存到本地数据</summary>
                /// <param name="object" type="Object">键值对的形式</param>
                /// <returns type="self" />
                $.each(object, function (value, key) {
                    this.set(key, value);
                }, this);
                return this
            }
    }

    localStorage && ($.Storage.local = new Storage(localStorage));
    sessionStorage && ($.Storage.session = new Storage(sessionStorage));

    return $.Storage;
});
