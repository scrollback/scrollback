var mysql = require("mysql"),
	objectlevel = require("objectlevel"),
	config = require("../config.js"),
	client = mysql.createConnection(config.mysql);

objectlevel.connect(__dirname + '/' + config.leveldb.path);

var messages = require('../leveldb/schemas/texts.js')(objectlevel);
var n=0;
client.query("SELECT * FROM text_messages").
on('error', function(err) { console.log(err); process.exit(); }).
on('result', function(row) {
	client.pause();
	labels = {};
	if(row.labels) labels[row.labels] = 1;
	row.labels = labels;
	row.session = row.origin;
	delete row.ref; delete row.type; // delete row.origin;
	messages.onmessage(row, function(err) {
		if(err) { console.log(err); process.exit(); }
		n++;
//		console.log('done ', row.id);
		client.resume();
	});
}).
on('end', function() { console.log(n, ' texts done'); process.exit(); });
