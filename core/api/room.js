
var pool = require("../data.js");


exports.room=function(data,callback) {
	
	if (typeof data==="object") {
		
		//console.log("inserting obj",pool);
		pool.get(function(err, db) {
			
			db.query("INSERT INTO `rooms` SET `id`=?, `type`=?, `name`=?, `description`=?, `picture`=?, "+
			"`profile`=?, `createdOn`=NOW(), `owner`=?, `params`=?", [data.id, data.type || "topic",
			data.name || "", data.description || "", data.picture || "", data.profile || "",
			data.owner|| data.id, data.params|| ""],function(err,data) {
				
				db.end();
				console.log(err,data);
				if (callback) callback(err,data);
			});
		});
	}
	else {
		pool.get(function(err, db) {
			console.log(data);
			db.query("select * from rooms where id=? ", [data],function(err,data){
				db.end();
				if (callback) callback(err,data);
			});
		});
	}
	
};

/*
this.room({
	id:"scrollback",
	type:"topic",
	name:"scroll-back",
	description:"blah blah blah",
	picture:"",
	profile:"",
	owner:"harry.softer",
	params:"{key:value}"},
	function(err,data){
		if (err) {
			console.log("ERROR:",err);
		}
		else{
			console.log(data);
		}
	}
);

this.room("scrollback",
	function(err,data){
		if (err) {
			console.log("ERROR:",err);
		}
		else{
			console.log(data);
		}
	}
);
*/

exports.rooms=function(query,callback){
	
};