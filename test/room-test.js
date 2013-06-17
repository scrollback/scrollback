var sync = require('sync');
var assert = require('assert');
process.chdir("..");
var core=require(process.cwd()+"/core/core.js");
core.init();


sync(function(){

	// clear the database
	try {
		console.log("Clearing the neo4j database")
		var result=core.db.execute("neo.clear",{});
		console.log("cleared db");
	}
	catch(e) {
		console.log("error:",e);
	}

	// get a room that does not exist exists
	try {
		assert.equal(core.room.getRoom({id:"askabt"}).length, 0, "result set will be empty if room does not exist");
	}
	catch(e) {
		console.log("error:",e);
	}

    // create a new room
	try {
		var result=core.room.createRoom({id:"man-utd",type:"topic"});
		assert.equal(result[0].id, "man-utd", "id of room should be same as passed");
		assert.equal(result[0].type, "topic", "type of room should be same as passed");
	}
	catch(e) {
		console.log("error:",e);
	}

    // create another new room
	try {
		var result=core.room.createRoom({id:"askabt",type:"topic"});
		assert.equal(result[0].id, "askabt", "id of room should be same as passed");
		assert.equal(result[0].type, "topic", "type of room should be same as passed");
	}
	catch(e) {
		console.log("error:",e);
	}
	console.log("Success: " + x);

	// get a room that exists
	try {
		var result=core.room.getRoom({id:"man-utd"});
		assert.equal(result[0].id, "man-utd", "id of room should be same as passed");
		assert.equal(result[0].type, "topic", "type of room should be same as passed");
	}
	catch(e) {
		console.log("error:",e);
	}
	
	/*// number of listeners initially should be zero
	try {
		var result=core.room.getListeners({id:"askabt"});
		console.log(result);
		x++;
	}
	catch(e) {
		console.log("error:",e);
	}
	console.log("Success: " + x);
	
	// delete a room
	try {
		var result=core.room.deleteRoom({id:"man-utd"});
		console.log(result);
		x++;
	}
	catch(e) {
		console.log("error:",e);
	}
	console.log("Success: " + x);*/
});