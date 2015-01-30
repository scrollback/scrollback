

module.exports = function() {
    var returnObj = {};
    returnObj.merge = merge;
    returnObj.getItems = getItems;
};

function merge(range1, range2) {
    console.log(range1, range2);
}

function getItems(ranges,query) {
    console.log(ranges, query);
}