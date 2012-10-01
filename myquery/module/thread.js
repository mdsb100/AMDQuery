/// <reference path="../myquery.js" />

myQuery.define('module/thread', ["main/customevent", "base/extend", "module/object"], function ($, CustomEvent, extend, object) {
    "use strict"; //启用严格模式

    var requestAnimFrame = window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.oRequestAnimationFrame ||
              window.msRequestAnimationFrame ||
              function (complete, element) {
                  return setTimeout(complete, 13); //其实是1000/60
              }
        , cancelRequestAnimFrame = window.cancelAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            clearTimeout;


    function Thread(obj, paras) {
        /// <summary>创造一个新进程
        /// <para>num obj.delay:延迟多少毫秒</para>
        /// <para>num obj.duration:持续多少毫米</para>
        /// <para>num obj.sleep:睡眠多少豪秒</para>
        /// <para>num obj.interval 如果interval存在 则fps无效 isAnimFram也无效
        /// <para>num obj.fps:每秒多少帧</para>
        /// <para>fun obj.fun:要执行的方法</para>
        /// <para>bol obj.isAnimFram:是否使用新动画函数，使用后将无法初始化fps</para>
        /// <para>可以调用addHandler方法添加事件</para>
        /// <para>事件类型:start、stop、delay、sleepStar,sleepStop</para>
        /// </summary>
        /// <param name="obj" type="Object">属性</param>
        /// <param name="paras" type="paras[]">作用域所用参数</param>
        /// <returns type="Thread" />

        this.init.apply(this, arguments);
        this.render.apply(this, arguments);
    }

    $.easyExtend(Thread, {
        cancelRequestAnimFrame: cancelRequestAnimFrame
        , count: 0

        , fps: 13

        , requestAnimFrame: requestAnimFrame

        , _defaultSetting: {
            runFlag: false,
            forever: false,
            sleepFlag: false,
            power: setTimeout,
            clear: clearTimeout,
            status: "stop",
            args: [],
            tick: 0,
            sleepTime: 0,
            pauseTime: 0,
            sleepId: null,
            begin: null,
            timerId: null,
            fun: function () { },
            interval: null,
            isAnimFrame: true,
            duration: NaN,
            id: ""
        }
    });

    object.inheritProtypeWidthExtend(Thread, CustomEvent);
    $.easyExtend(Thread.prototype, {
        constructor: Thread
        , start: function () {
            /// <summary>启动</summary>
            /// <returns type="self" />
            if (this.runFlag == false) {
                Thread.count += 1;
                this.runFlag = true;
                var self = this;
                if (this.delay > 0) {
                    self.status = "delay";
                    self.trigger("delay", self, { type: "delay" });
                }
                setTimeout(function () {
                    self.status = "start";
                    self.trigger("start", self, { type: "start" });
                    //self.pauseTime += self.delay;

                    self.begin = $.now();
                    self._interval.call(self);
                }, this.delay);
            }
            return this;
        }

        , _interval: function () {
            /// <summary>私有</summary>
            var self = this
            , power = self.power
            , every = function () {
                if (self.runFlag === false || (self.tick >= self.duration && !self.forever)) {
                    return self.stop();
                }
                if (self.sleepFlag) {
                    self.sleep();
                    return;
                }
                self.status = "run";

                self.tick = $.now() - self.begin - self.pauseTime;

                self.forever ? self._run.call(self, self.tick, self.fps) : self._run.call(self, self.tick, self.duration);
                var power = self.power;
                self.timerId = power(every, self.fps);
            };

            every();
        }

        , _run: function (step, duration) {
            /// <summary>私有</summary>
            //if (this.sleepTime > 0) return;
            //this.status = "run";
            this._executor(step, duration);
        }

        , resume: function () {
            /// <summary>唤醒进程</summary>
            /// <param name="time" type="Number">毫秒</param>
            /// <returns type="Thread" />
            if (this.isSleep()) {
                var n = $.now();
                this.pauseTime += n - (this.sleepBeginTime || 0);
                this.sleepStopTime = n;
                this.status = "run"
                this.sleepFlag = false;
                this.trigger("sleepStop", this, { type: "sleepStop" });
                this._interval();
            }
            return this;
        }

        , stop: function () {
            /// <summary>停止进程</summary>
            /// <returns type="self" />
            if (this.runFlag == true) {
                this.tick = this.sleepTime = this.pauseTime = 0;
                this.sleepBeginTime = null;
                this.sleepId = null;
                this.begin = null;
                this.status = "stop";
                Thread.count -= 1;
                this.runFlag = false;
                var clear = this.clear;
                clear(this.timerId);
                this.trigger("stop", this, { type: "stop" });
            }
            return this;
        }

        , init: function (obj, paras) {
            /// <summary>初始化参数 初始化参数会停止进程</summary>
            /// <param name="obj" type="Object">进程参数</param>
            /// <param name="paras" type="paras:[any]">计算参数</param>
            /// <returns type="self" />
            this.stop();
            CustomEvent.call(this);
            $.extend(this, Thread._defaultSetting, obj);
            this.id = this.id || $.now();
            this.args = $.argToArray(arguments, 1);

            return this;
        }
        , render: function () {
            return this.setFps()
            .setDuration(this.duration);
        }

        , _executor: function (a, b) {
            /// <summary>内部</summary>
            this.fun.apply(this, [a, b].concat(this.args)) === false && this.stop();
        }

        , isRun: function () {
            /// <summary>是否在运行</summary>
            /// <returns type="Boolean" />
            return this.runFlag;
        }
        , isSleep: function () {
            /// <summary>是否在睡眠</summary>
            /// <returns type="Boolean" />
            return this.status == "sleep"; //(this.sleepFlag && this.sleepTime > 0);
        }

        , getDely: function () {
            /// <summary>获得延迟启动时间</summary>
            /// <returns type="Number" />
            return this.dely;
        }
        , setDely: function (delay) {
            /// <summary>设置延迟启动时间</summary>
            /// <param name="time" type="Number">毫秒</param>
            /// <returns type="self" />
            this.delay = delay || this.delay || 0;
            return this;
        }

        , setDuration: function (duration) {
            /// <summary>设置持续时间</summary>
            /// <param name="time" type="Number">毫秒</param>
            /// <returns type="self" />
            var status = this.getStatus();
            this.stop();
            if (duration == undefined || duration == NaN || (typeof duration == "number" && duration > 0)) {
                //this.duration = o.duration;
                this.forever = false;
            }
            else {
                this.duration = NaN;
                this.forever = true;
            }
            status == "run" && this.start();
            return this;
        }
        , getDuration: function () {
            /// <summary>获得持续时间</summary>
            /// <para>NaN表示无限</para>
            /// <returns type="Number" />
            return this.duration;
        }
        , setFps: function () {
            /// <summary>设置帧值</summary>
            /// <param name="o" type="Object">数值</param>
            /// <returns type="Number" />
            var status = this.getStatus();
            this.stop();

            if (this.interval == null && this.isAnimFrame == true) {
                this.power = requestAnimFrame;
                this.clear = cancelRequestAnimFrame;
                this.fps = Thread.fps;
            }
            else {
                this.power = setTimeout;
                this.clear = clearTimeout;
                this.fps = this.interval || (1000 / this.fps) || Thread.fps;
            }

            this.fps = Math.round(this.fps);

            status == "run" && this.start();
            return this;
        }
        , getFps: function () {
            /// <summary>获得帧值</summary>
            /// <returns type="Number" />
            return this.fps;
        }
        , getPercent: function () {
            /// <summary>获得百分比进度</summary>
            /// <para>返回值是NaN时说明duration是0并且是永远运行的</para>
            /// <returns type="Number" />
            var percent = parseInt(this.tick / this.duration * 100) / 100;
            return percent != NaN ? Math.min(1, percent) : percent;
        }

        , getStatus: function () {
            /// <summary>获得运行状态</summary>
            /// <para>"delay"</para>
            /// <para>"start"</para>
            /// <para>"sleep"</para>
            /// <para>"stop"</para>
            /// <para>"run"</para>
            /// <returns type="String" />
            return this.status;
        }
        , getTick: function () {
            /// <summary>获得时值</summary>
            /// <returns type="Number" />
            return this.tick;
        }

        , getPauseTime: function () {
            /// <summary>获得暂停的时间值</summary>
            /// <returns type="Number" />
            return this.pauseTime;
        }
        , setSleepTime: function (sleepTime) {
            /// <summary>设置睡眠时间</summary>
            /// <param name="sleepTime" type="Number">毫秒</param>
            /// <returns type="self" />
            if (sleepTime) {
                this.sleepTime = sleepTime;
                this.sleepFlag = true;
            }
            return this;
        }
        , getSleepTime: function (isCount) {
            /// <summary>获得当前睡眠时间值</summary>
            /// <returns type="Number" />
            return this.sleepTime;
        }
        , sleep: function (sleeTime) {
            /// <summary>设置睡眠时间 只有在非睡眠时间有用</summary>
            /// <param name="sleepTime" type="Number">毫秒</param>
            /// <param name="time" type="Number">毫秒</param>
            /// <returns type="self" />
            var status = this.getStatus();
            if (sleeTime) {
                return this.setSleepTime(sleeTime);
            }
            if (this.sleepTime == 0) {
                return this;
            }
            this.status = "sleep";
            this.trigger("sleepBegin", self, { type: "sleepBegin" });
            var self = this;
            clearTimeout(this.sleepId);
            this.sleepBeginTime = $.now();
            self.sleepId = setTimeout(function () {
                self.sleepId && self.resume();
            }, self.sleepTime);

            return this;
        }
    });

    return $.thread = Thread;
});