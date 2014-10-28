/* jshint browser:true */
/* global LocalFileSystem */

/*
	This plugin polyfills the behaviour of appcache on phonegap.
*/

console.log("loaded fake-appcache.js");

document.addEventListener('deviceready', cacheUpdate, false);

function cacheUpdate() {
	console.log("got Device ready event! ");
	var serverManifest, localManifest;
	getServerManifest(function(sData) {
		serverManifest = sData;
		getLocalManifest(function(lData) {
			localManifest = lData;
			if (serverManifest !== localManifest) {
				updateLocalManifest(serverManifest);
			}
		});
	});
}

function getServerManifest(done) {
	var req = new XMLHttpRequest();

	req.onreadystatechange = function() {
		var res;
		if (req.readyState === 4) {
			if (req.status < 400 && req.responseText) {
				res = req.responseText;
				console.log("Got server manifest: ", res);
				done(res);
			}
		}
	};

	req.open("GET", "manifest.appcache", true);

	req.send();
}

function getLocalManifest(done) {
	// read file system and fetch the content of manifest.appcache as string.
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
		console.log("GOT file system, root path", fileSystem.root, fileSystem.root.fullPath);
		fileSystem.root.getFile('manifest.appcache', null, gotFileEntry, fail);
	}, fail);

	function gotFileEntry(fileEntry) {
		fileEntry.file(function(file) {
			var reader = new FileReader();
			reader.onloadend = function(evt) {
				var fileContent = evt.target.result;
				console.log("Read local appcache as text", fileContent);
				done(fileContent); // return data
			};
			reader.readAsText(file);
		}, fail);
	}

	function fail(evt) {
		console.log(evt.target.error.code);
	}
}

function updateLocalManifest(newManifestContent) {
	// replace contents of local manifest.appcache with newManifest.
	console.log("Update Manifest is called, new manifest is", newManifestContent);
}