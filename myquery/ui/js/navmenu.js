myQuery.define("ui/js/navmenu", [
    "ui/js/navitem",
    "module/Widget",
    "main/query",
    "main/class",
    "main/event",
    "main/dom",
    "main/attr",
    "module/src"],
function($, NavItem, Widget, query, cls, event, dom, attr, src) {
    "use strict"; //启用严格模式

    src.link({
        href: $.getPath("ui/css/navmenu", ".css")
    });

    var navmenu = Widget.extend("ui.navmenu", {
            container: null,
            customEventName: ["open", "close"],
            event: function() {},
            _initHandler: function() {
                var self = this;
                this.event = function(e) {
                    var para = $.extend({}, e),
                        type,
                        target;
                    target = para.target = self.target[0];

                    para.navitem = e.target;

                    switch (e.type) {
                        case "navitem.open":
                            type = para.type = "navmenu.open";
                            self.target.trigger(type, target[0], para);
                            break;
                        case "navitem.close":
                            type = para.type = "navmenu.close";
                            self.target.trigger(type, target[0], para);
                            break;
                    }
                }
                return this;
            },
            enable: function() {
                var fun = this.event,
                    ret, i = 0,
                    len = this.navItemList.length,
                    ele;
                for (i = 0; i < len; i++) {
                    ele = this.navItemList[i];
                    $(ele).on("navitem.open", fun);
                    $(ele).on("navitem.close", fun);
                }
                return this;
            },
            disable: function() {
                var fun = this.event,
                    ret, i = 0,
                    len = this.navItemList.length,
                    ele;
                for (i = 0; i < len; i++) {
                    ele = this.navItemList[i];
                    $(ele).off("navitem.open", fun);
                    $(ele).off("navitem.close", fun);
                }
                return this;
            },
            getNavItemsByHtml: function(str) {
                var ret = [],
                    i = 0,
                    len = this.navItemList.length,
                    ele,
                    html;
                for (i = 0; i < len; i++) {
                    ele = this.navItemList[i];
                    html = $(ele).navitem("option", "html");
                    if (html === str) {
                        ret.push(ele);
                    }
                }
                return ret;
            },
            getNavItem: function(item) {
                var ret, i = 0,
                    len = this.navItemList.length,
                    ele;
                if ($.isStr(item)) {
                    for (i = 0; i < len; i++) {
                        ele = this.navItemList[i];
                        if ($.attr(ele, "id") === item) {
                            ret = ele;
                            break;
                        }
                    }
                } else if ($.Widget.is(item, "navmenu")) {
                    for (i = 0; i < len; i++) {
                        ele = this.navItemList[i];
                        if ($(ele).navitem("equals", item)) {
                            ret = ele;
                            break;
                        }
                    }
                } else if ($.isEle(item)) {
                    for (i = 0; i < len; i++) {
                        ele = this.navItemList[i];
                        if (ele === item) {
                            ret = ele;
                            break;
                        }
                    }
                }
                return ret;
            },
            getNavItemList: function() {
                return this.target.query("li[myquery-ui-navitem]").reverse();
            },
            detectNavItemList: function() {
                this.navItemList = this.getNavItemList();
            },
            init: function(opt, target) {
                this._super(opt, target);
                target.addClass("navmenu");

                this.navItemList = [];
                this.detectNavItemList();

                this._initHandler().enable().render();

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
        navmenu.apply(this, arguments);
        return this;
    }

    return navmenu;
});