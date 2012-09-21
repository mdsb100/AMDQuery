﻿/// <reference path="../myquery.js" />

myQuery.define("html5/worker", function ($, undefined) {
    "use strict"; //启用严格模式
    if (window.Worker) {
        //        var Worker = function () {
        //            this.worker = new window.Woker($.getPath("html5/_worker"));
        //        }

        //        Worker.prototype = {
        //            constructor: Worker
        //            , addHandler: function (type, fun) {
        //                /// <summary>添加worker事件</summary>
        //                /// <param name="type" type="String">事件名</param>
        //                /// <param name="fun" type="Function">方法</param>
        //                /// <returns type="self" />
        //                this.worker.addEventListener(typ, fun, false);
        //                return this;
        //            }

        //            , onError: function (fun) {
        //                /// <summary>添加error事件</summary>
        //                /// <param name="fun" type="Function">方法</param>
        //                /// <returns type="self" />
        //                return this.addHandler("error", fun);
        //            }
        //            , onMessage: function (fun) {
        //                /// <summary>添加获得数据事件</summary>
        //                /// <param name="fun" type="Function">方法</param>
        //                /// <returns type="self" />
        //                return this.addHandler("message", fun);
        //            }

        //            , postMessage: function (todo, paras, context) {
        //                /// <summary>发送计算函数</summary>
        //                /// <param name="todo" type="Function">方法</param>
        //                /// <param name="paras" type="Array">参数</param>
        //                /// <param name="context" type="Object">作用域</param>
        //                /// <returns type="self" />
        //                this.worker.postMessage({
        //                    todo: todo.toString()
        //                    , paras: paras || []
        //                    , context: context || window
        //                });
        //                return this;
        //            }
        //};
        return {
            worker: new window.Worker($.getPath("html5/_worker"))
            , addHandler: function (type, fun) {
                /// <summary>添加worker事件</summary>
                /// <param name="type" type="String">事件名</param>
                /// <param name="fun" type="Function">方法</param>
                /// <returns type="self" />
                this.worker.addEventListener(type, fun, false);
                return this;
            }

            , onError: function (fun) {
                /// <summary>添加error事件</summary>
                /// <param name="fun" type="Function">方法</param>
                /// <returns type="self" />
                return this.addHandler("error", fun);
            }
            , onMessage: function (fun) {
                /// <summary>添加获得数据事件</summary>
                /// <param name="fun" type="Function">方法</param>
                /// <returns type="self" />
                return this.addHandler("message", fun);
            }

            , postMessage: function (todo, paras, context) {
                /// <summary>发送计算函数</summary>
                /// <param name="todo" type="Function">方法</param>
                /// <param name="paras" type="Array">参数</param>
                /// <param name="context" type="Object">作用域</param>
                /// <returns type="self" />
                this.worker.postMessage({
                    todo: todo.toString()
                    , paras: paras || []
                    , context: context || window
                });
                return this;
            }
           , terminate: function () {
               this.worker.terminate();
               return this;
           }
        };
    }
    return 0;
});
