var myConfig = {
	core: {
		uid: 1000,
		name: "scrollback"
	},
	mysql: {
		host: "localhost",
		user: "scrollback",
		password: "scrollback",
		database: "scrollback"
	},
	originnotify: {
		from: "scrollback@scrollback.io",
		to: "local@scrollback.io"
	},
	http: {
		/**
		 * Edit this to enable https

		https: {
			key: "../scrollback-ssl/scrollback.io.key",
			cert: "../scrollback-ssl/scrollback.io.crt",
			port: 443
		},
		*/
		host: "local.scrollback.io",
		cookieDomain: ".scrollback.io",
		port: 80,
		home: "public", // directory containing static files
		time: 60000,
		limit: 30
	},
	auth: {
		audience: "local.scrollback.io"
	},
	redis: {
		host: "local.scrollback.io",
		port: 6379,
		db: 0
	},
	whitelists: {
		internalSession: true
	},
	threader: {
		host: "local.scrollback.io",
		port: 55555
	},
	irc: {
		nick: "scrollback", // name of the irc bot
		hangTime: 60000 // timeout before disconnecting
	},
	plugins: [
		"anti-flood",
		"authorizer",
		"validator",
		"browserid-auth",
		"anti-abuse",
		"entityloader",
		"threader",
		"http",
		"redis-storage",
		"leveldb-storage",
		"admin-notifier",
		"entityloader"
	]
};

module.exports = myConfig;
