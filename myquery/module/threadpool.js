/// <reference path="../myquery.js" />'
/// <reference path="object.js" />
/// <reference path="thread.js" />

myQuery.define("module/threadpool", ["module/object", "module/thread"], function ($, object, Thread, undefined) {
    "use strict"; //启用严格模式
    
    var ThreadPool = object.Class("Thread", {
        init: function () {
            this.pool = [];
        }
        , render: function () {
            this.push.apply(this, arguments);
        }
        , each: function (fn, context) {
            /// <summary>遍历整个进程池</summary>
            /// <param name="fn" type="Function">方法</param>
            /// <param name="context" type="Object">上下文</param>
            /// <returns type="self" />
            for (var i = 0, pool = this.pool, item; item = pool[i++]; )
                fn.call(context || item, item, i);
            return this;
        }
        , addHandler: function (type, fn) {
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
        , unOn: function (type, fn) {
            /// <summary>为所有进程移除事件</summary>
            /// <param name="type" type="String">类型</param>
            /// <param name="fn" type="Function">方法</param>
            /// <returns type="self" />
            return this.removeHandler(type, fn);
        }
        , clearOns: function () {
            /// <summary>为所有进程清除所有事件</summary>
            /// <param name="fn" type="Function">方法</param>
            /// <returns type="self" />
            return this.clearHandlers();
        }
        , push: function (Thread) {
            /// <summary>往进程池添加进程</summary>
            /// <param name="obj" type="Object">进程参数</param>
            /// <param name="Thread" type="paras:[Thread]">计算参数</param>
            /// <returns type="self" />
            //            for (var i = 0, len = arguments.length; i < len; i++)
            //                this.pool.push(arguments[i]);
            this.pool = this.pool.concat([].slice.call(arguments));
            return this;
        }
        , clear: function (index) {
            /// <summary>清除某个进程</summary>
            /// <param name="index" type="Number">下标 缺省为清空最后个</param>
            /// <returns type="self" />
            this.pool.splice(index || this.pool.length - 1, 1);
            return this;
        }
        , get: function (index) {
            /// <summary>获得某个进程</summary>
            /// <param name="index" type="Number">下标 缺省为获得最后个</param>
            /// <returns type="self" />
            this.pool[index || this.pool.length - 1];
            return this;
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

    return $.threadPool = ThreadPool;
});