function searchPattern(text, suffixArray, pattern) {
    var st = 0;
    var end = text.length - 1;
    out: while (st <= end) {
		var m = Math.floor((st + end) / 2);
		//console.log(m);
		for (var i = 0;i < pattern.length;i++) {
			//console.log(pattern.charAt(i), text.charAt(m + i));
			if (pattern.charAt(i) < text.charAt(i + suffixArray[m])) {
				end = m - 1;
				continue out;
			} else if (pattern.charAt(i) > text.charAt(i + suffixArray[m])) {
				st = m + 1;
				continue out;
			}
		}
		return suffixArray[m];
	}
	return -1;
}

module.exports = searchPattern;


