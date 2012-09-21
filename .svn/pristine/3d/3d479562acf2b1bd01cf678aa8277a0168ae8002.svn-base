myQuery.define("module/threadpool", ["module/thread"], function ($, undefined) {
    "use strict"; //启用严格模式
    function ThreadPool() {
        this.pool = [];
        this.push(arguments);
    };

    ThreadPool.prototype = {
        push: function (Thread) {
            /// <summary>往进程池添加进程</summary>
            /// <param name="obj" type="Object">进程参数</param>
            /// <param name="Thread" type="paras:[Thread]">计算参数</param>
            /// <returns type="self" />
            //            for (var i = 0, len = arguments.length; i < len; i++)
            //                this.pool.push(arguments[i]);
            this.pool.concat([].slice.call(arguments));
            return this;
        }
        , clear: function (index) {
            /// <summary>清除某个进程</summary>
            /// <param name="index" type="Number">下标 缺省为清空最后个</param>
            /// <returns type="self" />
            this.pool.splice(index || this.pool.length - 1, 1);
            return this;
        }
        , constructor: ThreadPool
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
            for (var i = 0, pool = this.pool, item; item = pool[i++]; )
                item.start();
            return this
        }
        , sleep: function (time) {
            /// <summary>全部睡眠</summary>
            /// <param name="time" type="Number">睡眠时间</param>
            /// <returns type="self" />
            for (var i = 0, pool = this.pool, item; item = pool[i++]; )
                item.sleep(time);
        }
        , resume: function () {
            /// <summary>全部唤醒</summary>
            /// <returns type="self" />
            for (var i = 0, pool = this.pool, item; item = pool[i++]; )
                item.resume();
        }
        , stop: function () {
            /// <summary>全部停止</summary>
            /// <returns type="self" />
            for (var i = 0, pool = this.pool, item; item = pool[i++]; )
                item.stop();
        }
    };

    return $.threadPool = ThreadPool;

});