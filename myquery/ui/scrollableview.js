myQuery.define("ui/scrollableview", ["main/query", "main/dom", "main/class", "html5/css3", "html5/animate.transform", "html5/css3.transition.animate", "ui/swappable", "ui/draggable", "module/src", "module/Widget", "module/animate", "module/tween.extend"], function($, query, dom, cls, cls3, animateTransform, cls3Transition, swappable, draggable, src, Widget, animate, tween, undefined) {
    "use strict"; //启用严格模式
    src.link({
        href: $.getPath("ui/css/scrollableview", ".css")
    });
    var transitionToAnimation = !! $.config.module.transitionToAnimation,
        scrollableview = Widget.extend("ui.scrollableview", {
            container: null,
            create: function() {
                var opt = this.options;
                this.positionParent = $({
                    "overflow": "visible"
                }, "div").width(this.target.width()).height(this.target.height()).append(this.target.child());

                this.container = $({
                    "position": "absolute"
                }, "div").append(this.positionParent).appendTo(this.target);

                this.target.swappable();

                this.statusBarX = $({
                    height: "10px",
                    display: "none",
                    position: "absolute",
                    bottom: "0px"
                }, "div").addClass("scrollableViewStatusBar").appendTo(this.target);

                this.statusBarY = $({
                    width: "10px",
                    display: "none",
                    position: "absolute",
                    right: "0px"
                }, "div").addClass("scrollableViewStatusBar").appendTo(this.target);

                this.container.draggable({
                    keepinner: 0,
                    axis: opt.overflow,
                    stopPropagation: false,
                    axisx: this._isAllowedDirection("x"),
                    axisy: this._isAllowedDirection("y"),
                    isTransform3d: opt.isTransform3d,
                    container: this.target,
                    overflow: true
                });

                this.refreshPosition();

                this.isTransform3d() && this.container.initTransform3d();

                return this;
            },
            event: function() {


            },
            enable: function() {
                var event = this.event;
                this.container.on("DomNodeInserted DomNodeRemoved drag.pause drag.move drag.start", event);
                this.target.on("swap.move swap.stop swap.pause", event).touchwheel(event);
                // this.container.draggable("enable");
                // this.target.swappable("enable");
                this.options.disabled = true;
                return this;
            },
            disable: function() {
                var event = this.event;
                this.container.off("DomNodeInserted DomNodeRemoved drag.pause drag.move drag.start", event);
                this.target.off("swap.move swap.stop swap.pause", event).off("touchwheel", event);
                // this.container.draggable("disable");
                // this.target.swappable("disable");
                this.options.disabled = false;
                return this;
            },
            _initHandler: function() {
                var self = this,
                    target = self.target,
                    opt = self.options,
                    check = function() {
                        self.toXBoundary(self.getLeft()).toYBoundary(self.getTop()).hideStatusBar();
                    };

                this.event = function(e) {
                    switch (e.type) {
                        case "drag.move":
                            var x = self.checkXBoundary(e.offsetX, opt.boundary),
                                y = self.checkYBoundary(e.offsetY, opt.boundary);
                            self.renderStatusBar(self.checkXStatusBar(x), self.checkYStatusBar(y));
                            break;
                        case "drag.pause":
                            var left = self.getLeft(),
                                top = self.getTop(),
                                distance = opt.pullDistance;

                            if (left > distance) {
                                e.type = self.getEventName("pullleft");
                                target.trigger(e.type, this, e);
                            } else if (left < -self.overflowWidth - distance) {
                                e.type = self.getEventName("pullright");
                                target.trigger(e.type, this, e);
                            }
                            if (top > distance) {
                                e.type = self.getEventName("pulldown");
                                target.trigger(e.type, this, e);
                            } else if (top < -self.overflowHeight - distance) {
                                e.type = self.getEventName("pullup");
                                target.trigger(e.type, this, e);
                            }

                            break;
                        case "drag.start":
                            self.showStatusBar();
                            self.refreshPosition();
                            break;
                        case "DomNodeInserted":
                        case "DomNodeRemoved":
                            self.refreshPosition().toYBoundary(self.getTop()).toXBoundary(self.getLeft());
                            break;
                        case "swap.move":
                            self.showStatusBar();
                            break;
                        case "swap.stop":
                            self.animate(e);
                            break;
                        case "swap.pause":
                            self.pause(e);
                            break;
                        case "mousewheel":
                        case "DOMMouseScroll":
                            clearTimeout(self.wheelTimeId);
                            self.refreshPosition();
                            var x = null,
                                y = null;
                            if (e.direction == "x") {
                                x = e.delta * opt.mouseWheelAccuracy;
                            } else if (e.direction == "y") {
                                y = e.delta * opt.mouseWheelAccuracy;
                            };
                            self.showStatusBar();

                            self.wheelTimeId = setTimeout(check, 500);

                            self.render(x, y, true, opt.boundary);
                            break;
                    }
                }
                return this;
            },
            destory: function(key) {
                if (key) {
                    this.target.swappable("destory");
                    this.container.draggable("destory");
                    this.target.child().remove();
                    this.positionParent.child().appendTo(this.target);
                    Widget.invoke("destory", this, key);
                }
            },
            init: function(opt, target) {
                this._super(opt, target);

                this.originOverflow = this.target.css("overflow");

                this.target.attr("myquery-ui", "scrollableview");
                this.target.css({
                    "overflow": "hidden",
                    /*fix ie*/
                    "overflow-x": "hidden",
                    "overflow-y": "hidden"
                });

                var pos = this.target.css("position");
                if (pos != "relative" && pos != "absolute") {
                    this.target.css("position", "relative");
                }

                return this.create()._initHandler().enable().render(0, 0);
            },
            customEventName: ["pulldown", "pullup", "pullleft", "pullright", "animationEnd"],
            options: {
                "overflow": "xy",
                "animateDuration": 600,
                "boundary": 150,
                "boundaryDruation": 300,
                "mouseWheelAccuracy": 0.3,
                "pullDistance": 50
            },
            publics: {
                "refreshPosition": Widget.AllowPublic,
                "showStatusBar": Widget.AllowPublic,
                "hideStatusBar": Widget.AllowPublic,
                "render": Widget.AllowPublic,
                "toX": Widget.AllowPublic,
                "toY": Widget.AllowPublic
            },
            isTransform3d: function() {
                return transitionToAnimation && $.support.transform3d;
            },
            render: function(x, y, addtion, boundary) {
                var position,
                originX = 0,
                    originY = 0,
                    statusX, statusY;

                if (addtion) {
                    position = this.getContainerPosition();

                    originX = position.x;
                    originY = position.y;
                }

                if (x !== null && this._isAllowedDirection("x")) {
                    x = this.checkXBoundary(originX + x, boundary);
                    statusX = this.checkXStatusBar(x);
                }
                if (y !== null && this._isAllowedDirection("y")) {
                    y = this.checkYBoundary(originY + y, boundary);
                    statusY = this.checkYStatusBar(y);
                }

                this.isTransform3d() ? this._renderByTransform3d(x, statusX, y, statusY) : this._renderByDefault(x, statusX, y, statusY);
                return this;
            },
            _renderByTransform3d: function(x1, x2, y1, y2) {
                var opt1 = {};
                if (x1 !== null && this._isAllowedDirection("x")) {
                    opt1.tx = parseInt(x1);
                    this.statusBarX.setTranslate3d({
                        tx: parseInt(x2)
                    });
                }
                if (y1 !== null && this._isAllowedDirection("y")) {
                    opt1.ty = parseInt(y1);
                    this.statusBarY.setTranslate3d({
                        ty: parseInt(y2)
                    });
                }
                this.container.setTranslate3d(opt1)

                return this;
            },
            _renderByDefault: function(x1, x2, y1, y2) {
                x1 !== null && this._isAllowedDirection("x") && this.container.offsetL(parseInt(x1)) && this.statusBarX.offsetL(parseInt(x2));

                y1 !== null && this._isAllowedDirection("y") && this.container.offsetT(parseInt(y1)) && this.statusBarY.offsetT(parseInt(y2));
                return this;
            },
            renderStatusBar: function(x, y) {
                var isTransform3d = this.isTransform3d();

                this._isAllowedDirection("x") && isTransform3d ? this.statusBarX.setTranslate3d({
                    tx: parseInt(x)
                }) : this.statusBarX.offsetL(parseInt(x));

                this._isAllowedDirection("y") && isTransform3d ? this.statusBarY.setTranslate3d({
                    ty: parseInt(y)
                }) : this.statusBarY.offsetT(parseInt(y));

                return this;
            },
            getContainerPosition: function() {
                var x, y, transform3d;
                if (this.isTransform3d()) {
                    x = this.container.transform3d("translateX", true);
                    y = this.container.transform3d("translateY", true);
                } else {
                    x = this.container.offsetL();
                    y = this.container.offsetT();
                }
                return {
                    x: x,
                    y: y
                };
            },

            target: null,
            toString: function() {
                return "ui.scrollableview";
            },
            widgetEventPrefix: "scrollableview",

            refreshStatusBar: function() {
                var viewportWidth = this.viewportWidth,
                    scrollWidth = this.scrollWidth,
                    viewportHeight = this.viewportHeight,
                    scrollHeight = this.scrollHeight,
                    width = 0,
                    height = 0;

                if (scrollWidth != viewportWidth) {
                    this.statusBarXVisible = 1;
                    width = viewportWidth * viewportWidth / scrollWidth
                } else {
                    width = this.statusBarXVisible = 0;
                }


                if (scrollHeight != viewportHeight) {
                    this.statusBarYVisible = 1;
                    height = viewportHeight * viewportHeight / scrollHeight
                } else {
                    height = this.statusBarYVisible = 0;
                }

                this.statusBarX.width(width);
                this.statusBarY.height(height);

                return this;
            },

            refreshPosition: function() {
                this.scrollWidth = this.container.scrollWidth();
                this.scrollHeight = this.container.scrollHeight();

                this.viewportWidth = this.target.width();
                this.viewportHeight = this.target.height();

                this.overflowWidth = this.scrollWidth - this.viewportWidth;
                this.overflowHeight = this.scrollHeight - this.viewportHeight;

                return this.refreshStatusBar();
            },
            _isAllowedDirection: function(direction) {
                return this.options.overflow.indexOf(direction) > -1;
            },
            getTop: function() {
                return this.isTransform3d() ? this.container.transform3d("translateY", true) : this.container.offsetT();
            },
            getLeft: function() {
                return this.isTransform3d() ? this.container.transform3d("translateX", true) : this.container.offsetL();
            },
            pause: function() {

                return this;
            },
            animate: function(e) {
                var opt = this.options,
                    a0 = e.acceleration,
                    t0 = opt.animateDuration - e.duration,
                    s0 = Math.round(a0 * t0 * t0 * 0.5),
                    direction = e.direction;

                if (t0 <= 0) {
                    this.toYBoundary(this.getTop()).toXBoundary(this.getLeft());
                    return this.hideStatusBar();
                };

                switch (direction) {
                    case 3:
                        this.toX(-s0, t0, direction);
                        break;
                    case 9:
                        this.toX(s0, t0), direction;
                        break;
                    case 6:
                        this.toY(-s0, t0, direction);
                        break;
                    case 12:
                        this.toY(s0, t0, direction);
                        break;
                    default:
                        this.toXBoundary(this.getTop()).toYBoundary(this.getLeft());
                }

                return this;
            },

            checkXBoundary: function(s, boundary) {
                var boundary = boundary !== undefined ? boundary : this.options.boundary;
                return $.between(-(this.overflowWidth + boundary), boundary, s);
            },
            checkYBoundary: function(s, boundary) {
                var boundary = boundary !== undefined ? boundary : this.options.boundary;
                return $.between(-(this.overflowHeight + boundary), boundary, s);
            },

            checkXStatusBar: function(left) {
                var result = -left / this.scrollWidth * this.viewportWidth;
                return $.between(0, this.viewportWidth - this.statusBarX.width(), result);
            },

            checkYStatusBar: function(top) {
                var result = -top / this.scrollHeight * this.viewportHeight;
                return $.between(0, this.viewportHeight - this.statusBarY.height(), result);
            },

            showStatusBar: function() {
                this.statusBarXVisible && this._isAllowedDirection("x") && this.statusBarX.show();
                this.statusBarYVisible && this._isAllowedDirection("y") && this.statusBarY.show();
                return this;
            },
            hideStatusBar: function() {
                this.statusBarX.hide();
                this.statusBarY.hide();
                return this;
            },

            outerXBoundary: function(t) {
                if (t >= 0) {
                    return 0;
                } else if (t < -this.overflowWidth) {
                    return -this.overflowWidth;
                }
                return null;
            },

            outerYBoundary: function(t) {
                if (t >= 0) {
                    return 0;
                } else if (t < -this.overflowHeight) {
                    return -this.overflowHeight;
                }
                return null;
            },

            _triggerAnimate: function(scene, direction, duration, distance) {
                var type = this.getEventName("animationEnd");
                this.target.trigger(type, this.container[0], {
                    type: type,
                    scene: scene,
                    direction: direction,
                    duration: duration,
                    distance: distance
                });
            },

            toXBoundary: function(left, direction) {
                var outer = this.outerXBoundary(left),
                    opt,
                    self = this;
                if (outer !== null) {
                    if (this.isTransform3d()) {
                        opt = {
                            transform3d: {
                                translateX: outer + "px"
                            }
                        };
                    } else {
                        opt = {
                            left: outer + "px"
                        };
                    }
                    this.container.animate(opt, {
                        duration: this.options.boundaryDruation,
                        easing: "expo.easeOut",
                        queue: false,
                        complete: function() {
                            self.hideStatusBar();
                            self._triggerAnimate("boundary", direction, self.options.boundaryDruation, outer);
                        }
                    });
                };
                return this;
            },

            toYBoundary: function(top, direction) {
                var outer = this.outerYBoundary(top),
                    opt,
                    self = this;
                if (outer !== null) {
                    if (this.isTransform3d()) {
                        opt = {
                            transform3d: {
                                translateY: outer + "px"
                            }
                        };
                    } else {
                        opt = {
                            top: outer + "px"
                        };
                    }
                    this.container.animate(opt, {
                        duration: this.options.boundaryDruation,
                        easing: "expo.easeOut",
                        queue: false,
                        complete: function() {
                            self.hideStatusBar();
                            self._triggerAnimate("boundary", direction, self.options.boundaryDruation, outer);
                        }
                    });
                };
                return this;
            },

            toX: function(s, t, d) {
                return this._isAllowedDirection("x") ? this.animateX(this.checkXBoundary(this.getLeft() - s), t, d) : this;
            },
            toY: function(s, t, d) {
                return this._isAllowedDirection("y") ? this.animateY(this.checkYBoundary(this.getTop() - s), t, d) : this;
            },
            animateY: function(y1, t, direction) {
                var self = this,
                    y2 = this.checkYStatusBar(y1),
                    opt1, opt2;

                if (this.isTransform3d()) {
                    opt1 = {
                        transform3d: {
                            translateY: y1 + "px"
                        }
                    };
                    opt2 = {
                        transform3d: {
                            translateY: y2 + "px"
                        }
                    };
                } else {
                    opt1 = {
                        top: y1 + "px"
                    };
                    opt2 = {
                        top: y2 + "px"
                    };
                }

                this.container.animate(opt1, {
                    duration: t,
                    easing: "easeOut",
                    complete: function() {
                        self.toXBoundary(self.getLeft(), direction).toYBoundary(y1, direction);
                        self._triggerAnimate("inner", direction, t, y1);
                    }
                });

                this.statusBarY.animate(opt2, {
                    duration: t,
                    easing: "easeOut"
                });
                return this;
            },
            animateX: function(x1, t, direction) {
                var self = this,
                    x2 = this.checkXStatusBar(x1),
                    opt1, opt2;

                if (this.isTransform3d()) {
                    opt1 = {
                        transform3d: {
                            translateX: x1 + "px"
                        }
                    };
                    opt2 = {
                        transform3d: {
                            translateX: x2 + "px"
                        }
                    };
                } else {
                    opt1 = {
                        left: x1 + "px"
                    };
                    opt2 = {
                        left: x2 + "px"
                    };
                }

                this.container.animate(opt1, {
                    duration: t,
                    easing: "easeOut",
                    complete: function() {
                        self.toXBoundary(x1, direction).toYBoundary(self.getTop(), direction);
                        self._triggerAnimate("inner", direction, t, x1);
                    }
                });

                this.statusBarX.animate(opt2, {
                    duration: t,
                    easing: "easeOut"
                });
                return this;
            }
        });

    //提供注释
    $.fn.uiScrollableview = function(a, b, c, args) {
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
        return scrollableview.apply(this, arguments);
    }

    return scrollableview;
});