myQuery.define("ui/tabbutton", [
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
        href: $.getPath("ui/css/tabbutton", ".css")
    });

    var tabbutton = Widget.extend("ui.tabbutton", {
        container: null,
        customEventName: [],
        event: function() {},
        _initHandler: function() {
            var self = this;
            this._superCall();
            return this;
        },
        enable: function() {
            this._superCall();
            return this;
        },
        disable: function() {
            this._superCall();
            return this;
        },
        init: function(opt, target) {
            this._super(opt, target);

            return this;
        },
        options: {
            cssName: "tabbutton"
        },
        public: {

        },
        target: null,
        toString: function() {
            return "ui.tabbutton";
        },
        widgetEventPrefix: "tabbutton"
    });

    //提供注释
    $.fn.tabbutton = function(a, b, c, args) {
        tabbutton.apply(this, arguments);
        return this;
    }

    return tabbutton;
});