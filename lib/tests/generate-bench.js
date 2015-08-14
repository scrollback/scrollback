function now() {
	if(typeof process !== "undefined" && process.hrtime) {
		var hrt = process.hrtime();
		return hrt[0] * 1e3 + hrt[1] / 1e6;
	}
	return performance ? performance.now() : Date.now();
}

function bench (fn) {
	var start = now(), i, l = 100000;
	for (i=0; i<l; i++) fn();
	console.log (1e3 * (now() - start)/l);
}

function nodeRandom () {
	return require("crypto").randomBytes(16).toString("hex");
};

function modernRandom() {
	var b = crypto.getRandomValues(new Uint8Array(16)), i, s="";
	for(i = 0; i < b.length; i++) s += b[i].toString(16);
	return s;
}

function fallbackRandom() {
	var i, s = "";
	for(i = 0; i < 16; i++) s += ((Math.random() * 256) | 0).toString(16);
	return s;
}

console.log(fallbackRandom());
bench(fallbackRandom);
