module.exports = function() {
    var returnObj = {};
    returnObj.merge = merge;
    returnObj.getItems = getItems;
    return returnObj;
};


function merge(){
    
}
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


/*

[{
    "start": 14948874892847,
    "end": null,
    "items": [
        { "from": "kamal1991", "text": "Hello world!", "id": 0 },
        { "from": "satya164", "text": "Welcome", "id": 1 },
        { "from": "priynag", "text": "whassup kamal1991?", "id": 2 },
        { "from": "harish", "text": "what's going on", "id": 4 },
        { "from": "amalantony", "text": "hello there", "id": 5 },
        { "from": "kamal1991", "text": "I'm kamal1991", "id": 6 },
        { "from": "priynag", "text": "I'm not groot", "id": 7 },
        { "from": "satya164", "text": "hello grooty", "id": 8 },
        { "from": "amalantony", "text": "what the hell", "id": 9 },
        { "from": "harish", "text": "oh god", "id": 10 },
        { "from": "priynag", "text": "I know right", "id": 11 },
        { "from": "kamal1991", "text": "just testing", "id": 12 },
        { "from": "harish", "text": "what are you testing", "id": 13 },
        { "from": "kamal1991", "text": "stuff", "id": 14 },
        { "from": "kamal1991", "text": "important stuff", "id": 15 },
        { "from": "priynag", "text": "okay", "id": 16 },
        { "from": "priynag", "text": "keep testing", "id": 18 },
        { "from": "priynag", "text": "just don't spam, okay", "id": 19 }
    ]
},
{
    "start": 14948874892847,
    "end": null,
    "items": [
        { "from": "kamal1991", "text": "Hello world!", "id": 0 },
        { "from": "satya164", "text": "Welcome", "id": 1 },
        { "from": "priynag", "text": "whassup kamal1991?", "id": 2 },
        { "from": "harish", "text": "what's going on", "id": 4 },
        { "from": "amalantony", "text": "hello there", "id": 5 },
        { "from": "kamal1991", "text": "I'm kamal1991", "id": 6 },
        { "from": "priynag", "text": "I'm not groot", "id": 7 },
        { "from": "satya164", "text": "hello grooty", "id": 8 },
        { "from": "amalantony", "text": "what the hell", "id": 9 },
        { "from": "harish", "text": "oh god", "id": 10 },
        { "from": "priynag", "text": "I know right", "id": 11 },
        { "from": "kamal1991", "text": "just testing", "id": 12 },
        { "from": "harish", "text": "what are you testing", "id": 13 },
        { "from": "kamal1991", "text": "stuff", "id": 14 },
        { "from": "kamal1991", "text": "important stuff", "id": 15 },
        { "from": "priynag", "text": "okay", "id": 16 },
        { "from": "priynag", "text": "keep testing", "id": 18 },
        { "from": "priynag", "text": "just don't spam, okay", "id": 19 }
    ]
}]

*/