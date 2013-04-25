myQuery.define("ui/tabbar", [
    "module/Widget",
    "ui/button",
    "main/query",
    "main/class",
    "main/event",
    "main/dom",
    "main/attr",
    "module/src"],

function($, Widget, Button, query, cls, event, dom, attr, src) {
    "use strict"; //启用严格模式

    src.link({
        href: $.getPath("ui/css/tabbar", ".css")
    });

    var tabbar = Widget.extend("ui.tabbar", {
        container: null,
        customEventName: [],
        event: function() {},
        _initHandler: function() {
            var self = this;
            this.event = function(e) {

            }
            return this;
        },
        enable: function() {

            return this;
        },
        disable: function() {

            return this;
        },
        init: function(opt, target) {
            this._super(opt, target);

            return this;
        },
        options: {

        },
        public: {

        },
        target: null,
        toString: function() {
            return "ui.tabbar";
        },
        widgetEventPrefix: "ui.tabbar"
    });

    //提供注释
    $.fn.tabbar = function(a, b, c, args) {
        tabbar.apply(this, arguments);
        return this;
    }

    return tabbar;
});