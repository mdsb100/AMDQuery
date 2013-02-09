/// <reference path="../myquery.js" />

myQuery.define("html5/applicationCache", function ($, undefined) {
    "use strict"; //启用严格模式
    if (window.applicationCache) {
        var aCache = applicationCache;
        $.applicationCache = {
            addEventListener: function (type, fun) {
                /// <summary>绑定applicationCache事件</summary>
                /// <param name="type" type="String">事件名</param>
                /// <param name="fun" type="Function">方法</param>
                /// <returns type="self" />
                aCache.addEventListener(type, fun, true);
                return this;
            }
            , swapCache: function () {
                /// <summary>手动更新</summary>
                /// <returns type="self" />
                aCache.swapCache();
                return this;
            }
            , removeEventListener: function (type, fun) {
                /// <summary>解除applicationCache事件</summary>
                /// <param name="type" type="String">事件名</param>
                /// <param name="fun" type="Function">方法</param>
                /// <returns type="self" />
                aCache.removeEventListener(type, fun);
                return this;
            }

            , checking: function (fun) {
                /// <summary>检查</summary>
                /// <param name="fun" type="Function">方法</param>
                /// <returns type="self" />
                return this.addEventListener(arguments[1] || "checking", function () {
                    fun.apply(this, arguments);
                });
            }
            , noupdate: function (fun) {
                /// <summary>无更新</summary>
                /// <param name="fun" type="Function">方法</param>
                /// <returns type="self" />
                return this.checking(fun, "noupdate");
            }
            , downloading: function (fun) {
                /// <summary>下载</summary>
                /// <param name="fun" type="Function">方法</param>
                /// <returns type="self" />
                return this.checking(fun, "downloading");
            }
            , progress: function (fun) {
                /// <summary>进度</summary>
                /// <param name="fun" type="Function">方法</param>
                /// <returns type="self" />
                return this.checking(fun, "progress");
            }
            , updateready: function (fun) {
                /// <summary>更新完毕</summary>
                /// <param name="fun" type="Function">方法</param>
                /// <returns type="self" />
                return this.checking(fun, "updateready");
            }
            , cached: function () {
                /// <summary>已缓存</summary>
                /// <param name="fun" type="Function">方法</param>
                /// <returns type="self" />
                return this.checking(fun, "cached");
            }
            , error: function () {
                /// <summary>错误</summary>
                /// <param name="fun" type="Function">方法</param>
                /// <returns type="self" />
                return this.checking(fun, "error");
            }
        }
    }
    return $.applicationCache || null;
}); 
