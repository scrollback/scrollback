function get(url, callback) { request("GET", url, callback); }
function post(url, data, callback) { request("POST", url, callback, data); }

function getx(url, callback) {
	var el = document.createElement("script"),
		cbn = "c", i;

	for(i=0; i<6; i++) cbn += Math.floor(Math.random()*256).toString(16);

	window[cbn] = function(data) {
		try { delete window[cbn]; }
		catch(e) { window[cbn] = null; }
		try { data = JSON.parse(data); callback(null, data); }
		catch(e) { callback(null, data); }
	};

	url = url + (url.indexOf('?') == -1? "?" : "&") + "callback=" + cbn;
	document.body.appendChild(el);
	el.src = url;
	addEvent(el, 'load', function() {
		document.body.removeChild(el);
	});
}

function request (method, url, callback, postData) {
	var req = createXMLHTTPObject();
	if (!req) {
		setTimeout(function() { callback("no-xmlhttp-object"); }, 0);
		return;
	}
	req.open(method,url,true);
	if (postData) {
		req.setRequestHeader('Content-type','application/json');
		if(typeof postData == "object") postData = JSON.stringify(postData);
	}
	req.onreadystatechange = function () {
		var res;
		if (req.readyState != 4) return;
		if (req.status != 200 && req.status != 304) {
			callback("http-" + req.status);
			return;
		}
		try {
			res = JSON.parse(req.responseText);
		} catch(e) {
			res = req.responseText;
			return;
		}
		callback(null, res);
	};
	if (req.readyState == 4) return;
	req.send(postData);
}

var XMLHttpFactories = [
	function () {return new XMLHttpRequest(); },
	function () {return new ActiveXObject("Msxml2.XMLHTTP"); },
	function () {return new ActiveXObject("Msxml3.XMLHTTP"); },
	function () {return new ActiveXObject("Microsoft.XMLHTTP"); }
];

function createXMLHTTPObject() {
	var xmlhttp = false;
	for (var i=0;i<XMLHttpFactories.length;i++) {
		try {
			xmlhttp = XMLHttpFactories[i]();
		}
		catch (e) {
			continue;
		}
		break;
	}
	return xmlhttp;
}
