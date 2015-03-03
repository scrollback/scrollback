/*
	Stores and retrieves texts, threads and entities from state.

	The key format is optimized for quick, random writes and a one-time
	bulk load.

	<session id><type><type-specific key>

	The types and corresponding type-specific keys:

	T	text range		<room id><range start>
	t	text			<room id><timestamp>

	H	thread range	<room id><range start>
	h	thread			<room id><timestamp>

	e	entity			<room id, user id or relation id>

*/

/* global localStorage */

var lzString = require('lz-string');

module.exports = function (core, config, store) {
	core.on('boot', function (changes, next) {
		var entities={}, textRanges={}, texts=[], threadRanges={}, threads=[], sid, key, o;

		sid = store.get('session');
		if(!sid) {
			console.error('boot@persistence: Session ID is missing.');
		}
		
		/* 1. Retrieve all the data from localStorage */

		for(key in localStorage) {
			if(key.indexOf(sid) !== 0) continue;
			try {
				o = JSON.parse(lzString.decompressFromUTF16(localStorage[key]));
			} catch(e) {
				console.error('Could not parse localStorage item ' + key);
				continue;
			}
			switch(key.charAt(sid.length)) {
				case 'e':
					entities[o.id? o.id: o.room + '_' + o.user] = o;
					break;
				case 'T':
					(textRanges[o.room] = textRanges[o.room] || []).push(o);
					o.items = [];
					delete o.room;
					break;
				case 't':
					texts.push(o);
					break;
				case 'H':
					(threadRanges[o.room] = threadRanges[o.room] || []).push(o);
					o.items = [];
					delete o.room;
					break;
				case 'h':
					threads.push(o);
					break;
				default:
					console.error('Unknown localStorage item ' + key);
			}
		}
		
		/* 2. Construct full text and thread objects */
		
		textRanges.sort(function (a, b) {return (b.start || 0) - (a.start || 0); });
		threadRanges.sort(function (a, b) {return (b.start || 0) - (a.start || 0); });
		
		texts.forEach(function (text) {
			textRanges.filter(function (range) {
				return (range.start === null || range.start <= text.time) &&
					(range.end === null || range.end >= text.time);
			})[0].items.push(text);
		});
		
		threads.forEach(function (thread) {
			threadRanges.filter(function (range) {
				return (range.start === null || range.start <= thread.startTime) &&
					(range.end === null || range.end >= thread.startTime);
			})[0].items.push(thread);
		});
		
		changes.entities = entities;
		changes.texts = textRanges;
		changes.threads = threadRanges;
		
		next();
	}, 100);
	
	core.on('statechange', function (changes, next) {
		var key, data={}, sid = store.get('session');
		if(changes.entities) {
			for(key in changes.entities) {
				data[sid + 'e' + key] = store.getEntity(key);
			}
		}
		
		if(changes.texts) {
			for(key in changes.texts) {
				var room = key.split('_');
				changes.texts[key].forEach(function (range) {
					var items = store.getTexts(room, thread, range.start, )
				});
			}
		}
			
		for(key in data) {
			localStorage[key] = lzString.compressToUTF16(JSON.stringify(data[key]));
		}
		
		next();
	}, 100);
	
};
