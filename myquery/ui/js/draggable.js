/// <reference path="../../myquery.js" />
myQuery.define("ui/js/draggable", ["module/widget", "main/event", "main/dom"], function ($, widget, event, dom, undefined) {
    var eventFuns = $.event.document,
        draggable = $.widget("ui.draggable", function draggable(obj, target) {
            this.__supper(obj, target).init(obj || {}, target).create().render();
        }, {
            container: null,
            create: function () {
                var str, self = this,
                    result;
                this.target.ancestors().each(function (ele) {
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

                this._bindEvent();

                this.able();

                return this;
            },
            customEventName: ["start", "move", "stop"],
            event: function () { },
            enable: function () {
                var fun = this.event;
                this.disable();
                this.options.container.addHandler('mousemove', fun).addHandler('mouseup', fun);
                this.target.addHandler('mousedown', fun);
            },
            disable: function () {
                var fun = this.event;
                this.options.container.removeHandler('mousemove', fun).removeHandler('mousemove', fun);
                this.target.removeHandler('mousedown', fun);
            },
            init: function (obj, target) {
                this.option(obj);
                this.options.container = $(obj.container || document.body);
                return this;
            },
            options: {
                container: null,
                disabled: true,
                diffx: 0,
                diffy: 0,
                axis: null,
                x_axis: true,
                y_axis: true,
                cursor: 'default',
                overflow: false
            },
            public: {

            },
            _bindEvent: function () {
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
                            container: opt.container,
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
                                con = opt.container,
                                cP;
                                x -= (opt.diffx + offsetLeft);
                                y -= (opt.diffy + offsetTop);

                                if (con[0]) {
                                    cP = con.position();
                                    cP.pageLeft -= offsetLeft;
                                    cP.pageTop -= offsetTop;
                                    x = $.between(cP.pageLeft, cP.width + cP.pageLeft - target.width(), x);
                                    y = $.between(cP.pageTop, cP.height + cP.pageTop - target.height(), y); //使用height对不对？
                                }

                                // target.css({
                                //     cursor: opt.cursor
                                // });
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
                            para.type = 'drag.stop';
                            target.trigger('drag.stop', target[0], para);
                            dragging = null;
                            break;
                    }
                };

            },
            render: function (x, y) {
                var opt = this.options;

                if (opt.disabled === false) {
                    opt.cursor = 'default';
                } else {
                    switch (opt.axis) {
                        case "x":
                            opt.y_axis = false;
                            opt.cursor = 'e-resize';
                            break;
                        case "y":
                            x_axis = false;
                            cursor = 'n-resize';
                            break;
                        default:
                            opt.x_axis = true;
                            opt.y_axis = true;
                            opt.cursor = 'move';
                    }
                }
                this.target.css({
                    cursor: opt.cursor
                });

                opt.x_axis === true && x != undefined && this.target.css({
                    l: x
                });
                opt.y_axis === true && y != undefined && this.target.css({
                    t: y
                });

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