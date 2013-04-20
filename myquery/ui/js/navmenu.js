/// <reference path="../../myquery.js" />
myQuery.define("ui/js/navmenu", [
    "ui/js/navitem",
    "module/Widget",
    "main/class",
    "main/event",
    "main/dom",
    "main/attr",
    "module/src"],

function($, NavItem, Widget, cls, event, dom, attr, src) {
    "use strict"; //启用严格模式

    src.link({
        href: $.getPath("ui/css/navmenu", ".css")
    });

    var eventFuns = event.event.document,
        navmenu = NavItem.multiply("ui.navmenu", {
            container: null,
            customEventName: [],
            event: function() {},
            _initHandler: function() {
                this.__superCall("_initHandler");
                return this;
            },
            enable: function() {
                var fun = this.event;
                this.__superCall("enable");
            },
            disable: function() {
                var fun = this.event;

            },
            getNavItem: function(item) {
                var ret;
                if ($.isStr(item)) {
                    this.navItemList.each(function(ele) {
                        if ($.attr(ele, "id") == item) {
                            ret = ele;
                            return false;
                        }
                    });
                } else if ($.Widget.is(item, "navmenu")) {
                    this.navItemList.each(function(ele) {
                        if ($(ele).navitem("equals", item)) {
                            ret = ele;
                            return false;
                        }
                    });
                } else if ($.isEle(item)) {
                    this.navItemList.each(function(ele) {
                        if (ele == item) {
                            ret = ele;
                            return false;
                        }
                    });
                }
                return ret;
            },
            getNavItemList: function() {
                return this.target.query("div[myquery-ui-navitem]").reverse();
            },
            detectNavItemList: function() {
                this.navItemList = this.getNavItemList();
            },
            init: function(obj, target) {
                this.__super(obj, target);
                this.target.addClass("navmenu");
                this.navItemList = [];
                this.detectNavItemList();
                return this;
            },
            options: {

            },
            public: {

            },
            target: null,
            toString: function() {
                return "ui.navmenu";
            },
            widgetEventPrefix: "navmenu"
        });

    //提供注释
    $.fn.navmenu = function(a, b, c, args) {
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
        navmenu.apply(this, arguments);
        return this;
    }

    return navmenu;
});