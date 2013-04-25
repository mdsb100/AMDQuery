myQuery.define("ui/draggable", ["module/Widget", "main/event", "main/dom", "html5/css3", "main/query"], function ($, Widget, event, dom, cls3, query, undefined) {
    "use strict"; //启用严格模式
    var eventFuns = event.event.document,
        draggable = Widget.extend("ui.draggable", {
            container: null,
            create: function () {
                var self = this;

                this.container.css("overflow", "hidden");

                this.target.css("position", "absolute")

                this._initHandler();

                this.initPositionParent();

                this.able();

                return this;
            },
            customEventName: ["start", "move", "stop", "pause"],
            event: function () { },
            enable: function () {
                var fun = this.event;
                this.disable();
                $("body").on("mouseup", fun);
                this.container.on('mousemove mouseup', fun);
                this.target.on('mousedown', fun);
            },
            disable: function () {
                var fun = this.event;
                $("body").off("mouseup", fun);
                this.container.off('mousemove mouseup', fun);
                this.target.off('mousedown', fun);
            },
            init: function (opt, target) {
                this._super(opt, target);
                target.attr("myquery-ui", "draggable");
                this.container = $(this.options.container || document.body);
                return this.create().render();
            },
            initPositionParent: function(){
                var result;
                if(this.isTransform3d()){
                    this.container.initTransform3d();
                    this.positionParent = this.container;
                }
                else{
                    this.target.ancestors().each(function (ele) {
                        switch ($.style(ele, "position")) {
                            case "absolute":
                            case "relative":
                                result = ele;
                                return false;
                                break;
                        }
                    });
                    if (!result) {
                        result = document.body;
                        $.css(result, "position", "relative");
                    }
                    //self.container = $(result);
                    this.positionParent = $(result);
                    if (this.options.overflow == true) {
                        this.positionParent.css("overflow", "hidden");
                    }
                }

                return this;
            },
            options: {
                container: null,
                disabled: true,
                diffx: 0,
                diffy: 0,
                axis: null,
                axisx: true,
                axisy: true,
                cursor: 'default',
                overflow: false,
                keepinner: true,
                stopPropagation:true,
                isTransform3d:false,
                removeContainer: 0,
                pauseSensitivity: 500
            },
            public: {
                getPositionX:1,
                getPositionY:1,
                render:1
            },
            isTransform3d: function() {
                return this.options.isTransform3d && $.support.transform3d;
            },
            getPositionX: function(){
                return this.target.getLeft() + (this.isTransform3d() ? this.target.transform3d("translateX", true): 0);
            },
            getPositionY: function(){
                return this.target.getTop()  + (this.isTransform3d() ? this.target.transform3d("translateY", true): 0);
            },
            _initHandler: function () {
                var self = this,
                    target = self.target,
                    opt = self.options,
                    timeout,
                    parentLeft = null,
                    parentTop = null,
                    dragging = null;
                this.event = function (e) {
                    if(e.type !== "mousemove" || dragging){
                        var offsetLeft = self.getPositionX(),
                            offsetTop = self.getPositionY(),
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
                    }
                    switch (e.type) {
                        case "touchstart":
                        case "mousedown":
                            dragging = target;
                            opt.diffx = x - offsetLeft;
                            opt.diffy = y - offsetTop;
                            parentLeft = self.positionParent.getLeft();
                            parentTop = self.positionParent.getTop();
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
                            self.target.css({
                                cursor: opt.cursor
                            });

                            eventFuns.preventDefault(e);
                            opt.stopPropagation && eventFuns.stopPropagation(e);
                            target.trigger(para.type, target[0], para);
                            break;
                        case "touchmove":
                        case "mousemove":
                            if (dragging !== null) {
                                var
                                con = self.container,
                                cP;
                                x -= (opt.diffx + parentLeft);
                                y -= (opt.diffy + parentTop);

                                if (opt.keepinner == true && con[0]) {
                                    cP = con.position();
                                    cP.pageLeft -= parentLeft;
                                    cP.pageTop -= parentTop;
                                    x = $.between(cP.pageLeft, cP.width + cP.pageLeft - target.width(), x);
                                    y = $.between(cP.pageTop, cP.height + cP.pageTop - target.height(), y); //使用height对不对？
                                }

                                eventFuns.preventDefault(e);
                                para.type = "drag.move";
                                para.offsetX = x;
                                para.offsetY = y;
                                target.trigger(para.type, target[0], para);

                                clearTimeout(timeout);
                                timeout = setTimeout(function () {
                                    para.type = "drag.pause";
                                    target.trigger(para.type, target[0], para);
                                }, opt.pauseSensitivity)

                                self.render(para.offsetX, para.offsetY);
                            }
                            break;
                        case "touchend":
                        case "mouseup":
                            clearTimeout(timeout);
                            eventFuns.preventDefault(e);
                            opt.stopPropagation && eventFuns.stopPropagation(e);
                            para.type = 'drag.stop';
                            dragging = null;
                            target.trigger('drag.stop', target[0], para);
                            break;
                    }
                };

            },
            render: function (x, y) {
                return this.isTransform3d() ? this._renderByTransform3d(x, y): this._render(x, y);
            },
            _render: function(x, y){
                var opt = this.options;
                
                if(opt.axisx === true && x != undefined){
                    this.target.css("left",x + "px");
                }
                if(opt.axisy === true && y != undefined){
                    this.target.css("top",y + "px");
                }

                return this; 
            },
            _renderByTransform3d: function(x, y){
                var opt = this.options, obj ={};
                
                if(opt.axisx === true && x != undefined){
                    obj.tx = x;
                }
                if(opt.axisy === true && y != undefined){
                    obj.ty = y;
                }
                this.target.setTranslate3d(obj);
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