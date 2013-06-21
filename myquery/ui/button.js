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
            this.disable();
            this.target.on("click", this.event);
            this.options.disabled = true;
            return this;
        },
        disable: function() {
            this.target.off("click", this.event);
            this.options.disabled = false;
            return this;
        },
        render: function() {
            var opt = this.options,
                ie = client.browser.ie < 9;
            ie && this.$text.remove();
            this.$text.html(opt.text);
            ie && this.$text.appendTo(this.container);
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

            this.$img = $($.createEle("img")).css({
                "display": "block",
                "text-decoration": "none",
                "position": "relative"
            }).addClass("img").addClass(this.options.icon);

            this.$text = $($.createEle("a")).css({
                "display": "block",
                "text-decoration": "none",
                "float": "left"
            }).addClass("text");

            this.container.append(this.$img).append(this.$text);

            target.append(this.container);

            target.css({
                "float": "left",
                "cursor": "pointer"
            });
            
            this.$text.css3("user-select", "none");

            this._initHandler().enable().render();

            return this;
        },
        customEventName: ["click"],
        options: {
            defualtCssName: "button",
            text: "clickme",
            title: "",
            icon: "icon"
        },
        getter:{
            defualtCssName: 1,
            text: 1,
            title: 1,
            icon: 0
        },
        setter:{
            defualtCssName: 0,
            text: 1,
            title: 1,
            icon: 0
        },
        publics: {

        },
        target: null,
        toString: function() {
            return "ui.button";
        },
        widgetEventPrefix: "button"
    });

    return button;
});