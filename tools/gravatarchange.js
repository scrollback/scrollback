var mysql = require('mysql');
var getAvatarText = require('../lib/getAvatarText.js')

var conn = mysql.createConnection({
	host: 'localhost',
	user: 'scrollback' ,
	password: 'scrollback',
	database: 'scrollback'
});

conn.connect(function(err){
	if(!err){
		console.log("Connection established to Mysql DB");
	}
	else{
		console.error(err);
	}
});

conn.query("select * from rooms where type='user'", function(err, result){
	//console.log(result.length);
	result.forEach(function(user){
		var imgText = getAvatarText(user.id);
		if(imgText.length < 2) user.picture = user.picture + '/?d='+
			encodeURIComponent('http://scrollback.io/img/default-avatar/background.png')+'&s=48';
		else user.picture = user.picture + '/?d=' + encodeURIComponent('http://scrollback.io/img/default-avatar/') + imgText + '.png?s=48';
		
		conn.query("update rooms set picture = ? where rooms.id=?", [user.picture, user.id], function(err,res){
			if(err) console.log("ERROR", err);
			else console.log(res);
		});
	});
	//conn.end();
});