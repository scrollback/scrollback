module.exports = {
	storage: {
		pg: {
			username: "scrollback",
			password: "scrollback",
			db: "scrollback",
			server: "localhost"
		}
	},
	http: {
		host: "$branch.stage.scrollback.io",
		port: "$port"
	},
	"browserid-auth": {
		audience: "https://$branch.stage.scrollback.io"
	},
	jws: {
		keys: {
			"$branch.stage.scrollback.io": ["9gEBqp19abpuRXVqu4xjDDRASdoCPhIhVRxHGgj6mqB7Y0KOcYuY65TznL1fxVaxa0Q8eiECxpTWVbadDtb2xoWf2cWTCSu2VfmvpGKxeliz+SkSjYHGrtVbRD63WpcuIjMXB9Cfgf5H3SFpeTSD6ENtpCBLr2KfKI9ITMKE8nI="]
		}
	}
};
