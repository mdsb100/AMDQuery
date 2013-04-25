myQuery.define("ui/button", [
    "base/client",
    "module/Widget",
    "main/query",
    "main/class",
    "main/event",
    "main/dom",
    "main/attr",
    "module/src"],

function($, client, Widget, query, cls, event, dom, attr, src) {
    "use strict"; //启用严格模式

    src.link({
        href: $.getPath("ui/css/button", ".css")
    });

    var button = Widget.extend("ui.button", {
        container: null,
        customEventName: ["click"],
        event: function() {},
        _initHandler: function() {
            var self = this;
            this.event = function(e) {
                switch (e.type) {
                    case "click":
                        var para = {
                            type: self.getEventName("click"),
                            container: self.container,
                            target: self.target[0],
                            event: e
                        }

                        self.target.trigger(para.type, self.target[0], para);
                        break;
                }
            }
            return this;
        },
        enable: function() {
            this.target.on("click", this.event);
            return this;
        },
        disable: function() {
            this.target.off("click", this.event);
            return this;
        },
        render: function() {
            var opt = this.options,
                ie = client.browser.ie < 9;
            ie && this.$text.remove();
            this.$text.html(opt.text);
            ie this.$text.appendTo(this.container);
            this.container.attr("title", opt.title);
            return this;
        },
        init: function(opt, target) {
            this._super(opt, target);

            target.addClass(this.options.defualtCssName);

            this.container = $($.createEle("a")).css({
                "display": "inline-block",
                "text-decoration": "none"
            }).addClass("back");

            this.$img = $($.createEle("a")).css({
                "display": "block",
                "text-decoration": "none",
                "float": "left"
            }).addClass("img");

            this.$text = $($.createEle("a")).css({
                "display": "block",
                "text-decoration": "none",
                "float": "left"
            }).addClass("text");

            this.container.append(this.$img).append(this.$text);

            target.append(this.container);

            this._initHandler().enable().render();

            return this;
        },
        options: {
            defualtCssName: "button",
            text: "clickme",
            title: ""
        },
        public: {

        },
        target: null,
        toString: function() {
            return "ui.button";
        },
        widgetEventPrefix: "button"
    });

    //提供注释
    $.fn.button = function(a, b, c, args) {
        button.apply(this, arguments);
        return this;
    }

    return button;
});