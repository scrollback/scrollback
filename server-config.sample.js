module.exports = {
	storage: {
		pg: {
			username: "scrollback",
			password: "",
			db: "scrollback",
			server: "localhost"
		}
	},
	http: {
		host: "$branch.stage.scrollback.io",
		cookieDomain: "localhost",
		port: "$port",
		home: "public", // the directory containing static files
		time: 60000,
		limit: 30,
		index: "/me" //index URL redirect
	},
    "browserid-auth": {
		audience: "https://$branch.stage.scrollback.io"
	}
};
