module.exports = {
	storage: {
		pg: {
            server: "localhost",
            username: "postgres",
            password: "scrollback",
            db: "staging"
        }
	},
	http: {
		host: "$branch.stage.scrollback.io",
		port: "$port"
	},
    "browserid-auth": {
		audience: "https://$branch.stage.scrollback.io"
	}
};
