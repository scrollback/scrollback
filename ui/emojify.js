var emojiMap = require('./emjoi-map.js');

module.exports = function(text) {
	var emoji;
	var words = text.split('[,. ]+');
	words.map(function(word) {
		if (emojiMap.hasOwnProperty(word)) {
			emoji = emojiMap[word];
			text.replace(word, emoji);
		}
	});
	console.log("Returned text is ", text);
	return text;
};