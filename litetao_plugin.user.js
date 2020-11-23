// ==UserScript==
// @name         特价淘宝订单插件PC版
// @version      0.1
// @description  特价淘宝订单插件PC版
// @author       MachineWu
// @namespace    https://github.com/machinewu/litetao_plugin
// @exclude      https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm/_____tmd_____/*
// @include      https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm*
// @require      http://g.alicdn.com/ilw/cdnjs/jquery/2.1.4/jquery.min.js
// @grant        GM_xmlhttpRequest
// @license      https://raw.githubusercontent.com/machinewu/litetao_plugin/main/LICENSE
// @supportURL   https://github.com/machinewu/litetao_plugin
// ==/UserScript==

(function($) {
    'use strict';

    var cssURL = $("link[href*='//g.alicdn.com/tp/bought/'][href$='/style.css']").eq(0).attr('href');

    if (!cssURL) {
        console.log("[ERROR] Can not found CSS URL from link tag!");
        alert("特价淘宝插件初始化失败！");
        return;
    }

    GM_xmlhttpRequest({
        method: "GET",
        url: cssURL,
        onload: function(response) {
            main(response.responseText);
        }
    });

    function main(cssText) {
        var cssClassCache = {};
        function cssClass(className) {
            if (className in cssClassCache) {
                return cssClassCache[className];
            }

            cssClassCache[className] = (new RegExp("\\." + className.replace('-', '\\-').replace('$', '\\$') + "(?:___[\\w-]+|\b)").exec(cssText) || ['.'])[0].substr(1);
            return cssClassCache[className];
        }

        function htmlEncode(s) {
            if (s.length > 0) {
                s = s.replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/ /g, "&nbsp;")
                    .replace(/\'/g, "&#39;")
                    .replace(/\"/g, "&quot;");
                    //.replace(/\n/g, "<br/>");
            }
            return s;
        }

        function createNavi() {
            var tabNavi = $("#tp-bought-root>div." + cssClass("tabs-mod__container") + ">div." + cssClass("tabs-mod__main")).eq(0);

            var divC$1$1 = cssClass("tabs-mod__main");
            var divC$2$1 = cssClass("tabs-mod__tab");
            var spanC$3$1 = cssClass("nav-mod__tab");
            var spanC$4$1 = cssClass("nav-mod__text");
            var spanC$4$2 = cssClass("nav-mod__count");

            tabNavi.after(
                "<div class='" + divC$1$1 + " litetao-plugin-tab' style='padding-top:10px;'>" +
                "  <div class='" + divC$2$1 + "' name='bill-all'>" +
                "    <span class='" + spanC$3$1 + "'>" +
                "      <span class='" + spanC$4$1 + "'>所有订单</span>" +
                "      <span class='" + spanC$4$2 + "'></span>" +
                "      <span class='" + spanC$4$2 + "' style='font-size:11px;position:absolute;left:18px;bottom:0;'>[特价淘宝]</span>" +
                "    </span>" +
                "  </div>" +
                "  <div class='" + divC$2$1 + "' name='bill-waitPay'>" +
                "    <span class='" + spanC$3$1 + "'>" +
                "      <span class='" + spanC$4$1 + "'>待付款</span>" +
                "      <span class='" + spanC$4$2 + "'></span>" +
                "      <span class='" + spanC$4$2 + "' style='font-size:11px;position:absolute;left:11px;bottom:0;'>[特价淘宝]</span>" +
                "    </span>" +
                "  </div>" +
                "  <div class='" + divC$2$1 + "' name='bill-waitSend'>" +
                "    <span class='" + spanC$3$1 + "'>" +
                "      <span class='" + spanC$4$1 + "'>待发货</span>" +
                "      <span class='" + spanC$4$2 + "'></span>" +
                "      <span class='" + spanC$4$2 + "' style='font-size:11px;position:absolute;left:11px;bottom:0;'>[特价淘宝]</span>" +
                "    </span>" +
                "  </div>" +
                "  <div class='" + divC$2$1 + "' name='bill-waitConfirm'>" +
                "    <span class='" + spanC$3$1 + "'>" +
                "      <span class='" + spanC$4$1 + "'>待收货</span>" +
                "      <span class='" + spanC$4$2 + "'></span>" +
                "      <span class='" + spanC$4$2 + "' style='font-size:11px;position:absolute;left:11px;bottom:0;'>[特价淘宝]</span>" +
                "    </span>" +
                "  </div>" +
                "  <div class='" + divC$2$1 + "' name='bill-waitRate'>" +
                "    <span class='" + spanC$3$1 + "'>" +
                "      <span class='" + spanC$4$1 + "'>待评价</span>" +
                "      <span class='" + spanC$4$2 + "'></span>" +
                "      <span class='" + spanC$4$2 + "' style='font-size:11px;position:absolute;left:11px;bottom:0;'>[特价淘宝]</span>" +
                "    </span>" +
                "  </div>" +
                "</div>"
            );

            $("div.litetao-plugin-tab>div." + cssClass("tabs-mod__tab")).bind("click", function(){
                var tabSelectedClass = cssClass("tabs-mod__selected");

                if (tabSelectedClass) {
                    $("." + tabSelectedClass).removeClass(tabSelectedClass);
                    $(this).addClass(tabSelectedClass);
                    $("#tp-bought-root>form").remove();

                    //tab是"所有订单"则添加搜索栏
                    if ($("div.litetao-plugin-tab div[name='bill-all']").hasClass(tabSelectedClass)) {
                        $("#nav_anchor").before(
                            "<form class='container'>" +
                            "  <div class='" + cssClass("search-mod__simple-part") + "'>" +
                            "    <input type='text' placeholder='输入商品标题或订单号进行搜索' class='" + cssClass("search-mod__order-search-input") + "' name='bill-search'>" +
                            "<button type='submit' class='" + cssClass("search-mod__order-search-button") + "'>订单搜索</button>" + //跟前面<input>连着不能有空格
                            /*
                            "    <button type='button' class='" + cssClass("search-mod__more-button") + "'>" +
                            "      <span>更多筛选条件</span>" +
                            "    </button>" +
                            */
                            "  </div>" +
                            "</form>"
                        );

                        $("#tp-bought-root>form").submit(function() {
                            var queryWord = $("#tp-bought-root>form input[name='bill-search']").val();
                            var queryData = {
                                "condition": JSON.stringify({"itemTitle": queryWord}),
                                "title": "搜索结果",
                                "hideTab": "true",
                                "hideSearchbar": "true",
                                "timestamp": "" + new Date().getTime(),
                                "spm": "a212db.index",
                                "page": 1,
                                "tabCode": "all",
                                "appVersion": "1.0",
                                "appName":"ltao", //"tborder" for PC
                                "fromGroup":"-1"
                            };

                            queryResult(queryData);

                            return false;
                        });
                    }

                    queryResult({
                        "tabCode": $("div.litetao-plugin-tab div." + tabSelectedClass + "[name^='bill-']").attr("name").split("-")[1],
                        "bizType": "litetao",
                        "bbid": "litetao",
                        "miniapp": "litetao",
                        "appName": "ltao", //"tborder" for PC
                        "fromGroup": "-1",
                        "page": 1,
                        "appVersion": "1.0"
                    });
                }
                else {
                    console.log("[ERROR] Can not found \"tabSelectedClass\".");
                }
            });
        }

        var jsonpCallbackCount = 1;
        function ajaxJSONP(url, callbackFunc) {
            var jsonpCallback = "mtopjsonp" + (jsonpCallbackCount++);

            //设置jsonp全局回调函数
            $('body').append($("<script id='" + jsonpCallback + "'>function " + jsonpCallback + "(data){if(!document.jsonpData)document.jsonpData={};document.jsonpData['" + jsonpCallback + "']=data;}</script>"));
            $.ajax({
                url: url,
                type: "GET",
                dataType: "jsonp",
                jsonp: "callback",
                jsonpCallback: jsonpCallback,
                scriptCharset: "utf-8",
                global: false,
                processData: false,
                complete: function() {
                    var intervalTimes = 1;
                    var interval = setInterval(function(){
                        if (jsonpCallback in document.jsonpData) {
                            clearInterval(interval);

                            //删除jsonp全局回调函数并清空全局存储
                            var responseData = document.jsonpData[jsonpCallback];
                            //delete document.jsonpData[jsonpCallback];
                            $("#" + jsonpCallback).remove();

                            callbackFunc(responseData);
                        }
                        else {
                            intervalTimes++;
                            //超时则释放interval
                            if (intervalTimes > 50) {
                                clearInterval(interval);

                                console.log("[ERROR] jsonp call " + jsonpCallback + "failure for a long time!");
                                $("#" + jsonpCallback).remove();
                            }
                        }
                    }, 100);
                }
                /*,
                success: function(data) {
                    console.log("[INFO] Ajax query success response: " + JSON.stringify(data));
                    //callbackFunc(data);
                },
                error: function(data) {
                    console.log("[ERROR] Ajax query fail: " + url + "\nresponse: " + JSON.stringify(data));
                }
                */
            });
        }

        function getDataListByBillId(groupData, billId) {
            var billIdStr = "" + billId;
            if (groupData) {
                for (var i=0; i<groupData.length; i++) {
                    if (billIdStr in groupData[i]) {
                        return groupData[i][billIdStr];
                    }
                }
            }
            return [];
        }

        function getCellDataListByCellType(dataList, cellType) {
            //return cellData(a list)
            if (dataList) {
                for (var i=0; i<dataList.length; i++) {
                    if (dataList[i].cellType == cellType) {
                        return dataList[i].cellData;
                    }
                }
            }
            return [];
        }

        function getCellDataByCellTypeAndTag(dataList, cellType, tag) {
            //return cellData(single one, a dict)
            if (dataList) {
                for (var i=0; i<dataList.length; i++) {
                    if (dataList[i].cellType == cellType) {
                        var cellDataList = dataList[i].cellData || [];
                        for (var j=0; j<cellDataList.length; j++) {
                            if (cellDataList[j].tag == tag) {
                                return cellDataList[j];
                            }
                        }
                    }
                }
            }
            return {};
        }

        function getFieldByCellTypeAndTagAndFieldName(dataList, cellType, tag, fieldName) {
            //return the value of field
            if (dataList) {
                for (var i=0; i<dataList.length; i++) {
                    if (dataList[i].cellType == cellType) {
                        var cellDataList = dataList[i].cellData || [];
                        for (var j=0; j<cellDataList.length; j++) {
                            if (cellDataList[j].tag == tag) {
                                var fieldsData = cellDataList[j].fields || {};
                                if (fieldName in fieldsData) {
                                    return fieldsData[fieldName];
                                }
                            }
                        }
                    }
                }
            }

            return null;
        }

        function compareFieldValueByCellTypeAndTagAndFieldName(dataList, cellType, tag, fieldName, compareFunc) {
            //return the true or false
            if (dataList) {
                for (var i=0; i<dataList.length; i++) {
                    var cellDataList = dataList[i].cellType;
                    if (cellDataList == cellType) {
                        for (var j=0; j<cellDataList.length; j++) {
                            if (cellDataList[j].tag == tag) {
                                var fieldsData = cellDataList[j].fields || {};
                                if (fieldName in fieldsData && compareFunc(fieldsData[fieldName])) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }

            return false;
        }

        function queryCall(baseURL, queryData, callbackFunc) {
            function sign(a) {
                function b(a, b) {
                    return a << b | a >>> 32 - b
                }

                function c(a, b) {
                    var c, d, e, f, g;
                    return e = 2147483648 & a, f = 2147483648 & b, c = 1073741824 & a, d = 1073741824 & b, g = (1073741823 & a) + (1073741823 & b), c & d ? 2147483648 ^ g ^ e ^ f : c | d ? 1073741824 & g ? 3221225472 ^ g ^ e ^ f : 1073741824 ^ g ^ e ^ f : g ^ e ^ f
                }

                function d(a, b, c) {
                    return a & b | ~a & c
                }

                function e(a, b, c) {
                    return a & c | b & ~c
                }

                function f(a, b, c) {
                    return a ^ b ^ c
                }

                function g(a, b, c) {
                    return b ^ (a | ~c)
                }

                function h(a, e, f, g, h, i, j) {
                    return a = c(a, c(c(d(e, f, g), h), j)), c(b(a, i), e)
                }

                function i(a, d, f, g, h, i, j) {
                    return a = c(a, c(c(e(d, f, g), h), j)), c(b(a, i), d)
                }

                function j(a, d, e, g, h, i, j) {
                    return a = c(a, c(c(f(d, e, g), h), j)), c(b(a, i), d)
                }

                function k(a, d, e, f, h, i, j) {
                    return a = c(a, c(c(g(d, e, f), h), j)), c(b(a, i), d)
                }

                function l(a) {
                    for (var b, c = a.length, d = c + 8, e = (d - d % 64) / 64, f = 16 * (e + 1), g = new Array(f - 1), h = 0, i = 0; c > i;) b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | a.charCodeAt(i) << h, i++;
                    return b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | 128 << h, g[f - 2] = c << 3, g[f - 1] = c >>> 29, g
                }

                function m(a) {
                    var b, c, d = "",
                        e = "";
                    for (c = 0; 3 >= c; c++) b = a >>> 8 * c & 255, e = "0" + b.toString(16), d += e.substr(e.length - 2, 2);
                    return d
                }

                function n(a) {
                    a = a.replace(/\r\n/g, "\n");
                    for (var b = "", c = 0; c < a.length; c++) {
                        var d = a.charCodeAt(c);
                        128 > d ? b += String.fromCharCode(d) : d > 127 && 2048 > d ? (b += String.fromCharCode(d >> 6 | 192), b += String.fromCharCode(63 & d | 128)) : (b += String.fromCharCode(d >> 12 | 224), b += String.fromCharCode(d >> 6 & 63 | 128), b += String.fromCharCode(63 & d | 128))
                    }
                    return b
                }
                var o, p, q, r, s, t, u, v, w, x = [],
                    y = 7,
                    z = 12,
                    A = 17,
                    B = 22,
                    C = 5,
                    D = 9,
                    E = 14,
                    F = 20,
                    G = 4,
                    H = 11,
                    I = 16,
                    J = 23,
                    K = 6,
                    L = 10,
                    M = 15,
                    N = 21;
                for (a = n(a), x = l(a), t = 1732584193, u = 4023233417, v = 2562383102, w = 271733878, o = 0; o < x.length; o += 16) p = t, q = u, r = v, s = w, t = h(t, u, v, w, x[o + 0], y, 3614090360), w = h(w, t, u, v, x[o + 1], z, 3905402710), v = h(v, w, t, u, x[o + 2], A, 606105819), u = h(u, v, w, t, x[o + 3], B, 3250441966), t = h(t, u, v, w, x[o + 4], y, 4118548399), w = h(w, t, u, v, x[o + 5], z, 1200080426), v = h(v, w, t, u, x[o + 6], A, 2821735955), u = h(u, v, w, t, x[o + 7], B, 4249261313), t = h(t, u, v, w, x[o + 8], y, 1770035416), w = h(w, t, u, v, x[o + 9], z, 2336552879), v = h(v, w, t, u, x[o + 10], A, 4294925233), u = h(u, v, w, t, x[o + 11], B, 2304563134), t = h(t, u, v, w, x[o + 12], y, 1804603682), w = h(w, t, u, v, x[o + 13], z, 4254626195), v = h(v, w, t, u, x[o + 14], A, 2792965006), u = h(u, v, w, t, x[o + 15], B, 1236535329), t = i(t, u, v, w, x[o + 1], C, 4129170786), w = i(w, t, u, v, x[o + 6], D, 3225465664), v = i(v, w, t, u, x[o + 11], E, 643717713), u = i(u, v, w, t, x[o + 0], F, 3921069994), t = i(t, u, v, w, x[o + 5], C, 3593408605), w = i(w, t, u, v, x[o + 10], D, 38016083), v = i(v, w, t, u, x[o + 15], E, 3634488961), u = i(u, v, w, t, x[o + 4], F, 3889429448), t = i(t, u, v, w, x[o + 9], C, 568446438), w = i(w, t, u, v, x[o + 14], D, 3275163606), v = i(v, w, t, u, x[o + 3], E, 4107603335), u = i(u, v, w, t, x[o + 8], F, 1163531501), t = i(t, u, v, w, x[o + 13], C, 2850285829), w = i(w, t, u, v, x[o + 2], D, 4243563512), v = i(v, w, t, u, x[o + 7], E, 1735328473), u = i(u, v, w, t, x[o + 12], F, 2368359562), t = j(t, u, v, w, x[o + 5], G, 4294588738), w = j(w, t, u, v, x[o + 8], H, 2272392833), v = j(v, w, t, u, x[o + 11], I, 1839030562), u = j(u, v, w, t, x[o + 14], J, 4259657740), t = j(t, u, v, w, x[o + 1], G, 2763975236), w = j(w, t, u, v, x[o + 4], H, 1272893353), v = j(v, w, t, u, x[o + 7], I, 4139469664), u = j(u, v, w, t, x[o + 10], J, 3200236656), t = j(t, u, v, w, x[o + 13], G, 681279174), w = j(w, t, u, v, x[o + 0], H, 3936430074), v = j(v, w, t, u, x[o + 3], I, 3572445317), u = j(u, v, w, t, x[o + 6], J, 76029189), t = j(t, u, v, w, x[o + 9], G, 3654602809), w = j(w, t, u, v, x[o + 12], H, 3873151461), v = j(v, w, t, u, x[o + 15], I, 530742520), u = j(u, v, w, t, x[o + 2], J, 3299628645), t = k(t, u, v, w, x[o + 0], K, 4096336452), w = k(w, t, u, v, x[o + 7], L, 1126891415), v = k(v, w, t, u, x[o + 14], M, 2878612391), u = k(u, v, w, t, x[o + 5], N, 4237533241), t = k(t, u, v, w, x[o + 12], K, 1700485571), w = k(w, t, u, v, x[o + 3], L, 2399980690), v = k(v, w, t, u, x[o + 10], M, 4293915773), u = k(u, v, w, t, x[o + 1], N, 2240044497), t = k(t, u, v, w, x[o + 8], K, 1873313359), w = k(w, t, u, v, x[o + 15], L, 4264355552), v = k(v, w, t, u, x[o + 6], M, 2734768916), u = k(u, v, w, t, x[o + 13], N, 1309151649), t = k(t, u, v, w, x[o + 4], K, 4149444226), w = k(w, t, u, v, x[o + 11], L, 3174756917), v = k(v, w, t, u, x[o + 2], M, 718787259), u = k(u, v, w, t, x[o + 9], N, 3951481745), t = c(t, p), u = c(u, q), v = c(v, r), w = c(w, s);
                var O = m(t) + m(u) + m(v) + m(w);
                return O.toLowerCase()
            }

            function getTokenFromCookie() {
                var x = "_m_h5_c",
                    y = "_m_h5_tk",
                    z = "_m_h5_tk_enc";

                function k(a) {
                    var b = new RegExp("(?:^|;\\s*)" + a + "\\=([^;]+)(?:;\\s*|$)").exec(document.cookie);
                    return b ? b[1] : void 0
                }

                if (k(x)) {
                    return k(x).split(";")[0].split("_")[0];
                }
                else if (k(y)) {
                    return k(y).split("_")[0];
                }
                else {
                    return k(y);
                }
            }

            var url = baseURL;
            var appKey = "12574478";
            var queryTimeMills = new Date().getTime();
            var queryDataStr = JSON.stringify(queryData);

            if (!/\?/.test(url)) {
                url += "?"
            }
            url += "&appKey=" + appKey;
            //url += "&callback=mtopjsonp";
            url += "&t=" + queryTimeMills;
            url += "&sign=" + sign(getTokenFromCookie() + "&" + queryTimeMills + "&" + appKey + "&" + queryDataStr);
            url += "&data=" + encodeURIComponent(queryDataStr);

            ajaxJSONP(url, callbackFunc);
        }

        function queryResult(queryData) {
            var boughtListBaseURL = "https://h5api.m.taobao.com/h5/mtop.order.queryboughtlist/4.0/?jsv=2.5.1&api=mtop.order.queryboughtlist&v=4.0&ttid=%23%23h5&isSec=0&ecode=1&AntiFlood=true&AntiCreep=true&LoginRequest=true&needLogin=true&H5Request=true&type=jsonp&dataType=jsonp";
            queryCall(boughtListBaseURL, queryData, function(data) {
                $("#tp-bought-root>div." + cssClass("index-mod__order-container")).remove();
                $("#tp-bought-root>div." + cssClass("index-mod__empty-list")).remove();
                $("[id^='litetao-plugin-viewLogistics-billId_']").remove();

                if (!checkDataAvailable(data)) {
                    data = null;
                }

                var pageInfo = jsonDataToPageData(data);
                $("div.litetao-plugin-tab>div." + cssClass("tabs-mod__selected") + ">span>span." + cssClass("nav-mod__count")).eq(0).text(pageInfo.totalNumber || "");

                $("#tp-bought-root>div.js-actions-row-top").after(jsonDataToHTML(data));

                $("#tp-bought-root [name='litetao-plugin-viewLogistics']").hover(function(){
                    var $this = $(this);
                    var detailLogisticsURL = $this.attr('href');
                    var billId = (/trade_id=(\d+)/.exec(detailLogisticsURL) || [null, null])[1];
                    if (!billId) {
                        alert("查询物流信息时候获取订单号失败！");
                        return;
                    }

                    var logisticsIdKey = "litetao-plugin-viewLogistics-billId_" + billId;
                    var $oldLogistics = $("#" + logisticsIdKey);
                    var position = $this.offset();

                    if ($oldLogistics.length > 0) {
                        $oldLogistics.show();
                    }
                    else {
                        //先新建一条进行锁定，防止重复请求
                        $oldLogistics = $("<div id='" + logisticsIdKey + "' style='position:absolute; top:0px; left:0px; width:100%;'></div>");
                        $("body").append($oldLogistics);

                        var logisticsQueryURL = "//buyertrade.taobao.com/trade/json/transit_step.do?bizOrderId=" + billId;

                        $.ajax({
                            url: logisticsQueryURL,
                            type: "GET",
                            dataType: "json",
                            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                            global: false,
                            processData: false,
                            success: function(logisticsData) {
                                //console.log("[DEBUG] hover data:" + JSON.stringify(logisticsData));

                                var logisticsHTML = "";
                                logisticsHTML += "" +
                                    "<div>" +
                                    "  <div class='tm-tooltip tm-tooltip-placement-bottom' style='left:" + (position.left - 108) + "px; top:" + (position.top + 14) + "px;'>" +
                                    "    <div class='tm-tooltip-content'>" +
                                    "      <div class='tm-tooltip-arrow'></div>" +
                                    "      <div class='tm-tooltip-inner'>" +
                                    "        <div class='" + cssClass("logistics-info-mod__container") + "'>";

                                if ("" + logisticsData.isSuccess == "true") {
                                    logisticsHTML += "" +
                                        "          <div class='" + cssClass("logistics-info-mod__header") + "'>" +
                                        "            <span>" + logisticsData.expressName + "</span><span>：</span><span>" + logisticsData.expressId + "</span>" +
                                        "          </div>" +
                                        "          <ul class='" + cssClass("logistics-info-mod__list") + "'>";

                                    logisticsData.address.forEach(function(addressItem, addressItemIndex) {
                                        if (addressItemIndex < 2) {
                                            logisticsHTML += "" +
                                                "            <li class='" + cssClass("logistics-info-mod__item") + " " + (addressItemIndex == 0 ? cssClass("logistics-info-mod__first"): "") + "'>" +
                                                "              <p>" + (addressItem.place || "") + "</p>" +
                                                "              <p>" + (addressItem.time || "") + "</p>" +
                                                "            </li>";
                                        }
                                    });

                                    logisticsHTML += "" +
                                        "            <li class='" + cssClass("logistics-info-mod__item") + "'>" +
                                        "              <p>" +
                                        "                <span>" +
                                        "                  <span>以上为最新跟踪信息</span><a target='_blank' rel='noreferrer noopener' href='" + htmlEncode(detailLogisticsURL) + "'>查看全部</a>" +
                                        "                </span>" +
                                        "              </p>" +
                                        "              <p></p>" +
                                        "            </li>" +
                                        "          </ul>";

                                    var lastAddressItem = logisticsData.address[logisticsData.address.length-1];
                                    if (/下单/.test(lastAddressItem.place) && lastAddressItem.time) {
                                        var $b = $this.parentsUntil("div." + cssClass("index-mod__order-container")).last();
                                        var $e = $b.find("[name='litetao-plugin-billCreateTime']");
                                        if (!$e.text()) {
                                            $e.attr("style", $e.attr("style").replace(/padding-right:[^;]+/, "")).text(lastAddressItem.time.split(" ")[0]);
                                        }

                                        if (logisticsData.address.length-3>=0 && logisticsData.address[logisticsData.address.length-2].time && $b.find("[name='litetao-plugin-op-confirmGood']").is(":visible")) {
                                            //默认收货时间是10天(快递是10天，平邮是30天，海外直邮是20天)
                                            var leaveTime = Math.max(0, new Date(logisticsData.address[logisticsData.address.length-2].time).getTime() + 10 * 86400 * 1000 - new Date().getTime());

                                            $b.find("[name='litetao-plugin-op-leaveConfirmTimeText']").text("预估还剩" + Math.floor(leaveTime / 1000 / 86400) + "天" +  Math.floor(leaveTime / 1000 % 86400 / 3600) + "时");
                                            $b.find("[name='litetao-plugin-op-leaveConfirmTime']").show();
                                        }
                                    }
                                }
                                else {
                                    console.log("[ERROR] Logistics Query fail: " + logisticsQueryURL + "\nresponse: " + JSON.stringify(logisticsData));
                                    logisticsHTML += "" +
                                        "          <ul class='" + cssClass("logistics-info-mod__list") + "'>" +
                                        "            <li class='" + cssClass("logistics-info-mod__item") + " " + cssClass("logistics-info-mod__first") + "'>" +
                                        "              <p>获取物流信息失败</p>"
                                        "            </li>" +
                                        "          </ul>";
                                }

                                logisticsHTML += "" +
                                    "        </div>" +
                                    "      </div>" +
                                    "    </div>" +
                                    "  </div>" +
                                    "</div>" +

                                $oldLogistics.html(logisticsHTML);
                                $oldLogistics.hover(function(){
                                }, function(){
                                    $oldLogistics.hide();
                                });
                            },
                            error: function(responseData) {
                                console.log("[ERROR] Ajax query fail: " + logisticsQueryURL + "\nresponse: " + JSON.stringify(responseData));
                                alert("请求物流信息失败！");
                            }
                        });
                    }
                }, function() {
                });

                /*
                // 独立请求填充订单呢日期和确认收货剩余时间
                // 由于请求量大会被淘宝ban，所以不请求了
                $("div." + cssClass("index-mod__order-container")).each(function() {
                    var $this = $(this);
                    var billId = $this.find("span[name='litetao-plugin-billId']").text();

                    if (billId) {
                        var billDetailBaseURL = "https://h5api.m.taobao.com/h5/mtop.order.querydetail/4.0/?jsv=2.6.1&api=mtop.order.querydetail&v=4.0&ttid=2018%40taobao_h5_7.9.1&isSec=0&ecode=0&AntiFlood=true&AntiCreep=true&LoginRequest=true&needLogin=true&LoginRequest=true&H5Request=true&type=jsonp&dataType=jsonp";
                        queryCall(billDetailBaseURL, {
                            "appVersion": "1.0",
                            "appName": "ltao",
                            "bizOrderId": "" + billId
                        }, function(responseData) {
                            if (!checkDataAvailable(responseData)) {
                                return;
                            }

                            var billDetailData = jsonDataToBillListData(responseData)[0];

                            if (billDetailData.date) {
                                var e = $this.find("[name='litetao-plugin-billCreateTime']");
                                e.attr("style", e.attr("style").replace(/padding-right:[^;]+/, "")).text(billDetailData.date);
                            }

                            if (billDetailData.leaveConfirmTimeText) {
                                $this.find("[name='litetao-plugin-op-leaveConfirmTimeText']").text(billDetailData.leaveConfirmTimeText);
                                $this.find("[name='litetao-plugin-op-leaveConfirmTime']").show();
                            }

                            (billDetailData.operatorList ||[]).forEach(function(operator) {
                                $this.find("[name='litetao-plugin-op-" + operator + "']").show();
                            });
                        });
                    }
                    else {
                        console.log("[ERROR]找不到billId:\n" + this);
                    }
                });
                */

                $("#tp-bought-root>div.js-actions-row-top>div>div." + cssClass("simple-pagination-mod__container")).replaceWith(
                    "<div class='" + cssClass("simple-pagination-mod__container") + "'>" +
                    "  <button name='page-prev' class='" + cssClass("button-mod__button") + " " + cssClass("button-mod__default") + " " + cssClass("button-mod__small") + " " + cssClass("simple-pagination-mod__prev") + "' " + (pageInfo.currentPage <= 1 ? "disabled": "") + ">上一页</button>" +
                    "  <button name='page-next' class='" + cssClass("button-mod__button") + " " + cssClass("button-mod__default") + " " + cssClass("button-mod__small") + "' " + (pageInfo.currentPage >= pageInfo.totalPage ? "disabled": "") + ">下一页</button>" +
                    "</div>"
                );

                var i = 0;
                var paginationHTML = "";
                paginationHTML += "<ul class='pagination' unselectable='unselectable'>";
                paginationHTML += "  <li title='上一页' class='" + (pageInfo.currentPage <= 1 ? "pagination-disabled ": "") + "pagination-prev' name='page-prev'><a></a></li>";

                if (pageInfo.currentPage <= 4) {
                    for (i=1; i<pageInfo.currentPage; i++) {
                        paginationHTML += "  <li title='" + i + "' class='pagination-item pagination-item-" + i + "'><a>" + i + "</a></li>";
                    }
                }
                else {
                    paginationHTML += "  <li title='1' class='pagination-item pagination-item-1'><a>1</a></li>";
                    paginationHTML += "  <li title='向前 5 页' class='pagination-jump-prev'><a></a></li>";
                    paginationHTML += "  <li title='" + (pageInfo.currentPage - 2) + "' class='pagination-item pagination-item-" + (pageInfo.currentPage - 2) + "'><a>" + (pageInfo.currentPage - 2) + "</a></li>";
                    paginationHTML += "  <li title='" + (pageInfo.currentPage - 1) + "' class='pagination-item pagination-item-" + (pageInfo.currentPage - 1) + "'><a>" + (pageInfo.currentPage - 1) + "</a></li>";
                }

                if (pageInfo.totalNumber) {
                    paginationHTML += "  <li title='" + pageInfo.currentPage + "' class='pagination-item pagination-item-" + pageInfo.currentPage + " pagination-item-active'><a>" + pageInfo.currentPage + "</a></li>";
                }

                if (pageInfo.totalPage - pageInfo.currentPage <= 4) {
                    for (i=pageInfo.currentPage+1; i<=pageInfo.totalPage; i++) {
                        paginationHTML += "  <li title='" + i + "' class='pagination-item pagination-item-" + i + "'><a>" + i + "</a></li>";
                    }
                }
                else {
                    paginationHTML += "  <li title='" + (pageInfo.currentPage + 1) + "' class='pagination-item pagination-item-" + (pageInfo.currentPage + 1) + "'><a>" + (pageInfo.currentPage + 1) + "</a></li>";
                    paginationHTML += "  <li title='" + (pageInfo.currentPage + 2) + "' class='pagination-item pagination-item-" + (pageInfo.currentPage + 2) + "'><a>" + (pageInfo.currentPage + 2) + "</a></li>";
                    paginationHTML += "  <li title='向后 5 页' class='pagination-jump-next'><a></a></li>";
                    paginationHTML += "  <li title='" + pageInfo.totalPage + "' class='pagination-item pagination-item-" + pageInfo.totalPage + "'><a>" + pageInfo.totalPage + "</a></li>";
                }

                paginationHTML += "  <li title='下一页' class='" + (pageInfo.currentPage >= pageInfo.totalPage ? "pagination-disabled ": "") + "pagination-next' name='page-next'><a></a></li>";

                if (pageInfo.totalNumber) {
                    paginationHTML += "" +
                        "  <div class='pagination-options'>" +
                        "    <div title='跳转到' class='pagination-options-quick-jumper'>" +
                        "      <span>跳至</span><input type='text' value='" + pageInfo.currentPage + "'><span>页</span><span class='pagination-options-go'>跳转</span>" +
                        "    </div>" +
                        "  </div>";
                }

                paginationHTML += "</ul>";

                $("#tp-bought-root>div.js-actions-row-bottom>div>ul.pagination").replaceWith(paginationHTML);

                $("[name='page-prev']").bind("click", function(){
                    if (pageInfo.currentPage > 1) {
                        queryData.page = pageInfo.currentPage - 1;
                        queryResult(queryData);
                    }
                });

                $("[name='page-next']").bind("click", function(){
                    if (pageInfo.currentPage < pageInfo.totalPage) {
                        queryData.page = pageInfo.currentPage + 1;
                        queryResult(queryData);
                    }
                });

                $("li.pagination-item[title]").bind("click", function(){
                    queryData.page = $(this).attr('title');
                    queryResult(queryData);
                });

                $("li.pagination-jump-prev").bind("click", function(){
                    queryData.page = Math.max(pageInfo.currentPage - 5, 1);
                    queryResult(queryData);
                });

                $("li.pagination-jump-next").bind("click", function(){
                    queryData.page = Math.min(pageInfo.currentPage + 5, pageInfo.totalPage);
                    queryResult(queryData);
                });

                function pageJump() {
                    if (/^\d+$/.test($("div.pagination-options-quick-jumper>input").val())) {
                        queryData.page = Math.max(Math.min($("div.pagination-options-quick-jumper>input").val(), pageInfo.totalPage), 1);
                        queryResult(queryData);
                    }
                    else {
                        alert("输入页码有误，请重新输入！");
                        $("div.pagination-options-quick-jumper>input").val(pageInfo.currentPage);
                    }
                }

                $("div.pagination-options-quick-jumper>input").bind("keypress", function(event){
                    if(event.keyCode == "13") {
                        pageJump();
                    }
                });

                $('span.pagination-options-go').bind("click", function(){
                    pageJump();
                });
            });
        }

        function checkDataAvailable(jsonData) {
            if (!(jsonData && jsonData.ret && jsonData.ret.length>0)) {
                alert("请求数据失败！可能是网络的原因导致的。");
            }
            else {
                if (/^SUCCESS::/.test(jsonData.ret[0])) {
                    return true;
                }
                alert("请求数据失败！原因：" + jsonData.ret[0]);
            }
            return false;
        }

        function jsonDataToPageData(jsonData) {
            if (!jsonData) {
                return {
                    "currentPage": 0,
                    "pageSize": 0,
                    "totalPage": 0,
                    "prefetchCount": 0,
                    "totalNumber": 0
                };
            }

            var pageInfo = jsonData.data.data.meta.page.fields;

            return {
                "currentPage": parseInt(pageInfo.currentPage),
                "pageSize": parseInt(pageInfo.pageSize),
                "totalPage": parseInt(pageInfo.totalPage),
                "prefetchCount": parseInt(pageInfo.prefetchCount),
                "totalNumber": parseInt(pageInfo.totalNumber)
            };
        }

        function jsonDataToBillListData(jsonData) {
            var billDataList = [];

            if (!jsonData) {
                return billDataList;
            }

            jsonData.data.data.group.forEach(function(billContent) {
                Object.keys(billContent).forEach(function(billId) {
                    var billItemsContent = billContent[billId];
                    var billInfo = getCellDataByCellTypeAndTag(billItemsContent, "storage", "storage").fields || {};
                    var billStepInfo = getCellDataByCellTypeAndTag(billItemsContent, "orderinfo", "orderinfo").fields || {};
                    var sellerInfo = getCellDataByCellTypeAndTag(billItemsContent, "head", "seller").fields || {};
                    var payInfo = getCellDataByCellTypeAndTag(billItemsContent, "pay", "pay").fields || {};
                    var payDetailInfo = getCellDataByCellTypeAndTag(billItemsContent, "paydetail", "paydetail").fields || {};
                    var billOperatorInfo = getCellDataByCellTypeAndTag(billItemsContent, "orderop", "orderop").fields || {};

                    // console.log("[DEBUG] billInfo:" + JSON.stringify(billInfo));
                    // console.log("[DEBUG] sellerInfo:" + JSON.stringify(sellerInfo));
                    // console.log("[DEBUG] payInfo:" + JSON.stringify(payInfo));
                    // console.log("[DEBUG] billOperatorInfo:" + JSON.stringify(billOperatorInfo));

                    if (billInfo.mainOrderId != billId) {
                        console.log("[ERROR] mainOrderId != billId  ('" + billInfo.mainOrderId + "' != '" + billId + "')");
                    }

                    var insuranceServiceFlag = false;
                    var billItemList = [];
                    billItemsContent.filter(function(x){return x.cellType == "sub";}).forEach(function(cellContent, cellContentIndex) {
                        // console.log("[DEBUG] cellContent:" + JSON.stringify(cellContent));

                        var itemContent = ((cellContent.cellData || []).filter(function(x){return x.tag == "item";}) || [{}])[0];
                        var itemInfo = itemContent.fields;
                        var idPositionIndex = parseInt(itemContent.id.split('_')[1]) - 1;  //从1开始, 减去1，变成从0开始
                        var isServiceItem = false;

                        if (itemInfo.title == "保险服务") {
                            insuranceServiceFlag = true;
                        }

                        if ((!itemInfo.pic && /服务/.test(itemInfo.title) && cellContentIndex > 0) || parseInt(billInfo.subOrderIds[idPositionIndex] || "-1") <= 0) {
                            isServiceItem = true;
                        }

                        billItemList.push({
                            itemId: billInfo.subAuctionIds[idPositionIndex],
                            skuId: billInfo.subItemSkuIds[idPositionIndex],
                            subBillId: billInfo.subOrderIds[idPositionIndex],
                            itemImg: (itemInfo.pic || "").replace(/_\d+x\d+\.jpg$/, "_80x80.jpg"),
                            title: itemInfo.title || "",
                            skuText: itemInfo.skuText || "",
                            extraDesc: (itemInfo.extraDesc || []).map(function(x){return {name: x.name, value: x.value}}),
                            actualPrice: ((itemInfo.priceInfo || {}).actualTotalFee || "").replace(/^[^\d\.]+/g, ""),
                            price: ((itemInfo.priceInfo || {}).promotion || "0.00").replace(/^[^\d\.]+/g, ""),
                            quantity: itemInfo.quantity || "",
                            refundStatus: itemInfo.refundStatus || "",
                            isServiceItem: isServiceItem
                        });
                    });

                    var billData = {
                        billId: billId,
                        date: ((getFieldByCellTypeAndTagAndFieldName(billItemsContent, "orderinfo", "orderinfo", "createTime") || {}).value || "").split(" ")[0],
                        isB2C: "" + billInfo.isB2C == "true",
                        sellerId: billInfo.sellerId || sellerInfo.id,
                        sellerNick: billInfo.sellerNick || sellerInfo.nick || "",
                        shopName: sellerInfo.shopName || "",
                        shopImg: sellerInfo.shopImg || "",
                        status: getFieldByCellTypeAndTagAndFieldName(billItemsContent, "head", "status", "text") || "",
                        actualFee: ((payDetailInfo.actualFee || {}).value || (payInfo.actualFee || {}).value || "").replace(/^[^\d\.]+/g, ""),
                        postFee: ((payDetailInfo.postFees || [{name: "运费", value: ""}]).filter(function(x){return x.name == "运费";})[0].value || "").replace(/^[^\d\.]+/g, ""),
                        totalFee: ((payDetailInfo.totalProductPrice || {}).value || (payInfo.totalFee || {}).value || "0.00").replace(/^[^\d\.]+/g, ""),
                        //discountFee: ((payInfo.discountFee || {}).value || "").replace(/^[^\d\.]+/g, ""),
                        insuranceServiceExists: insuranceServiceFlag,
                        leaveConfirmTimeText: (getFieldByCellTypeAndTagAndFieldName(billItemsContent, "status", "status", "extra") || {}).orderTimeout || "",
                        operatorList: getFieldByCellTypeAndTagAndFieldName(billItemsContent, "orderop", "orderop", "values") || [],
                        itemList: billItemList
                    };

                    billDataList.push(billData);
                });
            });

            return billDataList;
        }

        function jsonDataToHTML(jsonData) {
            var emptyListHTMLContent = "" +
                "<div class='" + cssClass("index-mod__empty-list") + " js-empty-list'>" +
                "  <img class='" + cssClass("index-mod__empty-list-img") + "' src='//img.alicdn.com/tps/i3/T1MQ1cXhtiXXXXXXXX-78-120.png'>" +
                "  <span>没有符合条件的宝贝，请尝试其他搜索条件。</span>" +
                "</div>";

            if (!jsonData) {
                return emptyListHTMLContent;
            }

            var htmlContent = "";
            var billListData = jsonDataToBillListData(jsonData);

            //console.log("[DEBUG] billListData: " + JSON.stringify(billListData));
            billListData.forEach(function(billData) {
                var billHTML = "";
                var finishedBillFlag = /交易关闭|交易成功/.test(billData.status);

                // 订单行头
                billHTML += "" +
                    "<div class='" + cssClass("index-mod__order-container") + " js-order-container'>" +
                    "  <div class='" + cssClass("bought-wrapper-mod__trade-order") + " " + (finishedBillFlag ? cssClass("bought-wrapper-mod__closed"): "") + "'>" +
                    "    <table class='" + cssClass("bought-table-mod__table") + " " + cssClass("bought-wrapper-mod__table") + "'>" +
                    "      <colgroup>" +
                    "        <col class='" + cssClass("bought-table-mod__col1") + "'>" +
                    "        <col class='" + cssClass("bought-table-mod__col2") + "'>" +
                    "        <col class='" + cssClass("bought-table-mod__col3") + "'>" +
                    "        <col class='" + cssClass("bought-table-mod__col4") + "'>" +
                    "        <col class='" + cssClass("bought-table-mod__col5") + "'>" +
                    "        <col class='" + cssClass("bought-table-mod__col6") + "'>" +
                    "        <col class='" + cssClass("bought-table-mod__col7") + "'>" +
                    "      </colgroup>";

                billHTML += "<tbody class='" + cssClass("bought-wrapper-mod__head") + "'><tr>";

                // 时间（无）+订单号
                billHTML += "" +
                    "<td class='" + cssClass("bought-wrapper-mod__head-info-cell") + "'>" +
                    "  <label class='" + cssClass("bought-wrapper-mod__checkbox-label") + "'>" +
                    "    <span class='" + cssClass("bought-wrapper-mod__checkbox") + "'><input type='checkbox' disabled></span>" +
                    "    <span name='litetao-plugin-billCreateTime' class='" + cssClass("bought-wrapper-mod__create-time") + "' style='padding-right:6em;'>" + billData.date + "</span>" + //接口没有订单时间，设置个padding-right对齐
                    "  </label>" +
                    "  <span>" +
                    "    <span>订单号</span>" +
                    "    <span>: </span>" +
                    "    <span name='litetao-plugin-billId'>" + billData.billId + "</span>" +
                    "  </span>" +
                    "</td>";

                // 卖家标识
                var shopURL = "//store.taobao.com/shop/view_shop.htm?user_number_id=" + billData.sellerId;
                var shopImgChangeMap = {
                    "//gtd.alicdn.com/tps/i4/TB1f.8ZFVXXXXXvaXXXEDhGGXXX-32-32.png": " ",  //淘宝店
                    "//gw.alicdn.com/tfs/TB1LmH7SXXXXXXYXFXXXXXXXXXX-63-63.png": "//gtd.alicdn.com/tps/i2/TB1aJQKFVXXXXamXFXXEDhGGXXX-32-32.png",  //天猫店
                    "//img.alicdn.com/tps/i1/TB1PsTiHVXXXXcXXXXXsYU.HpXX-55-64.png": "//img.alicdn.com/gtd.alicdn.com(trade)/tps/i2/TB1Yta.HVXXXXX3XFXXAz6UFXXX-16-16.png",  //企业店
                };
                billHTML += "" +
                    "<td colspan='2' class='" + cssClass("bought-wrapper-mod__seller-container") + "'>" +
                    "  <span class='" + cssClass("seller-mod__container") + "'>" +
                    "    <img class='" + cssClass("seller-mod__icon") + "' src='" + (shopImgChangeMap[billData.shopImg] || billData.shopImg) + "'>" +
                    "    <a target='_blank' rel='noopener noreferrer' class='" + cssClass("seller-mod__name") + "' title='" + billData.sellerNick + "' href='" + htmlEncode(shopURL) + "'>" + billData.sellerNick + "</a>" +
                    "  </span>" +
                    "</td>";

                // 旺旺是否在线（无）
                var wangwangURL = "https://amos.alicdn.com/getcid.aw?v=3&groupid=0&s=1&charset=utf-8&uid=" + encodeURIComponent(billData.sellerNick) + "&site=cntaobao"; // + "&fromid=cntaobao";
                billHTML += "" +
                    "<td>" +
                    "  <span id='webww1'>" +
                    "    <span class='ww-light ww-large' data-display='inline'>" +
                    "      <a target='_blank' class='ww-inline ww-online' title='点此可以直接和卖家交流选好的宝贝，或相互交流网购体验，还支持语音视频噢。' href='" + htmlEncode(wangwangURL) + "'>" +
                    "        <span>旺旺在线</span>" + //不能确定是否在线
                    "      </a>" +
                    "    </span>" +
                    "  </span>" +
                    "</td>";

                // 卖了换钱&编辑&删除订单标记
                var resellURL = "//sell.2.taobao.com/publish/outer_site_resell.htm?isArchive=false&bizOrderId=" + billData.billId;
                var markURL = "//trade.taobao.com/trade/memo/update_buy_memo.htm?bizOrderId=" + billData.billId;
                billHTML += "" +
                    "<td colspan='3' class='" + cssClass("bought-wrapper-mod__thead-operations-container") + "'>" +
                    "  <span></span>" +
                    "  <a id='resell' title='卖了换钱' target='_blank' rel='noopener noreferrer' class='" + cssClass("bought-wrapper-mod__th-operation") + "' href='" + htmlEncode(resellURL) + "' " + (billData.operatorList.indexOf("resell") > -1 ? "" : "style='display:none;'") + ">" +
                    "    <i style='height:17px;width:1px;padding-left:17px;overflow:hidden;vertical-align:middle;font-size:0px;display:inline-block;background:url(//img.alicdn.com/tps/i1/TB1heyGFVXXXXXpXXXXR3Ey7pXX-550-260.png) no-repeat -270px -177px;'></i>" +
                    "  </a>" +
                    "  <a id='flag' title='编辑标记信息，仅自己可见' target='_blank' rel='noopener noreferrer' class='" + cssClass("bought-wrapper-mod__th-operation") + "' href='" + htmlEncode(markURL) + "'>" +
                    "    <i style='height:17px;width:1px;padding-left:17px;overflow:hidden;vertical-align:middle;font-size:0px;display:inline-block;background:url(//img.alicdn.com/tps/i1/TB1heyGFVXXXXXpXXXXR3Ey7pXX-550-260.png) no-repeat " + (finishedBillFlag ? "-176px": "-30px") + " -176px;'></i>" +
                    "  </a>" +
                    "  <a href='javascript:void(0);' id='delOrder' title='删除订单' target='_blank' rel='noopener noreferrer' class='always-visible " + cssClass("bought-wrapper-mod__th-operation") + "' " + (billData.operatorList.indexOf("delOrder") > -1 ? "" : "style='display:none;'") + ">" +
                    "    <i style='height:17px;width:1px;padding-left:17px;overflow:hidden;vertical-align:middle;font-size:0px;display:inline-block;visibility:visible;background:url(//img.alicdn.com/tps/i1/TB1heyGFVXXXXXpXXXXR3Ey7pXX-550-260.png) no-repeat -239px -176px;'></i>" +
                    "  </a>" +
                    "</td>";

                billHTML += "</tr></tbody><tbody>";

                billData.itemList.forEach(function(itemData, itemDataIndex) {
                    //商品图片标题
                    var itemURL = "//item.taobao.com/item.htm?id=" + itemData.itemId;
                    var snapShotURL = "//buyertrade.taobao.com/trade/detail/tradeSnap.htm?snapShot=true&tradeID=" + itemData.subBillId;
                    var insuranceServiceURL = "//prod-baoxian.taobao.com/item/query.htm?bizOrderId=" + billData.billId;

                    if (!itemData.isServiceItem) {
                        billHTML += "" +
                            "<tr>" +
                            "  <td class='" + cssClass("sol-mod__no-br") + "'>" +
                            "    <div class='" + cssClass("ml-mod__container") + " " + cssClass("production-mod__production") + " " + cssClass("suborder-mod__production") + "'>" +
                            "      <div class='" + cssClass("ml-mod__media") + "' style='width:80px;'>" +
                            "        <a target='_blank' rel='noopener noreferrer' class='" + cssClass("production-mod__pic") + "' href='" + htmlEncode(itemURL) + "'>" +
                            "          <img src='" + itemData.itemImg + "'>" +
                            "          <span> </span>" +
                            "        </a>" +
                            "      </div>" +
                            "      <div style='margin-left:90px;'>" +
                            "        <p>" +
                            "          <a target='_blank' rel='noopener noreferrer' href='" + htmlEncode(itemURL) + "'>" +
                            "            <span> </span>" +
                            "            <span style='line-height:16px;'>" + itemData.title + "</span>" +
                            "            <span> </span>" +
                            "          </a>" +
                            "          <a target='_blank' rel='noopener noreferrer' href='" + htmlEncode(snapShotURL) + "'> [交易快照] </a>" +
                            "          <span> </span>" +
                            "          <span> </span>" +
                            "        </p>" +
                            "        <p>" +
                            "          <span class='" + cssClass("production-mod__sku-item") + "'>" +
                            "            <span>" + (itemData.skuText ? itemData.skuText : "") + "</span>" +
                            "            <span></span>" +
                            "            <span></span>" +
                            "          </span>" +
                            "        </p>" +
                            "        <p>" +  //"正品保证"之类的标记（无）
                            "        </p>" +
                            "        <p>" +
                            itemData.extraDesc.map(function(x){return "<span>" + ((x.name + "：") || "") + "</span><span>" + (x.value || "") + "</span>"}).join("          ") +
                            "        </p>" +
                            "      </div>" +
                            "    </div>" +
                            "  </td>";
                    }
                    else {
                        //保险、安装之类的服务
                        billHTML += "" +
                            "<tr>" +
                            "  <td class='" + cssClass("sol-mod__no-br") + "'>" +
                            "    <div class='" + cssClass("ml-mod__container") + " " + cssClass("production-mod__production") + " " + cssClass("suborder-mod__production") + "'>" +
                            "      <div class='" + cssClass("ml-mod__media") + "' style='width:0px;'></div>" +
                            "      <div style='margin-left:0px;'>" +
                            "        <p>" +
                            "          <a target='_blank' rel='noopener noreferrer' href='" + (itemData.title == "保险服务" ? htmlEncode(insuranceServiceURL): "javascript:void(0);") + "'>" +
                            "            <span> </span>" +
                            "            <span style='line-height:16px;'>" + itemData.title + "</span>" +
                            "            <span> </span>" +
                            "          </a>" +
                            "          <span></span>" +
                            "          <span></span>" +
                            "          <span></span>" +
                            "        </p>" +
                            "      </div>" +
                            "    </div>" +
                            "  </td>";
                    }

                    //价格
                    billHTML += "" +
                        "  <td class='" + cssClass("sol-mod__no-br") + "'>" +
                        "    <div class='" + cssClass("price-mod__price") + "'>" +
                        "      <p " + (itemData.actualPrice && itemData.actualPrice != itemData.price ? "": "style='display:none;'") + ">" +
                        "        <del class='" + cssClass("price-mod__del") + "'>" +
                        "          <span>￥</span><span>" + itemData.actualPrice + "</span>" +
                        "        </del>" +
                        "      </p>" +
                        "      <p>" +
                        "        <span>￥</span><span>" + itemData.price + "</span>" +
                        "      </p>" +
                        "    </div>" +
                        "  </td>";

                    //购买数量
                    billHTML += "" +
                        "  <td class='" + cssClass("sol-mod__no-br") + "'>" +
                        "    <div>" +
                        "      <p>" + itemData.quantity + "</p>" +
                        "    </div>" +
                        "  </td>";

                    //退款投诉
                    var applyForRefundnURL = "//refund2.taobao.com/dispute/applyRouter.htm?bizOrderId=" + itemData.subBillId;
                    var viewRefundURL = "//refund2.taobao.com/dispute/detail.htm?disputeType=1&bizOrderId=" + itemData.subBillId;
                    var complaintURL = "https://rights.taobao.com/complaint/applyRouter.htm?bizId=" + billData.billId;
                    var insuranceForItemURL = "//baoxian.taobao.com/thwy/detail.html?type=yfx1&biz_trade_id=" + billData.billId + "&biz_order_id=" + itemData.subBillId;
                    if (!itemData.isServiceItem) {
                        billHTML += "" +
                            "  <td>" +
                            "    <div>" +
                            "      <p style='margin-bottom:3px; " + (itemData.refundStatus ? "": "display:none;") + "'>" +
                            "        <a target='_blank' rel='noopener noreferrer' class='" + cssClass("text-mod__link") + " " + cssClass("text-mod__hover") + "' href='" + htmlEncode(viewRefundURL) + "'>" +
                            "          <i class='" + cssClass("icon-mod__icon") + " tm-iconfont icon-money " + cssClass("icon-text-mod__icon") + " " + cssClass("icon-text-mod__icon-start") + " " + cssClass("icon-text-mod__money") + "'></i>" +
                            "          <span class='text'>查看退款</span>" +
                            "        </a>" +
                            "      </p>" +
                            "      <p style='margin-bottom:3px; " + (itemData.refundStatus ? "display:none;": "") + "'>" +
                            "        <a target='_blank' rel='noopener noreferrer' class='" + cssClass("text-mod__link") + " " + cssClass("text-mod__hover") + "' href='" + htmlEncode(applyForRefundnURL) + "'>" + (finishedBillFlag ? "申请售后": (billData.isB2C == "true" ? "退款/退换货": "退款/退货")) + "</a>" +
                            "      </p>" +
                            "      <p style='margin-bottom:3px;'>" +
                            "        <span action='a3' class='" + cssClass("text-mod__link") + " " + cssClass("text-mod__hover") + "' href='" + complaintURL + "'>投诉" + (billData.isB2C == "true" ? "商家": "卖家") + "</a>" +
                            "      </p>" +
                            "      <p style='margin-bottom:3px; " + (billData.insuranceServiceExists ? "": "display:none;") + "'>" +
                            "        <a target='_blank' rel='noopener noreferrer' class='" + cssClass("text-mod__link") + " " + cssClass("text-mod__hover") + "' href='" + htmlEncode(insuranceForItemURL) + "'>退运保险</a>" +
                            "      </p>" +
                            "    </div>" +
                            "  </td>";
                    }
                    else {
                        billHTML += "" +
                            "  <td>" +
                            "    <div></div>" +
                            "  </td>";
                    }

                    var appendRateURL = "//rate.taobao.com/appendRate.htm?isArchive=false&bizOrderId=" + billData.billId + "&subTradeId=" + itemData.subBillId;
                    var rateURL = "//rate.taobao.com/remarkSeller.jhtml?tradeID=" + billData.billId + "&returnURL=https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm";
                    //https://fwfront.tmall.com/protocol/get_protocol.htm?service_item_id=524755330107&servOrderId=1341385417045777636&buyerId=656773676
                    var billDetailURL = "//buyertrade.taobao.com/trade/detail/trade_item_detail.htm?bizOrderId=" + billData.billId;
                    var logisticsURL = "//wuliu.taobao.com/user/order_detail_new.htm?trade_id=" + billData.billId + "&seller_id=" + billData.sellerId;

                    if (itemDataIndex > 0) {
                        billHTML += "" +
                            "  <td class='" + cssClass("sol-mod__no-bt") + "'></td>" +
                            "  <td class='" + cssClass("sol-mod__no-bt") + "'></td>";

                        //追加评价
                        if (billData.operatorList.indexOf("appendRate") > -1) {
                            billHTML += "" +
                                "  <td>" +
                                "    <div>" +
                                "      <p style='margin-bottom:3px;'>" +
                                "        <a target='_blank' rel='noopener noreferrer' class='" + cssClass("text-mod__link") + " " + cssClass("text-mod__hover") + "' href='" + htmlEncode(appendRateURL) + "'>追加评论</a>" +
                                "      </p>" +
                                "    </div>" +
                                "  </td>";
                        }
                        else {
                            billHTML += "  <td class='" + cssClass("sol-mod__no-bt") + "'></td>";
                        }
                    }
                    else {
                        //订单总价和运费（运费无）
                        billHTML += "" +
                            "  <td>" +
                            "    <div>" +
                            "      <div class='" + cssClass("price-mod__price") + "'>" +
                            "        <p>" +
                            "         <strong>" +
                            "           <span>￥</span><span>" + billData.actualFee + "</span>" +
                            "         </strong>" +
                            "        </p>" +
                            "      </div>" +
                            "      <p name='litetao-plugin-postFee' style='color:#6c6c6c;font-family:verdana;display:none;'>" +
                            "        <span>(含运费：</span>" +
                            "        <span name='litetao-plugin-postFeeText'></span>" +  //运费价格
                            "        <span></span>" +
                            "        <span></span>" +
                            "        <span>)</span>" +
                            "      </p>" +
                            "      <p style='color:#6c6c6c;font-family:verdana;'>" +
                            "        <span>(订单金额：</span><span>￥" + billData.totalFee + "</span><span>)</span>" +
                            "      </p>" +
                            "      <div style='font-family:verdana;'>" +
                            "        <div></div>" +
                            "      </div>" +
                            "      <p>" +
                            "        <a style='margin-right:5px;' href='http://www.taobao.com/m?sprefer=symj28' title='手机订单' target='_blank' rel='noopener noreferrer'>" +
                            "          <img src='//img.alicdn.com/tps/i1/T1xRBqXdNAXXXXXXXX-46-16.png'>" +
                            "        </a>" +
                            "      </p>" +
                            "      <span></span>" +
                            "    </div>" +
                            "  </td>";

                        //订单状态
                        billHTML += "" +
                            "  <td>" +
                            "    <div>" +
                            "      <p style='margin-bottom:3px;'>" +
                            "        <span class='" + cssClass("text-mod__link") + "'>" + billData.status + "</span>" +
                            "      </p>" +
                            "      <div>" +
                            "        <p style='margin-bottom:3px;'>" +
                            "          <a id='viewDetail' target='_blank' rel='noopener noreferrer' class='" + cssClass("text-mod__link") + " " + cssClass("text-mod__hover") + "' href='" + htmlEncode(billDetailURL) + "'>订单详情</a>" +
                            "        </p>" +
                            "        <p style='margin-bottom:3px; " + (billData.operatorList.indexOf("viewLogistic") > -1 ? "": "display:none;") + "'>" +
                            "          <a id='viewDetail' name='litetao-plugin-viewLogistics' target='_blank' rel='noopener noreferrer' class='" + cssClass("text-mod__link") + " " + (finishedBillFlag ? "": cssClass("text-mod__primary")) + " " + cssClass("text-mod__hover") + "' href='" + htmlEncode(logisticsURL) + "'>查看物流</a>" +
                            "        </p>" +
                            "      </div>" +
                            "    </div>" +
                            "  </td>";

                        var confirmGoodsURL = "//trade.taobao.com/trade/confirmGoods.htm?biz_order_id=" + billData.billId;
                        var payURL = "//buyertrade.taobao.com/trade/pay.htm?bizType=200&ispayforanother=false&bizOrderId=" + billData.billId;
                        var notifyDeliveryURL = "// https://buyertrade.taobao.com/trade/sendAlertMail.htm?type=doNotifySellerSendGoods&isSeller=false&bizOrderId=" + billData.billId + "&_tb_token_=" + (new RegExp("(?:^|;\\s*)" + "_tb_token_" + "\\=([^;]+)(?:;\\s*|$)").exec(document.cookie) || ["", ""])[1];
                        var cancelBillURL = "//buyertrade.taobao.com/trade/cancel_order_buyer.htm?biz_type=200&cell_redirect=0&biz_order_id=" + billData.billId;
                        var applyForInvoiceURL = "//invoice-ua.taobao.com/user/invoice/applyPcRoute?orderId=" + billData.billId;
                        //https://trade.tmall.com/order/buyer_delay_confirm_goods_time.htm?biz_order_id=1347332223749352838&has_refund=false&is_neu=true
                        //https://trade.taobao.com/trade/buyerDelayConfirmGoodsTime.htm?biz_order_id=1351436582257352838&biz_type=200&has_refund=true&cell_redirect=0
                        var extendConfirmTimeURL = "//trade.taobao.com/trade/buyerDelayConfirmGoodsTime.htm?biz_order_id=" + billData.billId;
                        //billData.operatorList contains ["confirmGood", "viewLogistic", "applyInvoice", "delayTimeout", "rateOrder", "tmallRateOrder", "resell"， "delOrder"， "appendRate", "notifyDelivery", "pay", "cancelOrder"]
                        //订单操作
                        billHTML += "" +
                            "  <td>" +
                            "    <div>" +

                            // 剩余收货时间（时间无）(如果在待收货页面，就强制生成评价按钮)
                            "      <p name='litetao-plugin-op-leaveConfirmTime' style='margin-bottom:3px; " + ((billData.operatorList.indexOf("confirmGood") > -1 || $("div.litetao-plugin-tab div[name='bill-waitConfirm']").hasClass(cssClass("tabs-mod__selected"))) && billData.leaveConfirmTimeText ? "": "display:none;") + "'>" +
                            "        <span class='" + cssClass("text-mod__link") + " " + cssClass("text-mod__grey") + "'>" +
                            "          <i class='" + cssClass("icon-mod__icon") + " tm-iconfont icon-time " + cssClass("icon-text-mod__icon") + " " + cssClass("icon-text-mod__icon-start") + " " + cssClass("icon-text-mod__time") + "'></i>" +
                            "          <span name='litetao-plugin-op-leaveConfirmTimeText' class='text'>" + billData.leaveConfirmTimeText + "</span>" + //剩余收货时间
                            "        </span>" +
                            "      </p>" +

                            // 确认收货按钮(如果在待收货页面，就强制生成评价按钮)
                            "      <p name='litetao-plugin-op-confirmGood' style='margin-bottom:3px; " + (billData.operatorList.indexOf("confirmGood") > -1 || $("div.litetao-plugin-tab div[name='bill-waitConfirm']").hasClass(cssClass("tabs-mod__selected"))? "": "display:none;") + "'>" +
                            "        <a id='confirmGood' target='_blank' rel='noopener noreferrer' style='font-weight:bolder;' class='" + cssClass("button-mod__button") + " " + cssClass("button-mod__secondary") + " " + cssClass("button-mod__button") + "' href='" + htmlEncode(confirmGoodsURL) + "'>确认收货</a>" +
                            "      </p>" +

                            // 立即付款(如果在待付款页面，就强制生成评价按钮)
                            "      <p name='litetao-plugin-op-waitPay' style='margin-bottom:3px; " + (billData.operatorList.indexOf("pay") > -1 || $("div.litetao-plugin-tab div[name='bill-waitPay']").hasClass(cssClass("tabs-mod__selected")) ? "": "display:none;") + "'>" +
                            "        <a id='pay' target='_blank' rel='noopener noreferrer' class='" + cssClass("button-mod__button") + " " + cssClass("button-mod__primary") + " " + cssClass("button-mod__button") + "' href='" + htmlEncode(payURL) + "'>立即付款</a>" +
                            "      </p>" +

                            // 评价(如果在待评价页面，就强制生成评价按钮)
                            "      <p name='litetao-plugin-op-waitRate' style='margin-bottom:3px; " + (billData.operatorList.indexOf("rateOrder") > -1 || billData.operatorList.indexOf("tmallRateOrder") > -1 || $("div.litetao-plugin-tab div[name='bill-waitRate']").hasClass(cssClass("tabs-mod__selected")) ? "": "display:none;") + "'>" +
                            "        <a id='rateOrder' target='_blank' rel='noopener noreferrer' style='font-weight:bolder;' class='" + cssClass("button-mod__button") + " " + cssClass("button-mod__default") + " " + cssClass("button-mod__button") + "' href='" + htmlEncode(rateURL) + "'>评价</a>" +
                            "      </p>" +

                            // 提醒卖家发货
                            "      <p name='litetao-plugin-op-notifyDelivery' style='margin-bottom:3px; " + (billData.operatorList.indexOf("notifyDelivery") > -1 ? "": "display:none;") + "'>" +
                            "        <a id='notifyDelivery' action='a1' target='_blank' rel='noopener noreferrer' class='" + cssClass("text-mod__link") + " " + cssClass("text-mod__primary") + " " + cssClass("text-mod__hover") + "' href='" + htmlEncode(notifyDeliveryURL) + "'>提醒卖家发货</a>" +  //原本是<span>
                            "      </p>" +

                            // 取消订单
                            "      <p name='litetao-plugin-op-cancelOrder' style='margin-bottom:3px; " + (billData.operatorList.indexOf("cancelOrder") > -1 ? "": "display:none;") + "'>" +
                            "        <a id='cancelOrder' action='a8' title='请与卖家协商取消订单，每天不得取消超过5笔订单。' target='_blank' rel='noopener noreferrer' class='" + cssClass("text-mod__link") + " " + cssClass("text-mod__hover") + "' href='" + htmlEncode(cancelBillURL) + "'>取消订单</a>" +  //原本是<span>
                            "      </p>" +

                            // 申请开票
                            "      <p name='litetao-plugin-op-applyInvoice' style='margin-bottom:3px; " + (billData.operatorList.indexOf("applyInvoice") > -1 ? "": "display:none;") + "'>" +
                            "        <a id='applyInvoice' action='b4' target='_blank' rel='noopener noreferrer' class='" + cssClass("text-mod__link") + " " + cssClass("text-mod__hover") + "' href='" + htmlEncode(applyForInvoiceURL) + "'>申请开票</a>" +
                            "      </p>" +

                            // 延长收货时间
                            "      <p name='litetao-plugin-op-delayTimeout' style='margin-bottom:3px; " + (billData.operatorList.indexOf("delayTimeout") > -1 ? "": "display:none;") + "'>" +
                            "        <a action='a8' target='_blank' rel='noopener noreferrer' class='" + cssClass("text-mod__link") + " " + cssClass("text-mod__hover") + "' href='" + htmlEncode(extendConfirmTimeURL) + "'>延长收货时间</a>" +
                            "      </p>" +

                            // 追加评价
                            "      <p name='litetao-plugin-op-appendRate' style='margin-bottom:3px; " + (billData.operatorList.indexOf("appendRate") > -1 ? "": "display:none;") + "'>" +
                            "        <a target='_blank' rel='noopener noreferrer' class='" + cssClass("text-mod__link") + " " + cssClass("text-mod__hover") + "' href='" + htmlEncode(appendRateURL) + "'>追加评论</a>" +
                            "      </p>" +

                            "    </div>" +
                            "  </td>";
                    }
                });

                //订单行尾
                billHTML += "" +
                    "    </table>" +
                    "  </div>" +
                    "</div>";

                htmlContent += billHTML;
            });

            return htmlContent || emptyListHTMLContent;
        }

        createNavi();
    }
})(jQuery.noConflict());
