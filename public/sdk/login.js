var nickExpected=false;

window.resizeBy(350-window.innerWidth, 350-window.innerHeight);


window.fbAsyncInit = function() {
	FB.init({
		appId      : '1389363534614084', // App ID
		channelUrl : window.location.protocol + '//' + window.location.host + '/channel.html',
		status     : false, // check login status
		cookie     : true, // enable cookies to allow the server to access the session
		oauth      : true, // enable OAuth 2.0
		xfbml      : false  // parse XFBML
	});	
	if (location.href.search("redirect")>0) {
		login();
	}
	else{
		var facebookLogin=document.getElementById("fbLogin");
		removeClass(facebookLogin, 'inactive');
		addEvent(facebookLogin, 'click',login);
	}
};

(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/all.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


core.on("ERR_AUTH_NEW",function(boom) {
	window.location="/dlg/profile";
});




function continueAs() {
	var nick=document.getElementById("continueAs");
	if (nick.length<=3) {
		alert("nick should be longer than 3characters.");
		return;
	}
	nickExpected=true;
	message("nick","","","guest-"+nick.value);
	core.on("nick",function(n) {
		console.log("nick----"+n+":"+nickExpected);
		if(nickExpected) {
			window.close();	
		}
	});
}

function login() {
	console.log("calling login");
	FB.getLoginStatus(function(response){
		if(response.status!=='connected') {
			window.location="https://www.facebook.com/dialog/oauth?"+
			"client_id=1389363534614084"+
			"&redirect_uri=http://harry.scrollback.io:7528/dlg/login?redirect=true"+
			"&scope=email";
		}
		else{
			console.log("api");
			FB.api("/me",function(user){
				message("nick","","","",{
					gateway:"facebook",
					id:user.id,
					token: response.authResponse.accessToken
				});
				console.log(user);
				nickExpected=true;
				core.on("nick",function(n){
					console.log("nick----"+n+":"+nickExpected);
					if(nickExpected){
						window.close();	
					}
				});
			});
		}
	});
}