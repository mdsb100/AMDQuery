myQuery.define("base/ready", function ($) {
    var 
        addHandler = function (ele, type, fns) {
            if (ele.addEventListener)
                ele.addEventListener(type, fns, false); //事件冒泡
            else if (ele.attachEvent)
                ele.attachEvent('on' + type, fns);
            else {
                ele['on' + type] = fns;
            }
        },
        windowReady = 0, //compatible ie ff
        $Ready = 0,
        list = [],
        todo = function () {
            if (!$Ready || !windowReady) { return; }
            var fun;
            while (list.length) {
                fun = list.splice(0, 1);
                fun[0] && fun[0](window, windowReady);
            }
        },
        ready = function (fun) {
            if (typeof fun != "function") {
                return;
            }
            list.push(fun);

            !windowReady ? addHandler(window, "load", todo) : todo();

        };
    $.ready = ready;
    if (_config.myquery.package) {
        require("json/package", function (Package) {
            var json = Package[_config.myquery.package];

            if (json) {
                require(json, function () {
                    $Ready = 1;
                    todo();
                });
            }
            else {
                $Ready = 1;
                todo();
            }
        });
    }
    else {
        $Ready = 1;
    }

    $._redundance.addHandler = addHandler;

    addHandler(window, "load", function (e) {
        windowReady = e || 1;
        todo();
    });

    return ready;
}, "1.0.0");