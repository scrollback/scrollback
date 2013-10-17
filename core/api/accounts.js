
var pool = require("../data.js");


module.exports = function(data,callback) {
	
	// if (typeof data==="object") {
	// 	pool.get(function(err, db) {
	// 		if (data.gateway!=="irc") {
	// 			data.id=data.gateway+":"+data.id;
	// 		}
	// 		db.query("INSERT INTO `accounts` SET `id`=?, `room`=?, `gateway`=?, `params`=?",
	// 			[data.id, data.room || "", data.gateway,JSON.stringify(data.params)|| ""],function(err,data) {
	// 			console.log(err,data);
	// 			db.end();
	// 			if (callback) callback(err,data);
	// 		});
	// 	});
	// }
	// else {
	// 	pool.get(function(err, db) {
	// 		console.log(data);
	// 		db.query("select * from accounts where id=? ", [data],function(err,data) {
	// 			db.end();
	// 			if (callback) callback(err,data);
	// 		});
	// 	});
	// }
};

// exports.accounts=function(query,callback){
// 	pool.get(function(err, db) {
// 		var id;
// 		if (query.gateway!=="irc") {
// 			id=query.gateway+":"+query.id;
// 		}
		
// 		db.query("select * from accounts where id=?", [id],function(err,data) {
// 			if (callback) callback(err,data);
// 			db.end();
// 		});
		 
// 	});
// };











/*
this.accounts({id:"1300501655",gateway:"facebook"},
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






