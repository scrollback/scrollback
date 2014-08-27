var send = require('../email/sendEmail.js');//TODO remove this dependency
var htmlEncode = require('htmlencode');
var fs = require('fs');
var config = require('../config.js');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var to = config.test.to;

function sendResults() {
    var r = fs.readFileSync('./xunit.xml', 'utf8');
    formatResults(r, function(email) {
        to.forEach(function(t) {
            send('askabt@scrollback.io', t, email.subject, email.body);
        });    
    });
}

sendResults();

function formatResults(r, callback) {
    parser.parseString(r, function(err, data) {
        console.log("data=", JSON.stringify(data)); 
        var ret = {};
        var subject = "Test Results Failures: " + data.testsuite.$.failures + " Total: " + data.testsuite.$.tests + " Errors: " + data.testsuite.$.errors;
        ret.subject = subject;
        var s = [];
        data.testsuite.testcase.forEach(function(test) {
            var style = "font-size: 14px;";
            if (test.failure) { 
                style += "color: #d9534f;";
            } else {
                style += "color: #5cb85c;";    
            }
            s.push("<pre style='" + style + "'>" + htmlEncode.htmlEncode(JSON.stringify(test, null, 4)).replace(/\\n/g, "<br/>") + "</pre>");
        });
        ret.body = '<html><body>' +
            getCoverage() + "<p>" + 
            s.join("\n") + 
            '</p></body></html>';
        callback(ret);
    });
}

function getCoverage() {
    return "<a href='"  + config.http.host + "/s/tmp/coverage-" + getDateString() + ".html'>Coverage Results</a></br>";
}

function getDateString() {
    var y = new Date().getYear() + "";
    y = y.substring(1);
    var m = "" + (new Date().getMonth() + 1);
    if (m.length === 1) m = "0" + m; 
    var d = "" + new Date().getDate();
    if (m.length === 1) d = "0" + d;  
    
    return  y + m + d;
    
}


