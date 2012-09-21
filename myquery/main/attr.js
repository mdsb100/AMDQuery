/// <reference path="../myquery.js" />

myQuery.define("main/attr", function ($, undefined) {
    "use strict"; //启用严格模式
    //暂不要那么多hooks 
    var fixSpecified = {
        name: true,
        id: true,
        coords: true
    }
    , propFix = {
        tabindex: "tabIndex",
        readonly: "readOnly",
        "for": "htmlFor",
        "class": "className",
        maxlength: "maxLength",
        cellspacing: "cellSpacing",
        cellpadding: "cellPadding",
        rowspan: "rowSpan",
        colspan: "colSpan",
        usemap: "useMap",
        frameborder: "frameBorder",
        contenteditable: "contentEditable"
    }
    , rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i
    , attr = {
        getAttr: function (ele, name) {
            var ret;
            //                if (!$.support.getSetAttribute) {
            //                    ret = ele.getAttributeNode(name);
            //                    return ret && (fixSpecified[name] ? ret.nodeValue !== "" : ret.specified) ?
            //				    ret.nodeValue :
            //				    undefined;
            //                }
            return (ret = ele.getAttributeNode(name)) ? ret.nodeValue : undefined;
        }
        , getVal: function (ele) {
            /// <summary>获得第元素的value属性
            /// <para>select、checkbox、radio例外</para>
            /// <para>select多选情况，获得是选中项的innerHTML集合用|分隔</para>
            /// <param name="ele" type="Element">element元素</param>
            /// </summary>
            /// <returns type="String" />
            var type = ele.type.toUpperCase(), result;
            if ($.nodeName(ele, "select")) {
                result = ele.value;
                if ($.isNul(result) || ele.multiple == true) {
                    result = [];
                    $(ele).children(":selected").each(function (ele) {
                        result.push(ele.innerHTML);
                    });
                    result = result.join("|");
                }
                return result;
            }
            else if ($.nodeName(ele, "select") && (type == "CHECKBOX" || type == "RADIO"))
                return ele.checked.toString();
            else
                return ele.value.toString();
        }

        , removeAttr: function (ele, value) {
            var propName, attrNames, name, l, isBool, i = 0;

            if (value && ele.nodeType === 1) {
                attrNames = value.toLowerCase().split(/\s+/);
                l = attrNames.length;

                for (; i < l; i++) {
                    name = attrNames[i];

                    if (name) {
                        propName = propFix[name] || name;
                        isBool = rboolean.test(name);

                        if (!isBool) {
                            $.setAttr(ele, name, "");
                        }
                        ele.removeAttribute($.support.getSetAttribute ? name : propName);

                        if (isBool && propName in ele) {
                            ele[propName] = false;
                        }
                    }
                }
            }
            return this;
        }

        , setAttr: function (ele, name, value) {
            if (value == null) {
                return $.removeAttr(ele, name);
            }
            //                if (!$.support.getSetAttribute) {
            //                    var ret = ele.getAttributeNode(name);
            //                    if (!ret) {
            //                        ret = document.createAttribute(name);
            //                        ele.setAttributeNode(ret);
            //                    }
            //                    ret.nodeValue = value + "";
            //                }
            //                else {
            ele.setAttribute(name, value);
            //}
            return this;
        }
        , setVal: function (ele, value) {
            /// <summary>设置第元素的value属性
            /// <para>select、checkbox、radio例外</para>
            /// <para>select多选情况，可以用数组来设置。当数组的每一项的string或num与option的innerHTML匹配时则被设置为true</para>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="value" type="Number/String/Boolean">值</param>
            /// </summary>
            /// <returns type="self" />
            var type = ele.type.toUpperCase();
            if ($.nodeName(ele, "select")) {
                if ($.isStr(value) || $.isNum(value))
                    value = [value];
                $(ele).find("option").each(function (ele) {
                    ele.selected = false;
                }).each(function (ele, index) {
                    $.each(value, function (val) {
                        if (index === val || ele.innerHTML === val)
                            ele.selected = true;
                    }, this);
                });
            }
            else if ($.nodeName(ele, "input") && (type == "CHECKBOX" || type == "RADIO")) {//将来可能用$.setAttr()
                if (value === "checked" || value === "true" || value === true)
                    ele.checked = true;
                else
                    ele.value = value.toString();
            }
            else
                ele.value = value.toString();
            return this;
        }
    };

    $.extend(attr);

    $.fn.extend({
        attr: function (attr, value) {
            /// <summary>添加或获得属性
            /// <para>如果要获得样式 返回为any</para>
            /// </summary>
            /// <param name="attr" type="Object/String">obj为赋属性 str为获得一个属性</param>
            /// <param name="value" type="String/Number/undefined">当style是字符串，并且value存在</param>
            /// <returns type="self" />
            if ($.isObj(attr)) {
                for (var i in attr) {
                    this.each(function (ele) {
                        $.setAttr(ele, i, attr[i]);
                    });
                }
            }
            else if ($.isStr(attr)) {
                if (value == undefined) {
                    return $.getAttr(this[0], attr);
                }
                else {
                    this.each(function (ele, i) {
                        $.setAttr(ele, attr, value)
                    });
                }
            }
            return this;
        }

        , removeAttr: function (name) {
            /// <summary>移除属性值</summary>
            /// <param name="name" type="String">obj为赋属性 str为获得一个属性</param>
            /// <returns type="self" />

            return this.each(function (ele) {
                $.removeAttr(ele, name);
            });
        }

        , val: function (value) {
            /// <summary>设置第一个元素的value属性
            /// <para>select、checkbox、radio例外</para>
            /// <para>select多选情况，可以用数组来设置。当数组的每一项的string或num与option的innerHTML匹配时则被设置为true</para>
            /// <param name="value" type="Number/String">值</param>
            /// </summary>
            /// <returns type="self" />
            return value ? this.each(function (ele) {
                $.setVal(ele, value);
            }) : $.getVal(this[0]);
        }
    });

    return attr;
});
