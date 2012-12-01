/// <reference path="../../myquery.js" />

myQuery.define("ui/js/scrollableview", 
["main/query", 
"main/dom",
"ui/js/swappable",
"ui/js/draggable", 
"module/Widget", 
"module/animate", 
"module/tween.extend"]
, function ($, query, dom, swappable, draggable, Widget, animate, tween, undefined) {
    var eventFuns = $.event.document
    , scrollableview = $.widget("ui.scrollableview"
        , function scrollableview(obj, target) {
            this.__super(obj, target).init(obj || {}, target).create().render(0, 0);
        }, {
        container: null,
        create: function () {
            var opt = this.options;
            this.positionParent = $({"overflow": "visible"},"div")
            .width(this.target.width())
            .height(this.target.height())
            .append(this.target.child());

            this.container = $({"position": "absolute"}, "div")
            .append(this.positionParent)
            .appendTo(this.target);
            
            this.target.swappable({
                disabled:opt.disabled
            })

            this.container.draggable({
                keepinner: 0, 
                axis: opt.overflow,
                disabled: opt.disabled,
                stopPropagation:false
            })

            this
            .able();
            
            return this;
        },
        customEventName: ["start", "move", "stop"],
        event: function () {
            
            
        },
        enable: function () {
            var event = this.event;
            this.target.on("swap.stop", event).touchwheel(event);
        },
        disable: function () {
            this.target.off("swap.stop", event).off("touchwheel", event);
        },
        _initHandler: function () {
            var self = this, target = self.target, opt = self.options; 
            this.event = function(e) {
                switch(e.type){
                    case "swap.stop":
                    self.animate(e);
                    case "touchwheel":
                    var x = null, y = null;
                    if (e.direction == "x") {
                        x = e.wheelDelta * opt.touchWheelAccuracy;
                    }
                    else if (e.direction == "y") {
                        y = e.wheelDelta * opt.touchWheelAccuracy;
                    };
                    self.render(x, y, true);
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
            this._initHandler()
            this.target.css("overflow","hidden");
            
            return this;
        },
        options: {
            "overflow": "xy",
            "animateDuration": 600,
            "boundary": 150,
            "isTransform3d": 1,
            "touchWheelAccuracy": 0.5
        },
        public: {
           
        },
        render: function (x, y, addtion) {
            var originX = 0, originY=0;
            if (this.options.isTransform3d && $.support.transform3d) {

            }
            else{
                if (addtion) {
                    originX = this.container.offsetL();
                    originY = this.container.offsetT();
                };
                x !== null && this.container.offsetL(originX + x);
                y !== null && this.container.offsetT(originY + y);
            }
            return this;
        },
        target: null,
        toString: function () {
            return "ui.scrollableview";
        },
        widgetEventPrefix: "scrollableview",

        refreshPosition: function(){
            this.scrollHeight = this.target.scrollHeight();
            this.scrollWidth = this.target.scrollWidth();
            this.viewportHeight = this.target.width();
            this.viewporttWidth = this.target.height();
            return this;
        },
        // , resize: function(){ 
        //     this.container.width(this.scrollWidth);
        //     this.container.height(this.scrollHeight);
        // }
        _isAllowedDirection: function(direction){
            return this.options.overflow.indexOf(direction) > -1;
        },
        animate: function(e){
            var opt = this.options,
                a0 = e.acceleration,
                t0 = opt.animateDuration - e.duration,
                s0 = Math.round(a0 * t0 * t0 * 0.5);
                //v0 = a0 * t0,
                // t1 = Math.ceil(a0 / a1), //duration * （1 - weight),
                // s1 = v0 * t1 - a1 * t1 * t1 * 0.5,
                // Ssum =Math.round(s0 + s1);
                if (t0 <= 0) {return this;};

                switch(e.direction){
                    case 3: this.toX(-s0, t0);
                    break;
                    case 9: this.toX(s0, t0);
                    break;
                    case 6: this.toY(-s0, t0);
                    break;
                    case 12:this.toY(s0, t0);
                    break;
                }

                
                // function(tick, begin, closure, duration, a0, a1, v0, t0, t1){
                //             var result = 0, t0 = duration - t1;
                //             if(tick <= t0){
                //                 t0 = tick;
                //             }
                //             result += a0 * t0 * t0 * 0.5;
                //             if (tick >duration - t1) {
                //                 result +=v0 * t1 - a1 * t1 * t1 * 0.5;
                //             };
                //             return result; 
                //         }
                return this;
        },

        checkBoundary: function(origin, distance){

        },

        toX: function(s, t){
            if(!this._isAllowedDirection("x")){
                return this;
            }
            var opt = this.options,
            boundary = opt.boundary,
            left = $.between(-(this.scrollWidth + boundary - this.viewporttWidth), boundary, this.container.offsetL() - s);
            console.log(this.scrollWidth)
            this.container.animate({ left: left + "px" }, {
                duration: t,
                easing: "expo.easeOut"
            });
            return this;
        },
        toY: function(s, t){
            if(!this._isAllowedDirection("y")){
                return this;
            }
            this.container.animate({ top: (this.container.offsetT() - s) + "px" },
            {
                duration: t,
                easing: "expo.easeOut"
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