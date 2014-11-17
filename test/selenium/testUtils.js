var webdriver = require('browserstack-webdriver'),
	q = require('q');

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

function loginPersona(driver, id, password, callback) {
	findVisibleElementByClass(driver, ".js-has-auth-menu", function(el) {
		var win;
		el.click().
		then(function() {
			return driver.findElement(webdriver.By.css('.persona')).click();
		}).then(function() {
			return driver.getAllWindowHandles();
		}).then(function(w) {
			win = w;
			console.log("windows", win);
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

function loginFacebook(driver, email, pass, callback) {
	driver.findElement(webdriver.By.css('.user-area')).click().
	then(function() {
		findVisibleElementByClass(driver, ".facebook", function(el) {
			var win;
			el.click().
			then(function() {
				return driver.getAllWindowHandles();
			}).then(function(w) {
				win = w;
				console.log("windows", win);
				return driver.switchTo().window(win[1]);
			}).then(function() {
				return q.delay(4000);
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
	driver.findElement(webdriver.By.css('.user-area')).click().
	then(function() {
		return driver.findElement(webdriver.By.css('.logout')).click();
	}).then(function() {
		return driver.findElement(webdriver.By.css('.reload-page')).click();
	}).then(function() {
		return q.delay(2000);
	}).then(callback);
}

function loginGoogle(driver, email, pass, callback) {
	driver.findElement(webdriver.By.css('.user-area')).click().
	then(function() {
		findVisibleElementByClass(driver, ".google", function(el) {
			var win;
			el.click().
			then(function() {
				return driver.getAllWindowHandles();
			}).then(function(w) {
				win = w;
				return driver.switchTo().window(win[1]);
			}).then(function() {
				return q.delay(4000);
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
	return driver.findElement(webdriver.By.css(".sb-user")).getText();
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
	logout: logout
};