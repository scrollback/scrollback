/* jshint browser:true */

/*
	This plugin simulates the behaviour of appcache on phonegap.
*/

document.addEventListener('deviceready', cacheUpdate, false);

function cacheUpdate() {
	console.log("got Device ready event! ");
	var serverManifest, clientManifest;
	getServerManifest(function(sData) {
		serverManifest = sData;
		getClientManifest(function(cData) {
			clientManifest = cData;
			if (serverManifest !== clientManifest) {
				updateManifestContent(serverManifest);
			}
		});
	});
}

function getServerManifest(done) {
	if (window.phonegap) {
		var req = new XMLHttpRequest();

		req.onreadystatechange = function() {
			var res;
			if (req.readyState === 4) {
				if (req.status < 400 && req.responseText) {
					res = req.responseText;
					console.log("Got response text ", res);
					done(res);
				}
			}
		};

		req.open("GET", "manifest.appcache", true);

		req.send();
	}
}

function getClientManifest(done) {
	// read file system and fetch the content of manifest.appcahce as string.
}

function updateManifestContent(newManifest) {
	// replace contents of local manifest.appcache with newManifest.
	console.log("Update Manifest is called, new manifest is", newManifest);
}