/// <reference path="../../myquery.js" />

myQuery.define("ui/js/scrollableview", ["main/query", "main/dom", "ui/js/swappable", "ui/js/draggable", "module/Widget", "module/animate", "module/tween.extend"]
, function ($, query, dom, swappable, draggable, Widget, animate, tween, undefined) {
    var eventFuns = $.event.document
    , scrollableview = $.widget("ui.scrollableview"
        , function scrollableview(obj, target) {
            this.__super(obj, target).init(obj || {}, target).create().render(0, 0);
        }, {
        container: null
        , create: function () {
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
            
            /*
                var 
                para = e.para || 0.2
                a0 = e.acceleration, a1 = para * G,
                t0 = e.duration,
                s0 = a0 * t0 * t0 * 0.5,
                v0 = a0 * t0,
                t1 = math.ceil(v1 / a1) //duration * （1 - weight),
                s1 = v0 * t1 - a1 * t1 * t1 * 0.5,
                Ssum = s0 + s1;
                // (v1 - a1 * t) = 0 
                
                function(tick, begin, closure, duration, a0, a1, v0, t1){
                    var result = 0, t0 = duration - t1;
                    if(tick <= t0){
                        t0 = tick;
                    }
                    result += a0 * t0 * t0 * 0.5;
                    if (tick > t1) {
                        result +=v0 * t1 + a1 * t1 * t1 * 0.5;
                    };
                    return result; 
                }
            */
            return this;
        }
        , customEventName: ["start", "move", "stop"]
        , event: function () {
            
            
        }
        , enable: function () {
            var event = this.event;
            this.target.on("swap.stop", event);

        }
        , disable: function () {
            
        }
        , _initHandler: function () {
            var self = this, target = self.target, opt = self.options; 
            this.event = function(e){
                switch(e.type){
                    case "swap.stop":
                    self.animate(e);
                    break;
                }
            }
            return this;
        }
        , destory: function () {
            
        }
        , init: function (obj) {
            this.option(obj);
            this.originOverflow = this.target.css("overflow");
            this.refreshScroll();
            this._initHandler()
            this.target.css("overflow","hidden");
            
            return this;
        }
        , options: {
            "overflow": "xy",
            "animateDuration": 600,
        }
        , public: {
           
        }
        , render: function (x, y) {
            if (this.options.isTransform) {

            }
            else{
                this.container.offsetL(x).offsetT(y);
            }
            return this;
        }
        , target: null
        , toString: function () {
            return "ui.scrollableview";
        }
        , widgetEventPrefix: "scrollableview"

        , refreshScroll: function(){
            this.scrollHeight = this.target.scrollHeight();
            this.scrollWidth = this.target.scrollWidth();
            
        }
        // , resize: function(){ 
        //     this.container.width(this.scrollWidth);
        //     this.container.height(this.scrollHeight);
        // }

        , animate: function(e){
            var self = this, opt = this.options,
                a0 = e.acceleration,
                t0 = opt.animateDuration - e.duration,
                s0 = Math.round(a0 * t0 * t0 * 0.5);
                //v0 = a0 * t0,
                // t1 = Math.ceil(a0 / a1), //duration * （1 - weight),
                // s1 = v0 * t1 - a1 * t1 * t1 * 0.5,
                // Ssum =Math.round(s0 + s1);
                if (t0 <= 0) {return this;};
                this.container.animate({ left: (this.container.offsetL() - s0) + "px" },
                {
                        duration: t0,
                        easing: "expo.easeOut",
                });
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