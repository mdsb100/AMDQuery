myQuery.define("module/AnimateColor", ["main/object", "module/color", "main/dom", "module/FX"], function ($, object, color, dom, FX) {
    "use strict"; //启用严格模式
    var AnimateColor = FX.extend(function AnimateColor(ele, options, value, name, type) {
        if (this instanceof AnimateColor) {
            this.type = type;
            /*this.type一定要放在前面*/
            this._super(ele, options, value, name);
            
            //this.color = color(css.style(ele, name));
            // this.originColor = color(css.style(ele, name));
            //this.color.clone();
            //this._originCss = transformCss;
            
        }
        else {
            var _color = color(value);
            options.curCount = 3;
            return [
                new AnimateColor(ele, options, _color.red, name, "red"),
                new AnimateColor(ele, options, _color.green, name, "green"),
                new AnimateColor(ele, options, _color.blue, name, "blue")
            ];
        }
    }, {
        getStartEnd: function (value) {
            var start = this.cur()[this.type],
            end = value;

            return { start: start, end: end, unit: "" };
        }
        , cur: function () {
            return color(dom.style(this.ele, this.name));
        }
        , update: function () {
            var _color = this.cur();
            _color[this.type] = this.nowPos;
            this.ele.style[this.name] = _color.toString();
        }

    });

    if (!($.config.module.transitionToAnimation && $.support.transition)) {
        $.easyExtend(FX.custom, {
            backgroundColor: AnimateColor,
            borderColor: AnimateColor,
            color: AnimateColor
        });
    }

    return AnimateColor;
});