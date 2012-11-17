/// <reference path="../../myquery.js" />

myQuery.define("ui/js/scrollableview", ["main/query", "main/dom", "ui/js/swappable", "ui/js/draggable", "module/Widget", "module/animate"]
, function ($, query, dom, swappable, draggable, Widget, animate, undefined) {
    var eventFuns = $.event.document
    , scrollableview = $.widget("ui.scrollableview", {
        container: null
        , create: function () {
            
            this.positionParent = $($.create("div"))
            .width(this.target.width())
            .height(this.target.height())
            .css({"overflow": "auto"})
            .append(this.target.child());

            this.container = 
            $($.create("div"))
            .css({
                "overflow": "hidden",
                "position": "absolute"
            })
            .append(this.positionParent)
            .appendTo(this.target);

            this
            .render(0, 0)
            ._initHandler()
            .able();
            
            
            return this;
        }
        , customEventName: ["start", "move", "stop"]
        , event: function () {
            
            
        }
        , enable: function () {
            //this.target.swappable()
            this.container.draggable();
        }
        , disable: function () {
            
        }
        , _initHandler: function () {
            var self = this, target = self.target, opt = self.options; 
            this.event = function(){

            }
            return this;
        }
        , destory: function () {
            
        }
        , init: function (obj) {
            this.option(obj);
            this.overflow = this.target.css("overflow");
            this.refreshScroll();
            this.target.css("overflow","hidden");
            
            return this;
        }
        , options: {
            
        }
        , public: {
            "overflow":1,
            "overflow-x":1,
            "overflow-y":1
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