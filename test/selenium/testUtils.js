var jwt = require('jsonwebtoken');
var webdriver = require('browserstack-webdriver'),
	q = require('q');


function generateJWS(domain, email, aud, cert) {
	var payload = {
		"iss": domain,
		"sub": email,
		"aud": aud,
		"iat": Math.floor((new Date()).getTime() / 1000),
		"exp": Math.floor((new Date()).getTime() / 1000) + 30000
	};
	var token = jwt.sign(payload, cert, {
		algorithm: 'RS256',
		type: "jws"
	});
	return token;
}
 
function openUrl(capabilities, server, roomid) {
	var driver = new webdriver.Builder().
	usingServer('http://hub.browserstack.com/wd/hub').
	withCapabilities(capabilities).
	build();
	driver.get(server + "/" + roomid);
	var window = new webdriver.WebDriver.Window(driver);
	window.maximize();
	return driver;
}

function loginPersona(driver, id, password, callback, className) {
	if(!className)
	{
		className = ".main-area .user-area.js-has-user-menu";
	}
	findVisibleElementByClass(driver, className, function(el) {
		var win;
		el.click().
		then(function() {
			return driver.findElement(webdriver.By.css('.persona')).click();
		}).then(function() {
			return driver.getAllWindowHandles();
		}).then(function(w) {
			win = w;
			return driver.switchTo().window(win[1]);
		}).then(function() {
			return q.delay(4000);
		}).then(function() {
			return driver.findElement(webdriver.By.id("authentication_email")).sendKeys(id);
		}).then(function() {
			return driver.findElement(webdriver.By.id("authentication_email"))
			.sendKeys(webdriver.Key.RETURN);
		}).then(function() {
			return q.delay(7000);
		}).then(function() {
			return driver.findElement(webdriver.By.id("authentication_password")).
			sendKeys(password);
		}).then(function() {
			return driver.findElement(webdriver.By.id("authentication_password")).
			sendKeys(webdriver.Key.RETURN);
		}).then(function() {
			driver.switchTo().window(win[0]);
		}).then(function() {
			return q.delay(5000);
		}).then(callback);
	});
}

function loginFacebook(driver, email, pass, callback, className) {
	if (!className) {
		className = '.main-area .user-area.js-has-user-menu';
	}
	q.delay(5000).then(function() {
			return driver.findElement(webdriver.By.css(className)).click();
	}).then(function() {
		findVisibleElementByClass(driver, ".facebook", function(el) {
			var win;
			el.click().
			then(function() {
				return driver.getAllWindowHandles();
			}).then(function(w) {
				win = w;
				return driver.switchTo().window(win[1]);
			}).then(function() {
				return q.delay(5000);
			}).then(function() {
				console.log("entering email");
				return driver.findElement(webdriver.By.id("email")).sendKeys(email);
			}).then(function() {
				return driver.findElement(webdriver.By.id("pass")).sendKeys(pass);
			}).then(function() {
				return driver.findElement(webdriver.By.id("u_0_1")).click();
			}).then(function() {
				console.log("logging in...");
				driver.switchTo().window(win[0]);
			}).then(function() {
				return q.delay(5000);
			}).then(callback);
		});
	});
}

function logout(driver, callback) {
	driver.findElement(webdriver.By.css('.main-area .user-area.js-has-user-menu')).click().
	then(function() {
		return driver.findElement(webdriver.By.css('.logout')).click();
	}).then(function() {
		return driver.findElement(webdriver.By.css('.dialog-action-go-back-as-guest')).click();
	}).then(function() {
		return q.delay(2000);
	}).then(callback);
}

function loginGoogle(driver, email, pass, callback) {
	q.delay(3000).then(function(){
		return driver.findElement(webdriver.By.css('.main-area .user-area.js-has-user-menu')).click();
	}).then(function() {
		findVisibleElementByClass(driver, ".google", function(el) {
			var win;
			el.click().
			then(function() {
				return driver.getAllWindowHandles();
			}).then(function(w) {
				win = w;
				return driver.switchTo().window(win[1]);
			}).then(function() {
				return q.delay(5000);
			}).then(function() {
				console.log("entering email");
				return driver.findElement(webdriver.By.id("Email")).sendKeys(email);
			}).then(function() {
				return driver.findElement(webdriver.By.id("Passwd")).sendKeys(pass);
			}).then(function() {
				return driver.findElement(webdriver.By.id("signIn")).click();
			}).then(function() {
				console.log("logging in...");
				driver.switchTo().window(win[0]);
			}).then(function() {
				return q.delay(5000);
			}).then(callback);
		});
	});
}

/*
		 Return a promise with username.
		 */
function getMyuserid(driver) {
	return driver.findElement(webdriver.By.css(".main-area .user-area.js-has-user-menu")).getText();
}

/**
 * Find one visible element by css
 */
function findVisibleElementByClass(driver, name, cb) {
	driver.findElements(webdriver.By.css(name)).
	then(function(el) {
		var element,
			c = 0;

		function done() {
			if (++c === el.length) {
				cb(element);
			}
		}
		el.forEach(function(e) {
			e.isDisplayed().then(function(a) {
				if (a) {
					element = e;
				}
				done();
			});
		});

	});
}

module.exports = {
	openUrl: openUrl,
	loginPersona: loginPersona,
	getMyUserid: getMyuserid,
	findVisibleElementByClass: findVisibleElementByClass,
	loginFacebook: loginFacebook,
	loginGoogle: loginGoogle,
	logout: logout,
    generateJWS: generateJWS
};