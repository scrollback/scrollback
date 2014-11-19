module.exports = {
	hashCode: function(s){
		var hash = 0, char;
		if (s.length === 0) return hash;
		for (var i = 0; i < s.length; i++) {
			char = s.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	}
};
