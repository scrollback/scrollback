"use strict";

var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$@",
	commonSpl = "\t\n\r!\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~";

/*
	Use of other URL-safe characters

	.	Dot in strings
	_	Spaces in strings

	-	Value: Start of negative number
		In numbers, negative exponent
		-- is false
		-+ is null

	+	Value: Start of positive number
		In numbers, positive exponent
		++ is true
		+- is null

	!	(unused)
	'	In strings, toggles base64-encoded-unicode mode

	(	Opens objects and arrays
	)	Closes objects and arrays

	,	Delimiter in objects and arrays
	:	Key/value separator in objects

	*	In strings, dictionary lookup
	~	In strings, 1-byte escape sequence for common special chars
*/

module.exports = function(dictionary) {
	var encMap = {}, decMap = {}, dictReg;

	if (Array.isArray(dictionary)) {
		dictionary.splice(64);

		dictionary.forEach(function(word) {
			var i;
			for (i = 0; i < word.length; i++) {
				if (chars.indexOf(word[i]) !== -1 && typeof decMap[word[i]] === "undefined") {
					encMap[word] = word[i];
					decMap[word[i]] = word;
					return;
				}
			}
			for (i = 0; i < chars.length; i++) {
				if (typeof decMap[chars[i]] === "undefined") {
					encMap[word] = chars[i];
					decMap[chars[i]] = word;
					return;
				}
			}
		});

		dictReg = new RegExp(dictionary.map(function(word) {
			return word.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
		}).join("|"), "g");

	} else {
		dictionary = null;
	}

	function encodeInteger(t) {
		var s = "";
		while (t) { s = chars[t % 64] + s; t = Math.floor(t / 64); }
		return s || "0";
	}

	function decodeInteger(s) {
		var t = 0, i;
		for (i = s.length - 1; i >= 0; i--) {
			t += chars.indexOf(s[i]) * Math.pow(64, s.length - i - 1);
		}
		return t;
	}

	function encodeString(s) {
		if (!s) { return "''"; }

		if (dictionary) {
			s = s.replace(dictReg, function(m) {
				return encMap[m] + "*";
			});
		}

		return s.replace(/[^0-9a-zA-Z$@*]+([0-9a-zA-Z$@]\*[^0-9a-zA-Z$@]*)*/g, function(run) {
			var i, m, n, r = "", u = false;

			for (i = 0; i < run.length; i++) {
				m = run[i];

				if (run[i + 1] === "*") {
					r += m + "*";
					i++;
					continue;
				}

				if (m === " ") {
					r += "_";
				} else if (m === ".") {
					r += ".";
				} else if ((n = commonSpl.indexOf(m)) >= 0) {
					r += "~" + chars[n];
				} else {
					if (!u) { r += "'"; u = true; }
					n = encodeInteger(m.charCodeAt(0));
					r += (("000" + n).substr(-3));
				}
			}

			if (u) { r += "'"; }
			return r;
		});
	}

	function decodeString(s) {
		if (s === "''") { return ""; }

		s = s.replace(/[0-9a-zA-Z$@]\*/g, function(m) {
			return "'*" + decMap[m[0]] + "'";
		});

		return s.split("'").map(function(run, j) {
			if (run[0] === "*") { return run.substr(1); }

			run = run.replace(/_/g, " ").replace(/\~./g, function(m) {
				return commonSpl[decodeInteger(m[1])];
			});

			if (j % 2) {
				run = run.replace(/[0-9a-zA-Z$@]+/g, function(m) {
					var i, r = "";
					for (i = 0; i < m.length; i += 3) {
						r += String.fromCharCode(decodeInteger(m[i] + m[i + 1] + m[i + 2]));
					}
					return r;
				});
			}

			return run;
		}).join("");
	}

	function encodeNumber(value) {
		var s = "", parts, sig, exp;
		s += (value < 0 ? "-" : "+");

		parts = value.toString();
		if (value.toExponential().length < parts.length) {
			parts = value.toExponential();
		}

		parts = parts.split(/[eE]/g);
		if (parts[1]) { exp = parseInt(parts[1]); }

		parts = parts[0].split(".");
		if (parts[1]) { exp -= parts[1].length; }

		sig = parts[0] + (parts[1] || "");
		sig = sig.replace(/0+$/, function(m) {
			if (exp === 0 && m.length <= 2) { return m; }
			exp += m.length;
			return "";
		});

		s += (encodeInteger(parseInt(sig)) || "0");

		if (exp) { s += (exp < 0 ? "-" : "+") + encodeInteger(Math.abs(exp)); }

		return s;
	}

	function decodeNumber(str) {
		var expSign = (str.indexOf("-", 1) === -1 ? "+" : "-"),
			parts = str.substr(1).split(/[\+\-]/);

		return parseFloat(str[0] + decodeInteger(parts[0]) +
			(parts[1] ? "e" + expSign + decodeInteger(parts[1]) : ""));
	}

	function encodeCollection (value, qStr) {
		var i, s = [];
		if (Array.isArray(value)) {
			for (i = 0; i < value.length; i++) {
				s.push(encode(value[i]));
			}
		} else {
			if (!Object.keys(value).length && !qStr) { s.push(":"); }

			for (i in value) {
				s.push(encodeString(i) + (qStr ? "=" : ":") + encode(value[i]));
			}
		}
		return qStr ? s.join("&") : "(" + s.join(",") + ")";
	}

	function decodeCollection(string) {
		var i, l, c, level, start, key, out, mode;

		function assert(condition) {
			if (condition) { return; }

			throw new SyntaxError("Unexpected " + c + " at " + i + " in " + string);
		}

		function terminate(expectedMode, preserve) {
			mode = mode || expectedMode;

			if (!out) { out = (mode === "key" ? {} : []); }
			if (start === i) { return; }

			if (mode === "key") {
				key = decodeString(string.substring(start, i));
				mode = "value";
			} else {
				if (Array.isArray(out)) {
					out.push(decode(string.substring(start, i)));
				} else {
					if (key) {
						out[key] = decode(string.substring(start, i));
						key = null;
					}
					mode = "key";
				}
			}

			start = i + (preserve ? 0 : 1);
		}

		level = 0;
		start = 1;
		for (i = 1, l = string.length; i < l; i++) {
			c = string[i];

			if (c === "(") {
				if (level === 0) { mode = null; }
				level++; continue;
			}

			if (c === ")") {
				if (level === 0) { terminate("value"); }
				level--; continue;
			}

			assert(level >= 0);
			if (level > 0) { continue; }

			if (c === ":") { terminate("key"); continue; }
			if (c === ",") { terminate("value"); continue; }
			if (c === "+" || c === "-") {
				if (mode === "literal") { continue; }
				terminate("value", true);
				mode = "literal";
				continue;
			}
		}
		assert(level === -1);
		return out;
	}

	function encode (value, qStr) {
		switch (typeof value) {
			case "object":
				if (value === null) { return "+-"; }
				return encodeCollection(value, qStr);
			case "string":
				return encodeString(value);
			case "number":
				return encodeNumber(value);
			case "boolean":
				return value ? "++" : "--";
			default:
				return "";
		}
	}

	function decode (string) {
		switch (string[0]) {
			case "(":
				return decodeCollection(string);
			case "-":
				if (string[1] === "-") { return false; }
				if (string[1] === "+") { return null; }
				return decodeNumber(string);
			case "+":
				if (string[1] === "-") { return null; }
				if (string[1] === "+") { return true; }
				return decodeNumber(string);
			default:
				return decodeString(string);
		}
	}

	return {
		encode: encode,
		decode: decode,
		encodeInteger: encodeInteger,
		decodeInteger: decodeInteger,
		encodeString: encodeString,
		decodeString: decodeString,
		encodeNumber: encodeNumber,
		decodeNumber: decodeNumber,
		encodeCollection: encodeCollection,
		decodeCollection: decodeCollection,
		encodeQString: function(obj) { return encode(obj, true); },
		decodeQString: function(str) {
			return decode("(" + str.replace(/=/g, ":").replace(/&/g, ",") + ")");
		}
	};

};

