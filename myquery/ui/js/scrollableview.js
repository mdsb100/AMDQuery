/// <reference path="../../myquery.js" />

myQuery.define("ui/js/scrollableview", ["module/Widget", "ui/js/swappable", "ui/js/draggable", "module/animate"]
, function ($, Widget, swappable, draggable, animate, undefined) {
    var eventFuns = $.event.document
    , scrollableview = $.widget("ui.scrollableview", {
        container: null
        , create: function () {
            this.target.swappable();
            return this;
        }
        , customEventName: ["start", "move", "stop"]
        , event: function () {
            var self = this, target = self.target, opt = self.options, dragging = null;
            
        }
        , enable: function () {
            
        }
        , disable: function () {
            
        }
        , destory: function (key) {
            
        }
        , init: function (obj) {
            
        }
        , options: {
            
        }
        , public: {

        }
        , render: function () {
            
        }
        , target: null
        , toString: function () {
            
        }
        , widgetEventPrefix: "scrollview"
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

});