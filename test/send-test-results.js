var fs = require('fs');
var config = require('../server-config-defaults.js');
var host = config.http.host;
var Email = require('../lib/email.js');
var emailObj = new Email(config.email.auth);
var r1 = JSON.parse(fs.readFileSync('./mocha-output-unit.json', 'utf8'));
//var r2 = JSON.parse(fs.readFileSync('./mocha-output-selenium.json', 'utf8'));
var testResults = {
	unit: r1
	//selenium: r2
};
processTestResults(testResults);

function processTestResults(testResults) {
	var r = {};
	r.totol = testResults.unit.passed /*+ testResults.selenium.passed + testResults.selenium.failed */+ testResults.unit.failed;
	r.passed = testResults.unit.passed /*+ testResults.selenium.passed*/;
	r.failed = /*testResults.selenium.failed + */testResults.unit.failed;
	r.unit = r1;
	//r.selenium = r2;
	var cp = 0,
		cf = 0;
    ['unit'/*, 'selenium'*/].forEach(function(v) {
		for (var test in r[v]) {
			if (r[v].hasOwnProperty(test) && typeof r[v][test] == 'object') {
				cp = 0;
				cf = 0;
				for (var t in r[v][test]) {
					if (r[v][test].hasOwnProperty(t) && typeof r[v][test][t] === 'object') {
						var tt = r[v][test][t];
						if (tt.status === "PASSED") {
							cp++;
						} else {
							cf++;
						}
					}
				}
				r[v][test].passed = cp;
				r[v][test].failed = cf;
			}
		}
	});
	return r;
}

function parse(str) {
	var args = [].slice.call(arguments, 1),
		i = 0;

	return str.replace(/%s/g, function() {
		return args[i++];
	});
}


function sendEmail() {
	var email = {};
	var r = processTestResults(testResults);
	email.to = config.test.to[0];
	email.subject = "Test Results Failures: " + r.failed + " Total: " + r.totol;
	var today = getDateString(new Date());
	var dateYesterday = new Date();
	dateYesterday.setDate(new Date().getDate() - 1);
	var yesterday = getDateString(dateYesterday);
	var out = [];
	out.push("<html><body>");
	var tempUrl = "http://" + host + "/s/tmp/%s-%s.html";
	out.push("<a href='" + parse(tempUrl, "coverage", today) + "'>Coverage Results</a>");
	var url = "http://" + host + "/s/tmp/%s-test-results-" + today + ".html#%s";
	var style = "style=\"color: %s; text-decoration: initial; \"";
	var colorFailed = "#d9534f";
	var colorPassed = "#5cb85c";
	var spanStyle = "style=\" color:%s;\" ";
	['unit'/*, 'selenium'*/].forEach(function(v) {
		out.push("<a  style=\"display: block;color: black;font-size: 20px;text-decoration: blink;margin-top: 5px;\" href='" +
			parse(tempUrl, v + "-test-results", today) + "'>" + v + " Tests</a>");
		for (var test in r[v]) {
			if (r[v].hasOwnProperty(test) && typeof r[v][test] == 'object') {
				var cp = r[v][test].passed,
					cf = r[v][test].failed;
				var color = cf !== 0 ? colorFailed : colorPassed;
				out.push("<li style=\"list-style:none\"><table><tr><td style=\"width:250px;word-wrap:break-word;\"><a " + parse(style, color) +
					" href='" + parse(url, v, r[v][test].id) + "'>" + test + "</a></td><td><span " + parse(spanStyle, colorPassed) +
					"> " + cp + " &#10004;</span></td><td><span " + parse(spanStyle, colorFailed) + "> " + cf + "&#x2717;</span></td></tr></table></li>");
				if (cf !== 0) {
					out.push("<ul style=\"margin-top:0px\">");
					for (var t in r[v][test]) {
						if (r[v][test].hasOwnProperty(t) && typeof r[v][test][t] === 'object') {
							var tt = r[v][test][t];
							if (tt.status === 'FAILED') {
								out.push("<li style=\"color:" + colorFailed + "\"><a " + parse(style, color) + " href='" + parse(url, v, r[v][test][t].id) + "'>" + t + "</a></li>");
							}
						}
					}
					out.push("</ul>");
				}
			}
		}
		out.push("</ul>");
	});
	out.push("<a href='" + parse(tempUrl, "email", yesterday) + "'>Previous day test results</a>");
	out.push("<a href='" + parse(tempUrl, "email", today) + "'>See this email on browser</a>");
	//out.push("<a href='https://www.browserstack.com/automate'>See selenium test logs on browserstack</a>");
	out.push("</body></html>");
	var m = out.join("\n");
	fs.writeFileSync("public/s/tmp/email-" + today + ".html", m);
	config.test.to.forEach(function(to) {
		console.log(config.email.from);
		emailObj.send(config.email.from, to, email.subject, m, function() {
			console.log("Arguments:", arguments);
		});
	});

}

function getDateString(date) {
	var y = date.getYear() + "";
	y = y.substring(1);
	var m = "" + (date.getMonth() + 1);
	if (m.length === 1) m = "0" + m;
	var d = "" + date.getDate();
	if (d.length === 1) d = "0" + d;
	return y + m + d;
}

sendEmail();
