var nickExpected=false;
window.fbAsyncInit = function() {
	FB.init({
		appId      : '1389363534614084', // App ID
		channelUrl : window.location.protocol + '//' + window.location.host + '/channel.html',
		status     : false, // check login status
		cookie     : true, // enable cookies to allow the server to access the session
		oauth      : true, // enable OAuth 2.0
		xfbml      : false  // parse XFBML
	});
};

(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/all.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));



core.on("connected",function(){
	console.log("connected socket");
});

core.on("ERR_AUTH_NEW",function(boom) {
	console.log("new user");
	window.location="/dlg/profile";
});
	
	



function login() {
	console.log("calling login");
	FB.getLoginStatus(function(response){
		if(response.status!=='connected') {
			window.location="https://www.facebook.com/dialog/oauth?"+
			"client_id=1389363534614084"+
			"&redirect_uri=http://harry.scrollback.io:7528/dlg/login"+
			"&scope=email";
		}
		else{
			FB.api("/me",function(user){
				message("nick","","","",{
					gateway:"facebook",
					id:user.id,
					token: response.authResponse.accessToken
				});
				nickExpected=true;
				core.on("nick",function(){
					if(nickExpected){
						window.close();	
					}
				});
			});
		}
	});
}