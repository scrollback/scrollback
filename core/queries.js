var fs = require("fs"), i, l, queries;

queries = fs.readdirSync(__dirname + '/queries');
for(i=0, l=queries.length; i<l; i+=1) {
	queries[i] = fs.readFileSync(__dirname + '/' + queries[i]);
}

module.exports = queries;