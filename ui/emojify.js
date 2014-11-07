var emojiMap = require('./emoji-map.js');

module.exports = function(text) {
	if (typeof text !== "string") return;
	var emoji;
	var words = text.split(/[,. ]+/);
	words.forEach(function(word) {
		if (emojiMap.hasOwnProperty(word)) {
			emoji = emojiMap[word];
			text = text.replace(word, emoji);
		}
	});
	return text;
};