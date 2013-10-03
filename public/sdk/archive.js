core.on("connected",function(){
	var currentNick = core.nick(), nickBox;
	if (isLastPage) {
		nickBox = document.getElementById("nick");
		nickBox.value = currentNick.replace(/guest-/,'');
	}
	core.enter(stream);
});





DomReady.ready(function(){
	var messageBox = document.getElementById("messageBox");
	var nickBox = document.getElementById("nick");
	var messageList = document.getElementById("messageList");
	core.on("message", function(message){
		var messageItem ,element;
		if (message.type == "text" && message.to==stream) {
			scrollback.debug && console.log("notify-",isLastPage);
			if (isLastPage) {
				
				messageItem = document.createElement("div");
				addClass(messageItem, "item container");
				
				addClass(element = document.createElement("div"), "box span3");
				element.innerHTML = "[" + message.from.replace(/guest-/g,'') + "]";
				messageItem.appendChild(element);
				
				addClass(element = document.createElement("div"), "box span5");
				element.innerHTML = message.text;
				messageItem.appendChild(element);
				
				addClass(element = document.createElement("div"), "box span4 time");
				element.innerHTML = relDate(prevtime,message.time);
				messageItem.appendChild(element);
				
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

	addEvent(messageBox, "keydown", function(e) {
		var text = document.getElementById("messageBox");
		if (e.keyCode == 13) {
			if (text.value.length != 0) {
				core.say(stream, text.value);
				text.value = "";
			}
			e.preventDefault();
		}
	});
	function nickChange(nick) {
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
