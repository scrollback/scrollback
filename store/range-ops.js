module.exports = {
    merge: mergeRange
};

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


function mergeRange(ranges, range, propName) {
    var topRangeIndex, topItemIndex, bottomRangeIndex, bottomItemIndex;
    console.log(ranges);
    if(range.start === null) {
        topRangeIndex = 0;
        topItemIndex = -1;
    } else {
        for(
            topRangeIndex = 0;
            topRangeIndex < ranges.length && (
                ranges[topRangeIndex].end !== null &&
                ranges[topRangeIndex].end < range.start
            );
            topRangeIndex++
        );
        console.log("topRangeIndex: ",topRangeIndex);
        if(ranges[topRangeIndex].start <= range.start && ranges[topRangeIndex].end >= range.start) {
            topItemIndex = findIndex(ranges[topRangeIndex].items, propName, range.start);
        } else {
            topItemIndex = -1;
        }
    }
    
    if(range.end === null) { bottomRangeIndex = ranges.length; }
    else {
        for(
            bottomRangeIndex = ranges.length;
            bottomRangeIndex >= 0 && (
                ranges[bottomRangeIndex].start !== null &&
                ranges[bottomRangeIndex].start <= range.end
            );
            bottomRangeIndex--
        );
        
        if(ranges[bottomRangeIndex].start <= range.end && ranges[bottomRangeIndex].end >= range.end) {
            bottomItemIndex = findIndex(ranges[bottomRangeIndex].items, propName, range.end);
            if(ranges[bottomRangeIndex].items[bottomItemIndex][propName] == range.end) bottomItemIndex++;
        } else {
            bottomItemIndex = -1;
        }
    }
    console.log(topRangeIndex, topItemIndex, bottomRangeIndex, bottomItemIndex);
    
    if(topItemIndex != -1) {
        range.items = ranges[topRangeIndex].items.slice(0,topItemIndex).concat(range.items);
        range.start = ranges[topRangeIndex].start;
    }
    
    if(bottomItemIndex != -1) {
        range.items = range.items.concat(ranges[bottomRangeIndex].items.slice(bottomItemIndex));
        range.end = ranges[bottomRangeIndex].end;
    }
    
    ranges.splice(topRangeIndex, bottomRangeIndex - topRangeIndex, range);
}
