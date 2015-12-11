/*
	Stores and retrieves texts, threads and entities from state.

	The key format is optimized for quick, random writes and a one-time
	bulk load.

	<session id>:<type>:<type-specific key>

	The types and corresponding type-specific keys:

	T	text range		<room_thread id>:<range start>
	t	text			<room_thread id>:<timestamp>

	H	thread range	<room id>:<range start>
	h	thread			<room id>:<timestamp>

	e	entity			<room id, user id or relation id>

*/

/* global localStorage */

var lzString = require('lz-string');

function clear() {
	for(var key in localStorage) delete localStorage[key];
}

function save(data) {
	for(var key in data) {
		localStorage[key] = lzString.compressToUTF16(JSON.stringify(data[key]));
	}
}

module.exports = function (core, config, store) {
	core.on('boot', function (changes, next) {
		var entities={}, textRanges={}, texts={}, threadRanges={}, threads={}, sid, key, o;

		sid = changes.session;
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
			key = key.split(':');
			switch(key[1]) {
				case 'e':
					entities[o.id? o.id: o.room + '_' + o.user] = o;
					break;
				case 'T':
					(textRanges[key[2]] = textRanges[key[2]] || []).push(o);
					o.items = [];
					break;
				case 't':
					(texts[key[2]] = texts[key[2]] || []).push(o);
					break;
				case 'H':
					(threadRanges[key[2]] = threadRanges[key[2]] || []).push(o);
					o.items = [];
					break;
				case 'h':
					threads.push(o);
					break;
				default:
					console.error('Unknown localStorage item ' + key);
			}
		}

		/* 2. Construct full text and thread objects */

		for(key in textRanges) {
			textRanges[key].sort(function (a, b) {return (b.start || 0) - (a.start || 0); });
			texts[key].forEach(function (text) {
				textRanges[key].filter(function (range) {
					return (range.start === null || range.start <= text.time) &&
						(range.end === null || range.end >= text.time);
				})[0].items.push(text);
			});
		}

		for(key in threadRanges) {
			threadRanges[key].sort(function (a, b) {return (b.start || 0) - (a.start || 0); });
			threads[key].forEach(function (thread) {
				threadRanges[key].filter(function (range) {
					return (range.start === null || range.start <= thread.startTime) &&
						(range.end === null || range.end >= thread.startTime);
				})[0].items.push(thread);
			});
		}

		changes.entities = entities;
		changes.texts = textRanges;
		changes.threads = threadRanges;

		next();
	}, 100);

	core.on('statechange', function (changes, next) {
		var key, data={}, sid = store.get('session'), ranges;

		console.log("Session id", sid);

		if(changes.entities) {
			for(key in changes.entities) {
				data[sid + ':e:' + key] = store.getEntity(key);
			}
		}

		if(changes.texts) {
			for(key in changes.texts) {
				ranges = store.get('texts', key);

				changes.texts[key].forEach(function (changeRange) {
					ranges.forEach(function(stateRange) {
						if(stateRange.start == changeRange.start || stateRange.end == changeRange.end) {
							data[sid + ':T:' + key + ':' + stateRange.start] =
								{start: stateRange.start, end: stateRange.end};
						}
					});

					store.getTexts(
						key.split('_')[0], key.split('_')[1], changeRange.start, changeRange.end - changeRange.start
					).forEach(function (text) {
						if(typeof text !== 'object') return;
						data[sid + ':t:' + key + ':' + text.time] = text;
					});
				});
			}
		}

		if(changes.threads) {
			for(key in changes.threads) {
				ranges = store.get('threads', key);

				changes.threads[key].forEach(function (changeRange) {
					ranges.forEach(function(stateRange) {
						if(stateRange.start == changeRange.start || stateRange.end == changeRange.end) {
							data[sid + ':H:' + key + ':' + stateRange.start] =
								{start: stateRange.start, end: stateRange.end}
						}
					})

					store.getThreads(
						key, changeRange.start, changeRange.end - changeRange.start
					).forEach(function (thread) {
						if(typeof thread !== 'object') return;
						data[sid + ':h:' + key + ':' + thread.startTime] = thread;
					});
				});
			}
		}

		try {
			save(data);
		} catch (e) {
			console.log('Error while saving: ', e);
			/* There is not enough space */
//			clear();
//			snapshot();
		}

		next();
	}, 100);


	function getSnapshot() {
		var room = store.get("nav", 'room'),
			slice = {
				texts: {},
				threads: {},
				entities: {}
			}, room ;
	}

};
