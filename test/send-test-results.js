var send = require('../email/sendEmail.js');//TODO remove this dependency
var htmlEncode = require('htmlencode');
var fs = require('fs');
var config = require('../config.js');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var to = config.test.to;

function sendResults() {
    var r1 = fs.readFileSync('./xunit-mocha.xml', 'utf8');
    var r2 = fs.readFileSync('./xunit.xml', 'utf8');
    formatResults(r1, r2, function(email) {
        to.forEach(function(t) {
            send('askabt@scrollback.io', t, email.subject, email.body);
        });    
    });
}

sendResults();

function formatResults(r1, r2, callback) {
    xmlToJson(r1, function(email1) {
        xmlToJson(r2, function(email2) {
            var email = {};
            var subject = "Test Results Failures: " + (email1.failures + email2.failures) + " Total: " + (email1.total + email2.total) + " Errors: " + (email1.errors + email2.errors);
            email.subject = subject;
            email.body = '<html><body>' + getCoverage() + 
                "<H2>Unit Test Results</H2>" + 
                email1.body + 
                "<H2>Selenium Test Results</H2>" + 
                email2.body + 
                '</body></html>';
            callback(email);
        });
    });

}

function xmlToJson(r, callback) {
    parser.parseString(r, function(err, data) {
        console.log("data=", JSON.stringify(data)); 
        var ret = {};
        ret.failures = parseInt(data.testsuite.$.failures);
        ret.errors = parseInt(data.testsuite.$.errors);
        ret.total = parseInt(data.testsuite.$.tests);
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
        
        ret.body =  "<p>" + 
            s.join("\n") + 
            '</p>';
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
    if (d.length === 1) d = "0" + d;
    
    return  y + m + d;
    
}


