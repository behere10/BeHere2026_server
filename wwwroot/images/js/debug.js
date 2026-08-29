var Debug = function (isDebug, isInfo = true)
{
    var bDebug = isDebug;
    var bInfo = isInfo;

    console.log("DEBUG INFO: " + (bInfo ? "true" : "false"));
    console.log("DEBUG LOG: " + (bDebug ? "true" : "false"));



    function error (m0, m1, m2, m3, m4, m5) {
        //if (bInfo) {
            if (m1 === undefined) {
                console.log(m0);
            }
            else if (m2 === undefined) {
                console.log(m0, m1);
            }
            else if (m3 === undefined) {
                console.log(m0, m1, m2);
            }
            else if (m4 === undefined) {
                console.log(m0, m1, m2, m3);
            }
            else {
                console.log(m0, m1, m2, m3, m4);
            }
        //}
    }



    function info (m0, m1, m2, m3, m4, m5) {
        if (bInfo) {
            if (m1 === undefined) {
                console.log(m0);
            }
            else if (m2 === undefined) {
                console.log(m0, m1);
            }
            else if (m3 === undefined) {
                console.log(m0, m1, m2);
            }
            else if (m4 === undefined) {
                console.log(m0, m1, m2, m3);
            }
            else {
                console.log(m0, m1, m2, m3, m4);
            }
        }
    }

    

    function log (m0, m1, m2, m3, m4, m5) {
        if (bDebug) {
            if (m1 === undefined) {
                console.log(m0);
            }
            else if (m2 === undefined) {
                console.log(m0, m1);
            }
            else if (m3 === undefined) {
                console.log(m0, m1, m2);
            }
            else if (m4 === undefined) {
                console.log(m0, m1, m2, m3);
            }
            else {
                console.log(m0, m1, m2, m3, m4);
            }
        }
    }
    


    function dump(value) {
        'use strict';
    
        if (!bDebug) {
            return;
        }

        if (typeof value !== 'object') {
            console.log(value);
            return;
        }
    
        var indent = '  ';
    
        // オブジェクトを再帰的に展開して、内容を表す文字列を返す
        function dumpRec(object, depth) {
            var isArray = Array.isArray(object),
                result = (isArray ? '[' : '{') + '\n',
                lines = [],
                v,
                s,
                key,
                i;
    
            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    s = '';
                    v = object[key];
    
                    for (i = -1; i < depth; i += 1) {
                        s += indent;
                    }
    
                    s += key + ': ' +
                        (typeof v === 'object' ?
                                dumpRec(v, depth + 1) : v);
    
                    lines.push(s);
                }
            }
    
            result += lines.join(',\n') + '\n';
    
            for (i = 0; i < depth; i += 1) {
                result += indent;
            }
    
            result += isArray ? ']' : '}';
    
            return result;
        }
    
        console.log(dumpRec(value, 0));
    }



    return {
        error: error,
        info: info,
        log: log,
        dump: dump
    };
}
