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
        event: function() {},
        _initHandler: function() {
            var self = this;
            this.event = function(e) {

            }
            return this;
        },
        enable: function() {

            this.options.disabled = true;
            return this;
        },
        disable: function() {

            this.options.disabled = false;
            return this;
        },
        init: function(opt, target) {
            this._super(opt, target);

            return this;
        },
        customEventName: [],
        options: {

        },
        getter:{
            
        },
        setter:{
            
        },
        publics: {

        },
        target: null,
        toString: function() {
            return "ui.tabbar";
        },
        widgetEventPrefix: "tabbar"
    });

    //提供注释
    $.fn.tabbar = function(a, b, c, args) {
        return tabbar.apply(this, arguments);
    }

    return tabbar;
});