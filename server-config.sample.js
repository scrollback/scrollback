module.exports = {
	global: {
		host: "local.scrollback.io",
		su: {}
	},
	core: {
		name: "scrollback",
		newrelic: {
			name: "Scrollback Local"
		}
	},
	analytics: {
		pg: {
			// postgre config
			server: "localhost", // server:port
			db: "logs",
			username: "username",
			password: "password"
		}
	},
	env: "dev",
	"browserid-auth": {
		audience: "local.scrollback.io"
	},
	http: {
		host: "local.scrollback.io",
		cookieDomain: ".scrollback.io",
		port: 80,
		home: "public", // directory containing static files
		time: 60000,
		limit: 30,
		index: "/me" // homepage
	},
	email: {
		from: "scrollback@scrollback.io",
		redisDB: 7
	}
};
