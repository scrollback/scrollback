var sync = require('sync');
process.chdir("..");
var core=require(process.cwd()+"/core/core.js");
core.init();


sync(function(){
	var x=0;
	try {
		console.log("Clearing the neo4j database")
		var result=core.db.execute("neo.clear",{});
		console.log("cleared db");
		x++;
	}
	catch(e) {
		console.log("error:",e);
	}


	try {
		var result=core.room.getRoom({id:"askabt"});
		console.log("askabt",result);
		x++;
	}
	catch(e) {
		console.log("error:",e);
	}

	try {
		var result=core.room.createRoom({id:"man-utd",type:"topic"});
		console.log(result);
		x++;
	}
	catch(e) {
		console.log("error:",e);
	}

	try {
		var result=core.room.createRoom({id:"askabt",type:"topic"});
		console.log(result);
		x++;
	}
	catch(e) {
		console.log("error:",e);
	}
	console.log(x);
})