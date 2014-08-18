var send = require('../email/sendEmail.js');//TODO remove this dependency
var htmlEncode = require('htmlencode');
var fs = require('fs');
var config = require('../config.js');
var to = config.test.to;

function sendResults() {
    var r = fs.readFileSync('./xunit.xml', 'utf8');
    r = formatResults(r);
    to.forEach(function(t) {
        send('askabt@scrollback.io', t, 'Test results', r);
    });
}

sendResults();

function formatResults(r) {
    return '<html><body>' +
        getCoverage() + "<p>" + 
        htmlEncode.htmlEncode(r) + 
        '</p></body></html>';
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


