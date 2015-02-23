module.exports = {
	personaUser: {
		email: "email",
		password: "jdalk",
		username: "testinguser" //username in scrollback
	},
	selenium: {
		username: "username", //browserstack keys
		accessKey: "access_key",
		debug: true,
		capabilities: [ // capabilities can be generated using: https://www.browserstack.com/automate/node
			{
				'browserName': 'iPhone',
				'platform': 'MAC',
				'device': 'iPhone 5'
			 }, {
				'browserName': 'android',
				'platform': 'ANDROID',
				'device': 'LG Nexus 4'
			 }, {
				'browser': 'Safari',
				'browser_version': '7.0',
				'os': 'OS X',
				'os_version': 'Mavericks',
				'resolution': '1024x768'
			 }, {
				'browser': 'IE',
				'browser_version': '10.0',
				'os': 'Windows',
				'os_version': '8',
				'resolution': '1280x1024'
			 }, {
				'browser': 'IE',
				'browser_version': '11.0',
				'os': 'Windows',
				'os_version': '8.1',
				'resolution': '1366x768'
			 }, {
				'browser': 'Chrome',
				'browser_version': '36.0',
				'os': 'Windows',
				'os_version': '8.1',
				'resolution': '1366x768'
			 }, {
				'browser': 'Firefox',
				'browser_version': '31.0',
				'os': 'Windows',
				'os_version': '8.1',
				'resolution': '1366x768'
			}
		],
		tests: [ //list of test
		"chat-area-test.js",
		"meta-area-test.js",
		"login-test.js"
		]
	},
	server:"stage.scrollback.io",
	externalServer:"test.scrollback.io"
};
