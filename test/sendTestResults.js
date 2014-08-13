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
    return '<HTML><BODY><P>' + htmlEncode.htmlEncode(r) + '</P></BODY></HTML>';
}
