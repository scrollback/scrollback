module.exports = function(url, size) {
	var replaceparams = function(u, params) {
			u = u.replace(/(&|\?)(.+=.+)*/g, "");

			for (var q in params) {
				u += ((/\?(.*=.*)*/).test(u) ? "&" : "?") + q + "=" + params[q];
			}

			return u;
		};

	if (typeof url !== "string") {
		return;
	}

	if (/https?\:\/\/.*\.googleusercontent\.com\//.test(url)) {
		return replaceparams(url, {
			sz: size
		});
	}

	if (/https?\:\/\/graph\.facebook\.com\//.test(url)) {
		return replaceparams(url, {
			type: "square",
			height: size,
			width: size
		});
	}

	if (/https?\:\/\/gravatar\.com\//.test(url)) {
		return replaceparams(url, {
			size: size
		});
	}
};
