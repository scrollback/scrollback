module.exports = {
	hashCode: function(s) {
		var hash = 0, char;

		if (s.length === 0) {
			return hash;
		}

		for (var i = 0; i < s.length; i++) {
			char = s.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32bit integer
		}

		return hash;
	},

	stripQueryParam: function(url, param) {
		// prefer to use l.search if you have a location/link object
		var urlparts = url.split("?"),
			prefix, pars;

		if (urlparts.length >= 2) {
			prefix = encodeURIComponent(param) + "=";
			pars = urlparts[1].split(/[&]/g);

			// reverse iteration as may be destructive
			for (var i = pars.length; i-- > 0;) {
				// idiom for string.startsWith
				if (pars[i].lastIndexOf(prefix, 0) !== -1) {
					pars.splice(i, 1);
				}
			}

			url = urlparts[0] + "?" + pars.join("&");

			return url.replace(/[?&]$/, "");
		} else {
			return url;
		}
	}
};
