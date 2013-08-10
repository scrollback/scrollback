var fbUser,fbStatus,nickExpected=false;


function handleError() {
	var errorDiv,loadDiv=document.getElementById("loading");
	loadDiv.className="hidden";
	errorDiv=document.getElementById("error");
	errorDiv.className="";					
}		

window.fbAsyncInit = function() {
	FB.init({
		appId      : '1389363534614084', // App ID
		channelUrl : window.location.protocol + '//' + window.location.host + '/channel.html',
		status     : false, // check login status
		cookie     : true, // enable cookies to allow the server to access the session
		oauth      : true, // enable OAuth 2.0
		xfbml      : false  // parse XFBML
	});	
	FB.getLoginStatus(function(response) {
		fbStatus=response;
		if (response.status==='connected') {
			FB.api("/me",function(user){
				var picUrl,loggedDiv,loadDiv,picture,errorDiv,nick,username,logout,createBtn,parent;
				fbUser=user;
				if (user.error) {
					handleError();
				}
				console.log(user);
				loggedDiv=document.getElementById("logged");
				loadDiv=document.getElementById("loading");
				loadDiv.className="hidden";
				loggedDiv.className="";
				
				picUrl =user.id ? "https://graph.facebook.com/"+user.id+"/picture?width=128&height=128" : "";
				
				picture=document.getElementById("picture");
				picture.src=picUrl;
				
				username=document.getElementById("username");
				nick=core.nick()
				if (nick.indexOf("guest-")===0) {
					username.value=user.email.split("@")[0];
					logoutBtn=document.getElementById("logoutBtn");
					logoutBtn.parentNode.removeChild(logoutBtn);
				}
				else {
					username.value=nick;
					createBtn=document.getElementById("submit");
					createBtn.parentNode.removeChild(createBtn);
					username.disabled=true;
				}
			});		
		}
		else{
			handleError();
		}
		
	});
};
(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/all.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function update() {
	console.log("blah");
	var username=document.getElementById("username").value;
	
	nickExpected=true;
	core.update("room",{
		id: username,
		name: fbUser.name,
		type: "user",
		description: fbUser.bio,
		picture: "https://graph.facebook.com/"+fbUser.id+"/picture?width=128&height=128",
		profile: "",
		params: ""
	});
	
	core.on("nick",function(n) {
		if(nickExpected && n==username) {
			core.update("account",{
				id:fbUser.id,
				room:username,
				gateway:"facebook",
				token: fbStatus.authResponse.accessToken,
				params: fbStatus.authResponse
			});	
			window.close();	
		}
	});
	
	core.on("error",function(obj){
		if (obj.code==="ER_DUP_ENTRY") {
			var notification=document.getElementById("notification");
			removeClass(notification,"inVisible");
			//alert("Nick not available");
		}
	});
}

function logout(){
	message("nick","","","");
	window.close();
}