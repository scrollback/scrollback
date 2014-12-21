var serverConfig = {
	global: {
		host: "scrollback.io",
		su: {}
	},
	core: {
		name: "scrollback",
		newrelic: {
			name: 'Scrollback Local'
		}
	},
	analytics: {
		pg: { //post gre config
			server: "localhost", //server:port
			db: "logs",
			username: "username",
			password: "password"
			//port:
		},
	},
	env: "dev",
	http: {
		host: "local.scrollback.io",
		cookieDomain: ".scrollback.io",
		port: 80,
		home: "public", // the directory containing static files
		time: 60000,
		limit: 30,
		index: "/me" //index URL redirect
	},
	email: {
		from: "scrollback@scrollback.io",
		redisDB: 7
	}
};
module.exports = serverConfig;
