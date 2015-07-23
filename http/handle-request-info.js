"use strict";

module.exports = function(core) {
	function parseURL(url) {
		var parts, path, pathArr, query, queryArr, kv, o;

		if (typeof url !== "string") {
			return null;
		}

		parts = url.split("?");
		path = parts[0];
		query = parts[1];

		pathArr = path.split("/");

		o = {
			entity: pathArr[2],
			type: pathArr[3] || "info"
		};

		if (query) {
			queryArr = query.split("&");

			for (var i = 0, l = queryArr.length; i < l; i++) {
				if (queryArr[i]) {
					if (queryArr[i].indexOf("=") > 0) {
						kv = queryArr[i].split("=");

						o[kv[0]] = kv[1];
					} else {
						o[queryArr[i]] = true;
					}
				}
			}
		}

		return o;
	}

	function getInfo(info, cb) {
		core.emit("getEntities", {
			ref: info.entity,
			session: "internal-http-seo"
		}, function(err, res) {
			var entity;

			if (err) {
				cb(err);

				return;
			}

			if (res && res.results && res.results[0]) {
				entity = res.results[0];

				delete entity.params;

				if (entity.picture) {
					cb(null, {
						type: "json",
						json: JSON.stringify(entity)
					});

					return;
				}
			}

			cb(null, null);
		});
	}

	function getPicture(info, cb) {
		core.emit("getEntities", {
			ref: info.entity,
			session: "internal-http-seo"
		}, function(err, res) {
			var entity;

			if (err) {
				cb(err);

				return;
			}

			if (res && res.results && res.results[0]) {
				entity = res.results[0];

				if (entity.picture) {
					cb(null, {
						type: "url",
						url: entity.picture
					});

					return;
				}
			}

			cb(null);
		});
	}

	return function(req, cb) {
		var info = parseURL(req.path);

		switch (info.type) {
		case "info":
			getInfo(info, cb);
			break;
		case "picture":
			getPicture(info, cb);
			break;
		default:
			cb(new Error("Invalid info type"));
		}
	};
};
