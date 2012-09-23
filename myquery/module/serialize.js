/// <reference path="../myquery.js" />

myQuery.define("module/parse", ["base/is"], function ($, is) {
    "use strict"; //启用严格模式
    var 
        createDocument = function () {
            if (typeof createDocument.activeXString != "string") {
                var i = 0, versions = ["Microsoft.XMLDOM", "MSXML2.DOMDocument.6.0", "MSXML2.DOMDocument.5.0", "MSXML2.DOMDocument.4.0", "MSXML2.DOMDocument.3.0", "MSXML2.DOMDocument"],
                len = versions.length, xmlDom;
                for (; i < len; i++) {
                    try {
                        xmlDom = new ActiveXObject(versions[i]);
                        createDocument.activeXString = versions[i];
                        return xmlDom;
                    } catch (e) {

                    }
                }
            }
            return new ActiveXObject(createDocument.activeXString);
        },
        serialize = {
            JSON: function (json) {
                /// <summary>序列化对象为JSON</summary>
                /// <param name="json" type="any">任意对象</param>
                /// <returns type="String" />
                var result = null;
                try {
                    if (window.JSON && window.JSON.stringify) {
                        result = window.JSON.stringify(json);
                    }
                    else {
                        result = $.eval(JSON);
                    }

                } catch (e) { }
                return result;
            }
            , QueryString: function (content) {
                /// <summary>序列化为查询字符串</summary>
                /// <param name="content" type="String/Object/$/Array[element]">内容可以是Object键值对，也可以是数组形式的element，也可以是myQuery对象</param>
                /// <returns type="String" />
                var list = [];
                if ($.isObj(content)) {
                    $.each(content, function (value, name) {
                        value = $.isFun(value) ? value() : value;
                        !$.isNul(value) && list.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
                    });
                    content = list.join("&");
                }
                else if ($.is$(content) || ($.isArr(content) && $.isEle(content[0]))) {
                    $.each(content, function (item) {
                        !$.isNul(item.value) && list.push(encodeURIComponent(item.name) + "=" + encodeURIComponent(item.value));
                    });
                    content = list.join("&");
                }
                else if (!$.isStr(content)) {
                    content = "";
                }
                return content;
            }
            , Xml: function (xmldom) {
                /// <summary>序列化Document</summary>
                /// <param name="xmldom" type="Document">document对象</param>
                /// <returns type="String" />
                //quote from written by Nicholas C.Zakas
                var xml = "";
                if (typeof XMLSerializer != "undefined") {
                    xml = (new XMLSerializer()).serializeToString(xmldom);
                }
                else if (document.implementation.hasFeature("LS", "3.0")) {
                    xml = document.implementation.createLSSerializer().writeToString(xmldom);
                }
                else if (typeof xmldom.xml != "undefined") {
                    return xmldom.xml;
                }
                else {
                    $.console.error({ fn: "serializeXml", info: "Could not serialize XML DOM" }, "SyntaxError");
                }
                return xml;
            }
        };

    $.serialize = serialize;

    return serialize;
});
