var core = require("./core/core.js"),
	config = require("./config.js"),
	fs = require("fs");
	i, l, gns, gn, go;

core.init(config);

gns = fs.readdirSync(__dirname + '/gate');
for(i=0, l=gns.length; i<l; i+=1) {
	gn = gns[i];
	go = require(__dirname + '/' + gn + '/' + gn + '.js');
	go.init();
	core.gateways[gn] = go;
}

if(config.core.uid) process.setuid(config.core.uid);

