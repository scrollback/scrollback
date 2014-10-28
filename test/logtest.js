var log = require('../lib/logger');
var i = 9999;

function write() {
	log('The quick brown fox jumps over the lazy dog.');
	if (--i > 0) setTimeout(write, 10);
}

write();
