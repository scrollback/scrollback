module.exports = {
	
};
/*
function pushAtEnd(ranges, range) {
    console.log(ranges, range);
    return ranges;
}
function pushAtStart(ranges, range) {
    console.log(ranges, range);
    return ranges;
}

function pushAtMiddle(ranges, range) {
    
}
function AddRange(ranges, range) {
	var i, l = ranges.length, position;
    if(l === 0) {
        ranges.push(range);
        return ranges;
    }
    if (range.end === null) {
    	return pushAtEnd(range);
    } else if (range.start === null) {
    	return pushAtStart(range);
    } else {
        return pushAtmiddle(ranges, range);
    }
}*/


function findRange(ranges, range) {
    var low = 0, high = ranges.length;
    var current, mid;
    
    while (low <= high) {
        current = (low +high / 2) | 0;
        mid = ranges[current];
        
        if(mid.start > range.start) {
            high = current -1;
            continue;
        }
        
    }
    
    var start = range.start, end = range.end;
    console.log(end);
    if(start < ranges[current].start) {
        
    } else if (start < ranges[current].start) {}
    else return current;
    
}



function findIndex(items, propName, value, start, end) {
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



console.log(findIndex, findRange);