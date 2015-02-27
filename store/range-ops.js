module.exports = {
	findIndex: findIndex,
	merge: mergeRange,
	getItems: getItems
};

function findIndex(items, propName, value, start, end) {
	var pos;
	if (typeof start === 'undefined') {
		return findIndex(items, propName, value, 0, items.length-1);
	}

	if (value === null) {
		return end;
	}

	if (start >= end) {
		return (items[start] && items[start][propName] === value) ?start: -1;
	}
	pos = ((start + end) / 2) | 0;

	if (items[pos] && items[pos][propName] < value) {
		return findIndex(items, propName, value, pos + 1, end);
	} else if (items[pos - 1] && items[pos - 1][propName] >= value) {
		return findIndex(items, propName, value, start, pos - 1);
	} else {
		return (items[pos] && items[pos][propName] === value) ?pos: -1;
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

function mergeRange(ranges, range, propName) {
	var topRangeIndex, topItemIndex, bottomRangeIndex, bottomItemIndex, index;

	if (range.start === null) topRangeIndex = -1;
	else {
		for (
			topRangeIndex = 0; topRangeIndex < ranges.length - 1 && (
				ranges[topRangeIndex].end !== null &&
				ranges[topRangeIndex].end < range.start
			); topRangeIndex++
		);

	}
	if (range.end === null) bottomRangeIndex = ranges.length;
	else {
		for (
			bottomRangeIndex = ranges.length; bottomRangeIndex > 0 && (
				ranges[bottomRangeIndex - 1].start !== null &&
				ranges[bottomRangeIndex - 1].start >= range.end
			); bottomRangeIndex--
		);
	}
	
	if (ranges[topRangeIndex].start <= range.start && ranges[topRangeIndex].end >= range.start) {
		topItemIndex = findIndex(ranges[topRangeIndex].items, propName, range.start);
	}else{
		topItemIndex = -1;
	}
	if(bottomRangeIndex < ranges.length){
		bottomItemIndex = findIndex(ranges[bottomRangeIndex].items, propName, range.end);
	}else if(bottomRangeIndex === ranges.length){
		bottomItemIndex = findIndex(ranges[bottomRangeIndex-1].items, propName, range.end);
	}else{
		bottomItemIndex = -1;
	}
	if(topItemIndex !== -1) {
		range.items = ranges[topRangeIndex].items.slice(0, topItemIndex).concat(range.items);
		range.start = ranges[topRangeIndex].start;
	}
	if (bottomItemIndex != -1) {
		index = bottomRangeIndex === ranges.length? bottomRangeIndex -1: bottomRangeIndex;
		range.items = range.items.concat(ranges[index].items.slice(bottomItemIndex));
		range.end = ranges[index].end;
	}
	
	if(bottomItemIndex == topItemIndex && topItemIndex == -1 && bottomRangeIndex == ranges.length) {
		ranges.push(range);
		return ranges;
	}
	ranges.splice(topRangeIndex,bottomRangeIndex - topRangeIndex, range);
	return ranges;
}