/// <reference path="../myquery.js" />
/*include JQuery animate*/

myQuery.define("module/FX", ["main/dom", "module/object"], function($, dom, object, undefined) {
    "use strict"; //启用严格模式
    var rfxnum = /^([+-]=)?([\d+-.]+)(.*)$/;

    var FX = object.extend("FX", {
        start: function() {

            FX.timers.push(this);
            this.startTime = $.now();

            FX.tick();
        },
        init: function(ele, options, value, name) {
            this.ele = ele;
            this.options = options;
            this.easing = options.easing;
            this.delay = options.delay || 0;
            this.duration = options.duration;
            this.name = name;
            //this.isComplete = isComplete == undefined ? 1 : isComplete;
            var ret = this.getStartEnd(value);
            this.from = ret.start;
            this.end = ret.end;
            this.unit = ret.unit;
            this.percent = 0;
            options.isStart && this.start();

            return this;
        },
        cur: function() {
            return FX.cur(this.ele, this.name);
        },
        constructor: FX

        ,
        getPercent: function() {
            return parseInt((this.percent || 0) * 100) / 100;
        },
        getStartEnd: function(val) {
            return FX.getStartEnd.call(this, val, this.ele, this.name);
        },

        specialUnit: function(start, end, unit) {
            return FX.specialUnit(start, end, unit, this.ele, this.name);
        },
        step: function(goToEnd) {
            var pauseTime;
            if (!$.isBol(goToEnd)) {
                pauseTime = goToEnd || 0;
            }
            var t = $.now() - pauseTime,
                opt = this.options;

            if (goToEnd === true || t > this.startTime + this.delay + this.duration) {
                //this.tick = opt.duration;
                this.nowPos = this.end;
                //opt.curCount -= 1;
                this.update();
                if (--opt.curCount <= 0) {
                    if (this.options.display != null) {
                        // Reset the overflow
                        this.ele.style.overflow = opt.overflow;

                        this.ele.style.display = opt.display;

                        if (this.ele.display === "none") {
                            this.ele.style.display = "block";
                        }
                    }
                    FX.invokeCompelete(opt.complete, this.ele, opt);
                }
                this.stop();
            } else {
                var n = t - this.startTime,
                    pos;
                if (n > this.delay) {
                    pos = this.easing(n - this.delay, 0, 1, this.duration);
                    this.percent = pos;
                    this.nowPos = this.from + ((this.end - this.from) * pos);
                    this.update();
                }
            }
        },
        stop: function() {
            var index = $.inArray(FX.timers, this);
            index > -1 && FX.timers.splice(index, 1);
        }

        ,
        update: function(nowPos) {
            nowPos = nowPos == undefined ? this.nowPos.toFixed(2) : nowPos;
            switch (this.name) {
                case "opacity":
                    return $.setOpacity(this.ele, nowPos);
                    break;
                default:
                    this.ele.style[this.name] = nowPos + this.unit;
            }
        }

        ,
        isInDelay: function() {
            return new Date() - this.startTime < this.delay;
        }
    }, {
        invokeCompelete: function(completes, context, opt) {
            for (var i = completes.length-1; i >= 0; i--) {
                completes[i].call(context, opt);
            }
        },
        speeds: function(type) {
            switch (type) {
                case "slow":
                    type = 600;
                    break
                case "fast":
                    type = 200;
                    break
                case "normal":
                default:
                    type = 400;
            }
            return type;
        },

        custom: {},

        cur: function(ele, name) {
            //var ele = this.ele;

            if (ele[name] != null && (!ele.style || ele.style[name] == null)) {
                return ele[name];
            }
            var r;
            if (name == "width" || name == "height") {
                r = name == "width" ? $.getInnerW(ele) : $.getInnerH(ele);
            } else if (name == "opacity") {
                r = $.getOpacity(ele);
            } else {
                r = parseFloat($.css(ele, name));
            }
            r = r && r > -10000 ? r : parseFloat($.curCss(ele, name)) || 0;
            return r !== "auto" ? r : 0;
        },

        getDelay: function(d) {
            if ($.isStr(d)) {
                delay = FX.speeds(d);
            } else if ($.isNul(d) || !$.isNum(d)) {
                d = 0;
            }
            return d;
        },
        getDuration: function(d) {
            if ($.isNul(d) || !$.isNum(d)) {
                d = FX.speeds(d);
            }
            return d;
        },
        getStartEnd: function(val, ele, name) {
            var parts = rfxnum.exec(val),
                start = this.cur(ele, name),
                end = val,
                unit = "";

            if (parts) {
                var end = parseFloat(parts[2])
                unit = parts[3]; //|| "px"
                //this.unit = unit;

                if (unit !== "" && unit !== "px" && unit !== "deg") {
                    start = this.specialUnit(start, end, unit, ele, name);
                }

                if (parts[1]) {
                    end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
                }
            }
            return {
                start: start,
                end: end,
                unit: unit
            };
        },

        specialUnit: function(start, end, unit, ele, name) {
            ele.style[name] = (end || 1) + unit; //?
            start = ((end || 1) / FX.cur(ele, name)) * start;
            ele.style[name] = start + unit;
            return start;
        },
        stop: function() {},

        timers: [],

        tick: function() {}
    });

    return $.fx = FX;
});