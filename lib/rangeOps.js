module.exports = function() {
    var returnObj = {};
    returnObj.getItems = getItems;
    return returnObj;
};

function findIndex (items, propName, value, start, end) {
    var pos;

    if (typeof start === 'undefined') {
        return findIndex(propName, value, 0, items.length);
    }

    if (value === null) {
        return end;
    }

    if (start >= end) return start;
    pos = ((start + end) / 2) | 0;

    if (items[pos] && items[pos][propName] < value) {
        return findIndex(propName, value, pos + 1, end);
    } else if (items[pos - 1] && items[pos - 1][propName] >= value) {
        return findIndex(propName, value, start, pos - 1);
    } else {
        return pos;
    }
}

function getItems(ranges, req, propName) {
    var index, startIndex, endIndex, range, missingAbove, missingBelow;
    
    range = ranges.filter(function (r) {
        return (
            (req[propName] === null && r.end === null) ||
            ((r.start === null || r.start < req[propName]) &&
            (r.end === null || r.end > req[propName]))
        );
        
    })[0];
    
    if(!range) return ["missing"];
    
    index = findIndex(range.items, propName, req[propName]);
    startIndex = index - (req.above || 0);
    endIndex = index + (req.below || 0);
    
    if(startIndex < 0) {
        missingAbove = true;
        startIndex = 0;
    }
    
    if(endIndex > range.items.length) {
        missingBelow = true;
        endIndex = range.items.length;
    }
    
    return [].concat(
        (missingAbove? ['missing']: []),
        range.items.slice(startIndex, endIndex),
        (missingBelow? ['missing']: [])
    );
}