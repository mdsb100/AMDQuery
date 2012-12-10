/// <reference path="../../myquery.js" />
myQuery.define("ui/js/scrollableview", ["main/query",
                    "main/dom",
                    "ui/js/swappable",
                    "ui/js/draggable",
                    "module/Widget",
                    "module/animate",
                    "module/tween.extend"], function ($, query, dom, swappable, draggable, Widget, animate, tween, undefined) {
    var eventFuns = $.event.document,
        scrollableview = $.widget("ui.scrollableview", function scrollableview(obj, target) {
            this.__super(obj, target).init(obj || {}, target).create().render(0, 0);
        }, {
            container: null,
            create: function () {
                var opt = this.options;
                this.positionParent = $({
                    "overflow": "visible"
                }, "div").width(this.target.width()).height(this.target.height()).append(this.target.child());

                this.container = $({
                    "position": "absolute"
                }, "div").append(this.positionParent).appendTo(this.target);

                this.target.swappable({
                    disabled: opt.disabled
                })

                this.container.draggable({
                    keepinner: 0,
                    axis: opt.overflow,
                    disabled: opt.disabled,
                    stopPropagation: false
                })

                this.able();

                return this;
            },
            customEventName: ["start", "move", "stop"],
            event: function () {


            },
            enable: function () {
                var event = this.event;
                this.container.on("drag.move", event);
                this.target.on("swap.stop", event).touchwheel(event);
            },
            disable: function () {
                this.container.off("drag.move", event);
                this.target.off("swap.stop", event).off("touchwheel", event);
            },
            _initHandler: function () {
                var self = this,
                    target = self.target,
                    opt = self.options;
                this.event = function (e) {
                    switch (e.type) {
                    case "drag.move":
                        //e.offsetX = 0;
                        break;
                    case "swap.stop":
                        self.animate(e);
                        break;
                    case "mousewheel":
                    case "DOMMouseScroll":
                        clearTimeout(self.wheelTimeId);
                        var x = null,
                            y = null;
                            //timeStamp = e.timeStamp || new Date(),
                            //timeout;
                        if (e.direction == "x") {
                            x = e.delta * opt.mouseWheelAccuracy;
                        } else if (e.direction == "y") {
                            y = e.delta * opt.mouseWheelAccuracy;
                        };
                        // console.log(e)
                        // //console.log(e.timeStamp - self.timeStamp);
                        // timeout = timeStamp - self.timeStamp + 5;
                        // timeout = timeout < 20 ? 20 : timeout;
                        // self.timeStamp = timeStamp;
                        // console.log(timeout);
                        self.render(x, y, true, 0);
                        
                        // self.wheelTimeId = setTimeout(function(){
                        //     console.log("inner");
                        //     self
                        //     .toXBoundary(self.container.offsetL())
                        //     .toYBoundary(self.container.offsetT());
                        // }, timeout);
                        break;
                    }
                }
                return this;
            },
            destory: function () {

            },
            init: function (obj) {
                this.option(obj);
                this.originOverflow = this.target.css("overflow");
                this.refreshPosition();
                //this.timeStamp = new Date();
                //this.wheelTimeId = null;
                this._initHandler()
                this.target.css("overflow", "hidden");

                return this;
            },
            options: {
                "overflow": "xy",
                "animateDuration": 600,
                "boundary": 150,
                "boundaryDruation": 300,
                "isTransform3d": 0,
                "mouseWheelAccuracy": 0.5
            },
            public: {
                "refreshPosition": 1
            },
            isTransform3d: function () {
                return this.options.isTransform3d && $.support.transform3d;
            },
            render: function (x, y, addtion, boundary) {
                var originX = 0,
                    originY = 0;
                if (this.isTransform3d()) {

                } else {
                    if (addtion) {
                        originX = this.container.offsetL();
                        originY = this.container.offsetT();
                    };
                    if (x !== null && this._isAllowedDirection("x")) {
                        x = this.checkXBoundary(originX + x, boundary);
                        this.container.offsetL(x);
                    } else if (y !== null && this._isAllowedDirection("y")) {
                        y = this.checkXBoundary(originY + y, boundary);
                        this.container.offsetT(y);
                    }
                }
                return this;
            },
            target: null,
            toString: function () {
                return "ui.scrollableview";
            },
            widgetEventPrefix: "scrollableview",

            refreshPosition: function () {
                this.scrollHeight = this.target.scrollHeight();
                this.scrollWidth = this.target.scrollWidth();
                this.viewportHeight = this.target.width();
                this.viewportWidth = this.target.height();
                this.overflowHeight = this.scrollHeight - this.viewportHeight;
                this.overflowWidth = this.scrollWidth - this.viewportWidth;

                return this;
            },
            // , resize: function(){ 
            //     this.container.width(this.scrollWidth);
            //     this.container.height(this.scrollHeight);
            // }
            _isAllowedDirection: function (direction) {
                return this.options.overflow.indexOf(direction) > -1;
            },
            getTop: function () {
                return this.isTransform3d() ? 0 : this.container.offsetT();
            },
            getLeft: function () {
                return this.isTransform3d() ? 0 : this.container.offsetT();
            },
            //专门换算个方法
            animate: function (e) {
                var opt = this.options,
                    a0 = e.acceleration,
                    t0 = opt.animateDuration - e.duration,
                    s0 = Math.round(a0 * t0 * t0 * 0.5);
                //v0 = a0 * t0,
                // t1 = Math.ceil(a0 / a1), //duration * （1 - weight),
                // s1 = v0 * t1 - a1 * t1 * t1 * 0.5,
                // Ssum =Math.round(s0 + s1);
                console.log(t0)
                console.log(s0)
                console.log(a0)
                if (t0 <= 0) {
                    this.toYBoundary(this.getTop()).toXBoundary(this.getLeft());
                    return this;
                };

                switch (e.direction) {
                case 3:
                    this.toX(-s0, t0);
                    break;
                case 9:
                    this.toX(s0, t0);
                    break;
                case 6:
                    this.toY(-s0, t0);
                    break;
                case 12:
                    this.toY(s0, t0);
                    break;
                default:
                    this.toXBoundary(this.getTop()).toYBoundary(this.getLeft());
                }

                return this;
            },

            checkXBoundary: function (s, boundary) {
                var boundary = boundary !== undefined ? boundary : this.options.boundary;
                return $.between(-(this.overflowWidth + boundary), boundary, s);
            },
            checkYBoundary: function (s, boundary) {
                var boundary = boundary !== undefined ? boundary : this.options.boundary;
                return $.between(-(this.overflowHeight + boundary), boundary, s);
            },

            outerXBoundary: function (t) {
                if (t > 0) {
                    return 0;
                } else if (t < -this.overflowWidth) {
                    return -this.overflowWidth;
                }
                return null;
            },

            outerYBoundary: function (t) {
                if (t > 0) {
                    return 0;
                } else if (t < -this.overflowHeight) {
                    return -this.overflowHeight;
                }
                return null;
            },

            toXBoundary: function (left) {
                var outer = this.outerXBoundary(left);
                if (outer !== null) {
                    this.container.animate({
                        left: outer + "px"
                    }, {
                        duration: this.options.boundaryDruation,
                        easing: "expo.easeOut",
                        queue: false
                    });
                };
                return this;
            },

            toYBoundary: function (top) {
                var outer = this.outerYBoundary(top);
                if (outer !== null) {
                    this.container.animate({
                        top: outer + "px"
                    }, {
                        duration: this.options.boundaryDruation,
                        easing: "expo.easeOut",
                        queue: false
                    });
                };
                return this;
            },

            toX: function (s, t) {
                if (!this._isAllowedDirection("x")) {
                    return this;
                }
                var
                self = this,
                    opt = this.options,
                    boundary = opt.boundary,
                    left = this.checkXBoundary(this.container.offsetL() - s);
                this.toXBoundary(this.getTop());
                this.container.animate({
                    left: left + "px"
                }, {
                    duration: t,
                    easing: "easeOut",
                    complete: function () {
                        self.toXBoundary(left);
                    }
                });

                return this;
            },
            toY: function (s, t) {
                if (!this._isAllowedDirection("y")) {
                    return this;
                }
                var
                self = this,
                    opt = this.options,
                    boundary = opt.boundary,
                    top = this.checkYBoundary(this.container.offsetT() - s);
                this.toXBoundary(this.getLeft());
                this.container.animate({
                    top: top + "px"
                }, {
                    duration: t,
                    easing: "easeOut",
                    complete: function () {
                        self.toYBoundary(top);
                    }
                });

                return this;
            }
        });

    //提供注释
    $.fn.scrollableview = function (a, b, c, args) {
        /// <summary>使对象的第一元素可以拖动
        /// <para>bol obj.disabled:事件是否可用</para>
        /// <para>num obj.axis:"x"表示横轴移动;"y"表示纵轴移动;缺省或其他值为2轴</para>
        /// <para>num obj.second:秒数</para>
        /// <para>fun obj.dragstar:拖动开始</para>
        /// <para>fun obj.dragmove:拖动时</para>
        /// <para>fun obj.dragstop:拖动结束</para>
        /// </summary>
        /// <param name="a" type="Object/String">初始化obj或属性名:option或方法名</param>
        /// <param name="b" type="String/null">属性option子属性名</param>
        /// <param name="c" type="any">属性option子属性名的值</param>
        /// <param name="args" type="any">在调用方法的时候，后面是方法的参数</param>
        /// <returns type="$" />
        scrollableview.apply(this, arguments);
        return this;
    }

    return scrollableview;
});