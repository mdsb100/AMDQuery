/// <reference path="../myquery.js" />'
/// <reference path="object.js" />
/// <reference path="thread.js" />

myQuery.define("module/Threadpool", ["main/object", "module/Thread"], function ($, object, Thread, undefined) {
    "use strict"; //启用严格模式
    var ThreadPool = object.Collection("ThreadPool", {
        addHandler: function (type, fn) {
            /// <summary>为所有进程添加事件</summary>
            /// <param name="type" type="String">类型</param>
            /// <param name="fn" type="Function">方法</param>
            /// <returns type="self" />
            return this.each(function (thread) {
                thread.addHandler(type, fn);
            });
        }
        , removeHandler: function (type, fn) {
            /// <summary>为所有进程移除事件</summary>
            /// <param name="type" type="String">类型</param>
            /// <param name="fn" type="Function">方法</param>
            /// <returns type="self" />
            return this.each(function (thread) {
                thread.removeHandler(type, fn);
            });
        }
        , clearHandlers: function () {
            /// <summary>为所有进程清除所有事件</summary>
            /// <param name="fn" type="Function">方法</param>
            /// <returns type="self" />
            return this.each(function (thread) {
                thread.clearHandlers(fn);
            });
        }
        , on: function (type, fn) {
            /// <summary>为所有进程添加事件</summary>
            /// <param name="type" type="String">类型</param>
            /// <param name="fn" type="Function">方法</param>
            /// <returns type="self" />
            return this.addHandler(type, fn);
        }
        , off: function (type, fn) {
            /// <summary>为所有进程移除事件</summary>
            /// <param name="type" type="String">类型</param>
            /// <param name="fn" type="Function">方法</param>
            /// <returns type="self" />
            return this.removeHandler(type, fn);
        }
        , clear: function () {
            /// <summary>为所有进程清除所有事件</summary>
            /// <param name="fn" type="Function">方法</param>
            /// <returns type="self" />
            return this.clearHandlers();
        }
        , start: function () {
            /// <summary>全部启动</summary>
            /// <returns type="self" />
            return this.each(function (thread) {
                thread.start();
            });
        }
        , sleep: function (time) {
            /// <summary>全部睡眠</summary>
            /// <param name="time" type="Number">睡眠时间</param>
            /// <returns type="self" />
            return this.each(function (thread) {
                thread.sleep(time);
            });
        }
        , resume: function () {
            /// <summary>全部唤醒</summary>
            /// <returns type="self" />
            return this.each(function (thread) {
                thread.resume();
            });
        }
        , stop: function () {
            /// <summary>全部停止</summary>
            /// <returns type="self" />
            return this.each(function (thread) {
                thread.stop();
            });
        }
    });
    return ThreadPool;
});