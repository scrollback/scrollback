var request = require("request");
var core=require("../../core/core.js");


exports.init=function(){
	// nothing as of now.... :-)
};

exports.auth=function(data,callback) {
	var str="https://graph.facebook.com/me?access_token=" + data.token;
	
	console.log("contacting facebook.........");
	request(str,
		function(err,res,body) {
			if(err) {
				console.log(str);
				//callback(false,{err:"ERR_AUTH_NETFAIL"});
				//network failure.?? should deal with it later.
				return;
			}
			body=JSON.parse(body);
			if(body.error || body.id!=data.id.toString()) {
				console.log(typeof body,data.id);
				callback(false,{err:"ERR_AUTH_FAIL"});
				return;
			}
			
			core.account.accounts({id:data.id,gateway:"facebook"},function(err,account) {
				console.log("account",account)
				if (err) {
					console.log(err);
				}
				if (!account || account.length===0) {
					callback(false,{err:"ERR_AUTH_NEW"});
				}
				else{
					console.log("account found"+account);
					callback(true,account);		
				}
			});
			
			console.log(body);
			console.log("facebook Login successful");
			
		}
	);	
};



/*
			 *
			 *
			 just some code to create a room and account.. should move it somewhere else.. :-)
			core.room({
				id:body.email,
				name:body.name,
				type:"user",
				description:body.bio,
				picture:"https://graph.facebook.com/"+body.id+"/picture?width=128&height=128",
				owner:body.email,
				params:body
			});
			
			core.account({
				id:"facebook://facebook.com/"+data.id,
				room:body.email,
				gateway:"facebook",
				params:data
			});
			*/