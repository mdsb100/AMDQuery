/// <reference path="../../myquery.js" />
myQuery.define("ui/js/draggable", ["module/Widget", "main/event", "main/dom", "main/query"], function ($, Widget, event, dom, query, undefined) {
    "use strict"; //启用严格模式
    var eventFuns = event.event.document,
        draggable = Widget.factory("ui.draggable", function draggable(obj, target) {
            this.__super(obj, target).init(obj || {}, target).create().render();
        }, {
            container: null,
            create: function () {
                var str, self = this, result;

                this.container.css("overflow", "hidden");

                this.target.css("position", "absolute").ancestors().each(function (ele) {
                    str = $.style(ele, "position");
                    switch (str) {
                        case "absolute":
                        case "relative":
                            result = ele;
                            return false;
                            break;
                    }
                });
                if (!result) {
                    result = document.body;
                    $(result).css("position", "relative");
                }
                //self.container = $(result);
                this.positionParent = $(result);
                if (this.options.overflow == true) {
                    this.positionParent.css("overflow", "hidden");
                }

                this._initHandler();

                this.able();

                return this;
            },
            customEventName: ["start", "move", "stop"],
            event: function () { },
            enable: function () {
                var fun = this.event;
                this.disable();
                $("body").on("mouseup", fun);
                this.container.on('mousemove', fun).on('mouseup', fun);
                this.target.on('mousedown', fun);
            },
            disable: function () {
                var fun = this.event;
                $("body").off("mouseup", fun);
                this.container.off('mousemove', fun).off('mousemove', fun);
                this.target.off('mousedown', fun);
            },
            init: function (obj, target) {
                this.option(obj);
                this.container = $(obj.container || document.body);
                return this;
            },
            options: {
                //container: null,
                disabled: true,
                diffx: 0,
                diffy: 0,
                axis: null,
                axisx: true,
                axisy: true,
                cursor: 'default',
                overflow: false,
                keepinner: true
            },
            public: {

            },
            _initHandler: function () {
                var self = this,
                    target = self.target,
                    opt = self.options,
                    dragging = null;
                this.event = function (e) {
                    var offsetLeft = target.getLeft(),
                        offsetTop = target.getTop(),
                        x = e.pageX || e.clientX,
                        y = e.pageY || e.clientY,
                        para = {
                            type: 'drag.start',
                            container: self.container,
                            clientX: x,
                            clientY: y,
                            offsetX: e.offsetX || e.layerX || x - offsetLeft,
                            offsetY: e.offsetY || e.layerY || y - offsetTop,
                            event: e,
                            target: this
                        };

                    switch (e.type) {
                        case "touchstart":
                        case "mousedown":
                            dragging = target;
                            opt.diffx = x - offsetLeft;
                            opt.diffy = y - offsetTop;
                            eventFuns.preventDefault(e);
                            eventFuns.stopPropagation(e);
                            target.trigger(para.type, target[0], para);
                            break;
                        case "touchmove":
                        case "mousemove":
                            if (dragging !== null) {
                                var offset = self.positionParent,
                                offsetLeft = offset.getLeft(),
                                offsetTop = offset.getTop(),
                                con = self.container,
                                cP;
                                x -= (opt.diffx + offsetLeft);
                                y -= (opt.diffy + offsetTop);

                                if (opt.keepinner == true && con[0]) {
                                    cP = con.position();
                                    cP.pageLeft -= offsetLeft;
                                    cP.pageTop -= offsetTop;
                                    x = $.between(cP.pageLeft, cP.width + cP.pageLeft - target.width(), x);
                                    y = $.between(cP.pageTop, cP.height + cP.pageTop - target.height(), y); //使用height对不对？
                                }

                                self.render(x, y);

                                eventFuns.preventDefault(e);
                                para.type = "drag.move";
                                para.offsetX = x;
                                para.offsetY = y;
                                target.trigger(para.type, target[0], para);
                            }
                            break;
                        case "touchend":
                        case "mouseup":
                            eventFuns.preventDefault(e);
                            eventFuns.stopPropagation(e);
                            para.type = 'drag.stop';
                            dragging = null;
                            target.trigger('drag.stop', target[0], para);
                            break;
                    }
                };

            },
            render: function (x, y) {
                var opt = this.options;
                if (opt.disabled == false) {
                    opt.cursor = 'default';
                } else {
                    switch (opt.axis) {
                        case "x":
                            opt.axisy = false;
                            opt.cursor = 'e-resize';
                            break;
                        case "y":
                            opt.axisx = false;
                            opt.cursor = 'n-resize';
                            break;
                        default:
                            opt.axisx = true;
                            opt.axisy = true;
                            opt.cursor = 'move';
                    }
                }
                this.target.css({
                    cursor: opt.cursor
                });

                opt.axisx === true && x != undefined && this.target.css("left",x + "px");
                opt.axisy === true && y != undefined && this.target.css("top",y + "px");

                return this;
            },
            target: null,
            toString: function () {
                return "ui.draggable";
            },
            widgetEventPrefix: "drag"
        });

    //提供注释
    $.fn.draggable = function (a, b, c, args) {
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
        draggable.apply(this, arguments);
        return this;
    }

    return draggable;
});