/// <reference path="../myquery.js" />
/*include JQuery animate*/

myQuery.define("module/animate.color", ["module/object", "module/color", "main/css", "module/fx", "module/animate"], function ($, object, color, css, FX, animate) {
    "use strict"; //启用严格模式
    var AnimateColor = object.Class(function AnimateColor(ele, options, value, name, type) {
        if (this instanceof AnimateColor) {
            AnimateColor._SupperConstructor(this, ele, options, value, name);
            this.type = type;
            this._originCss = transformCss;
        }
        else {
//            var ret = [];
//            $.each(value, function (val, key) {
//                ret.push(new Transfrom3dForFX(ele, options, val, name, key));
//            });
//            return ret;
        }
    }, {}, FX);


    $.easyExtend(FX.custom, {
        backgroundColor: AnimateColor,
        color: AnimateColor
    });

    return AnimateColor;
});