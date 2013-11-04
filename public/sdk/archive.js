core.on("connected",function(){
	var currentNick = core.nick(), nickBox;
	if (isLastPage) {
		nickBox = document.getElementById("nick");
		nickBox.value = currentNick.replace(/guest-/,'');
	}
	core.enter(stream);
});

$(document).ready(function(){
	var messageBox = document.getElementById("messageBox");
	var nickBox = document.getElementById("nick");
	var messageList = document.getElementById("messageList");
	$("#action").click(function(event){
		$(this).hasClass("login") && login();
		$(this).hasClass("config") && (location.href = location.protocol+"//"+location.host+"/"+stream+"/config");
	});
	core.on("message", function(message){
		nickBox.value=core.nick().replace(/guest-/g,'');
		var messageItem;
		if(message.type == "nick"){
			if(nick.indexOf("guest-")===0) {
				$("#action").html("Login");
				$("#action").removeClass("config");
				$("#action").addClass("login");
			}
			else{
				if(core.nick() == room.owner){
					$("#action").html("Configure");
					$("#action").removeClass("login");
					$("#action").addClass("config");
				}else if(!room || !room.owner) {
					$("#action").html("Claim");
					$("#action").removeClass("login");
					$("#action").addClass("config");
				}else{
					$("#action").hide();
				}
			}
		}
		if (message.type == "text" && message.to==stream) {
			var isMe=false;//if message start with "/me"
			if(message.text.indexOf("/me ")==0){
				message.text=message.text.replace("/me",message.from.replace(/guest-/,''));
				isMe=true;
			}
			scrollback.debug && console.log("notify-",isLastPage);
			if (isLastPage) {
				if(isMe){
					messageItem = JsonML.parse(["div", {"class": "item container"},
						["div", {"class": "box span8"},"["+message.text+"]"],
						["div", {"class": "box span4 time"},relDate(prevtime,message.time) + " later"]
					]);	
				}
				else{
					messageItem = JsonML.parse(["div", {"class": "item container"},
						["div", {"class": "box span3"},"[" + message.from.replace(/guest-/g,'') + "]"],
						["div", {"class": "box span5"},message.text],
						["div", {"class": "box span4 time"},relDate(prevtime,message.time) + " later"]
					]);
				}
				
				messageList.appendChild(messageItem);
				prevtime = message.time;
				messageBox.scrollIntoView(false);
			}
			else  {
				var aelement;
				messageItem = document.getElementById("notificationBar");
				if (!messageItem) {
					messageItem=document.createElement("div");
					messageItem.setAttribute("id","notificationBar");
					addClass(messageItem,"container");
					document.getElementById("messageList").parentNode.
						insertBefore(messageItem,document.getElementById("messageList").nextSibling);  
				}
				messageItem.innerHTML="";
				
				aelement=document.createElement("a");
				addClass(aelement,"notificationLink");
				aelement.href="http://"+location.host+"/"+stream+"#"+"bottom";
				aelement.innerHTML="New Message from " + message.from+": "+message.text;
				messageItem.appendChild(aelement);
			}
		} else if (message.type == "nick") {
			if (isLastPage && message.from == core.nick()) {
				document.getElementById("nick").value = message.ref;
			}
		}
	});
	
	if (!isLastPage) {
		return;
	}
	$('#messageForm').submit(function(e) {//onsubmit event 
		e.preventDefault(); // to stop the form from submitting
		var text = document.getElementById("messageBox");
		if (text.value.length != 0) {
			var tempText=text.value;
			core.say(stream, text.value,function(obj){
				if (obj.message == "AUTH_REQ_TO_POST") {
					text.value = tempText;
					login({requireAuth: 1});
						
				}		
			});
			text.value = "";
		}
	});
	function nickChange(nick) {
		if (nick&&nick.length<5) {
			return;	
		}
		if (nick != core.nick()) {
			core.nick(nick,function(reply){});
		}
	}
	addEvent(nickBox, "blur", function(e) {
		scrollback.debug && console.log("Lost focus, sending nick");
		nickChange(nickBox.value);
	});
	addEvent(nickBox, "keydown", function(e) {
		if (e.keyCode == 13) {
			nickChange(nick.value);
			e.preventDefault();
		}
	});
});



function relDate (input, reference){
	if(input==0){
		input=new Date().getTime();//first message in new room.
	}
	var SECOND = 1000,
		MINUTE = 60 * SECOND,
		HOUR = 60 * MINUTE,
		DAY = 24 * HOUR,
		WEEK = 7 * DAY,
		YEAR = DAY * 365,
		MONTH = YEAR / 12;
	
	var formats = [
		[ SECOND, 'a second' ],
		[ 0.7 * MINUTE, 'seconds', SECOND ],
		[ 1.5 * MINUTE, 'a minute' ],
		[ 60 * MINUTE, 'minutes', MINUTE ],
		[ 1.5 * HOUR, 'an hour' ],
		[ DAY, 'hours', HOUR ],
		[ 1.5 * DAY, 'a day' ],
		[ 7 * DAY, 'days', DAY ],
		[ 1.5 * WEEK, 'a week'],
		[ MONTH, 'weeks', WEEK ],
		[ 1.5 * MONTH, 'a month' ],
		[ YEAR, 'months', MONTH ],
		[ 1.5 * YEAR, 'a year' ],
		[ Number.MAX_VALUE, 'years', YEAR ]
	];
	
	!reference && ( reference = (new Date).getTime() );
	reference instanceof Date && ( reference = reference.getTime() );
	
	input instanceof String && ( input = new Date(input) );
	input instanceof Date && ( input = input.getTime() );
	
	var delta = reference - input,
	format, i, len;
	
	for(i = -1, len=formats.length; ++i < len; ){
		format = formats[i];
		if(delta < format[0]){
			return format[2] == undefined ? format[1] : Math.round(delta/format[2]) + ' ' + format[1];
		}
	};
	return "Long, long";
}

