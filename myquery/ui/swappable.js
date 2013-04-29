myQuery.define("ui/swappable", ["base/client", "main/event", "module/math", "module/Widget"], function ($, client, event, math, Widget, undefined) {
    "use strict"; //启用严格模式 
    var swappable = Widget.extend("ui.swappable", {
        container: null,
        create: function () {
            this._initHandler();
            this.enable();
            this.render();
            return this;
        },
        event: function () {

        },
        enable: function () {
            var fun = this.event;
            this.disable();
            this.target.on('mousemove', fun).on('mousedown', fun);
            $(document).on('mouseup', fun);
            this.options.disabled = true;
            return this;
        },
        disable: function () {
            var fun = this.event;
            this.target.off('mousemove', fun).off('mousedown', fun);
            //event.document.off(window, 'scroll', fun);
            $(document).off('mouseup', fun);
            this.options.disabled = false;
            return this;
        },
        computeSwapType: function (swapTypeName) {
            var path = this.path,
                swaptype = undefined;

            ///先用简单实现
            ///这里去计算path 最后返回如: "LeftToRight","Linear","Cicrle" 多元线性回归;
            return swaptype;
        },  
        getPara: function (para, time, range, x1, y1, x2, y2) {
            var diff = (new Date()) - time;
            para.distance = Math.round(math.distance(x1, y1, x2, y2));
            para.speed = Math.round(math.speed(para.distance, diff) * 1000);

            para.angle = Math.round(math.radianToDegree(math.angle(x1, y1, x2, y2)) * 10) / 10;
            para.direction = math.direction(para.angle, range);

            para.acceleration  = math.acceleration(para.distance, diff);
            para.duration = diff;

            if (this.path.length < 5 && this.path.length > 2) {
                para.currentAngle = para.angle;
                para.currentDirection = para.direction;
            }

            return para;
        },
        getPath: function (index) {
            if (index === undefined) {
                return this.path;
            }
            index *= 2
            return [this.path[index], this.path[index + 1]];
        },
        getPathLast: function () {
            return this.getPath(this.path.length / 2 - 1);
        },
        isInPath: function (x, y) {
            for (var path = this.path, i = this.path.length - 1, item; i >= 0; i -= 2)
                if (path[i] === x && path[i + 1] === y) return i;
            return -1;
        },
        init: function (opt, target) {
            this._super(opt, target);
            this.path = [];
            this.isDown = false;
            this.startY = null;
            this.startX = null;
            return this.create();
        },
        customEventName: ["start", "move", "pause", "stop", "mousemove"],
        options: {
            cursor: "pointer",
            directionRange: 15,
            pauseSensitivity: 500
        },
        publics: {
            isInPath: Widget.AllowReturn,
            getPath: Widget.AllowReturn,
            getPathLast: Widget.AllowReturn
        },
        _initHandler: function () {
            var self = this,
                target = self.target,
                opt = self.options,
                time, timeout, lastEvent; //IE和绑定顺序有关？找不到startX值？
            this.event = function (e) {
                //event.document.stopPropagation(e);
                var left = target.getLeft(),
                    top = target.getTop(),
                    temp, x = (e.pageX || e.clientX) - left,
                    y = (e.pageY || e.clientY) - top,
                    para;
                if (self.isDown || e.type == "mousedown" || e.type == "touchstart") {
                    para = {
                        type: self.getEventName("start"),
                        offsetX: x,
                        offsetY: y,
                        event: e,
                        speed: 0,
                        target: this,
                        startX: self.startX,
                        startY: self.startY,
                        path: self.path,
                        swapType: undefined,
                        angle: undefined,
                        direction: undefined,
                        distance: undefined,
                        duration: undefined,
                        currentAngle: undefined,
                        currentDirection: undefined
                    };
                } else {
                    para = {
                        offsetX: x,
                        offsetY: y,
                        event: e,
                        target: this,
                        startX: self.startX,
                        startY: self.startY
                    };
                }

                switch (e.type) {
                    case "mousedown":
                        if (!client.system.mobile) event.event.document.preventDefault(e);
                    case "touchstart":
                        //event.document.stopPropagation(e);
                        if (!self.isDown) {
                            self.isDown = true;
                            para.startX = self.startX = x;
                            para.startY = self.startY = y;
                            time = new Date();
                            self.path = [];
                            self.path.push(x, y);
                            lastEvent = null;
                            target.trigger(para.type, target[0], para);
                        }
                        break;
                    case "mousemove":
                        //event.document.stopPropagation(e);
                        if (e.which === 0 || (client.browser.ie678 && e.button != 1) || self.isDown == false) {
                            self.isDown = false;
                            para.type = self.getEventName("mousemove");
                            target.trigger(para.type, target[0], para);
                            break;
                        }

                    case "touchmove":
                        //event.document.preventDefault(e);
                        if (self.isDown) {
                            temp = self.getPathLast();
                            if (temp[0] === x && temp[1] === y) break;
                            self.path.push(x, y);
                            self.getPara(para, time, opt.directionRange, self.startX, self.startY, x, y);
                            para.type = self.getEventName("move");
                            target.trigger(para.type, target[0], para);
                            //if (!$.isMobile) {
                            clearTimeout(timeout);
                            timeout = setTimeout(function () {
                                para.type = self.getEventName("pause");
                                para.swapType = self.computeSwapType()
                                target.trigger(para.type, target[0], para);
                            }, opt.pauseSensitivity)
                            //}
                            lastEvent = e;
                        }
                        break;
                    case "touchend":
                        if (lastEvent && self.isDown) {
                            para.offsetX = x = (lastEvent.pageX || lastEvent.clientX) - target.getLeft();
                            para.offsetY = y = (lastEvent.pageY || lastEvent.clientY) - target.getTop();
                        }
                    case "mouseup":
                        if (self.isDown) {
                            //event.document.preventDefault(e);
                            //event.document.stopPropagation(e);
                            self.isDown = false;
                            if (!lastEvent && !client.browser.ie678) break;
                            clearTimeout(timeout);

                            self.getPara(para, time, opt.directionRange, self.startX, self.startY, $.between(0, target.width(), x), $.between(0, target.height(), y));
                            para.type = self.getEventName("stop");
                            para.swapType = self.computeSwapType();
                            target.trigger(para.type, target[0], para);
                            self.startX = undefined;
                            self.startY = undefined;
                        }
                        break;

                }
            };
        },
        render: function () {
            var opt = this.options
            this.target.css({
                cursor: opt.cursor
            });
            return this;
        },
        target: null,
        toString: function () {
            return "ui.swappable";
        },
        widgetEventPrefix: "swap"
    });

    //提供注释
    $.fn.swappable = function (a, b, c, args) {
        /// <summary>使其滑动
        /// <para>bol obj.disabled:事件是否可用</para>
        /// <para>num obj.pauseSensitivity:捕捉的灵敏度 缺省500毫秒</para>
        /// <para>num obj.判断方向的区间范围:小于等于22.5大于0</para>
        /// <para>fun obj.swapstart:滑动开始</para>
        /// <para>fun obj.swapmove:滑动时</para>
        /// <para>fun obj.swappause:滑动暂停</para>
        /// <para>fun obj.swapstop:滑动结束</para>
        /// <para>返回的event:</para>
        /// <para>{ type: 'swapstart', offsetX: x, offsetY: y, event: e</para>
        /// <para>, speed: 0, target: this, startX: self.startX, startY: self.startY</para>
        /// <para>, path: self.path, swapType: undefined</para>
        /// <para>, angle: undefined,direction: undefined, distance: undefined</para>
        /// <para>, currentAngle: undefined, currentDirection: undefined</para>
        /// <para>}</para>
        /// </summary>
        /// <param name="a" type="Object/String">初始化obj或属性名:option或方法名</param>
        /// <param name="b" type="String/null">属性option子属性名</param>
        /// <param name="c" type="any">属性option子属性名的值</param>
        /// <param name="args" type="any">在调用方法的时候，后面是方法的参数</param>
        /// <returns type="$" />
        return swappable.apply(this, arguments);
    }

    return swappable;
});