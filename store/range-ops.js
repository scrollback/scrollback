"use strict";

module.exports = {
	findIndex: findIndex,
	merge: mergeRange,
	getItems: getItems,
	getAllItems: getAllItems
};


/*
	Finds the insertion point where the value would fit.
*/

function findIndex(items, propName, value, start, end) {
	var pos;
	if (typeof start === 'undefined') {
		return findIndex(items, propName, value, 0, items.length);
	}

	if (value === null) {
		return end;
	}

	if (start >= end) {
		return start;
	}
	pos = ((start + end) / 2) | 0;

	if (items[pos] && items[pos][propName] < value) {
		return findIndex(items, propName, value, pos + 1, end);
	} else if (items[pos - 1] && items[pos - 1][propName] >= value) {
		return findIndex(items, propName, value, start, pos - 1);
	} else {
		return pos;
	}
}


function getItems(ranges, req, propName) {
    var index, startIndex, endIndex, range, missingBefore, missingAfter;
    range = ranges.filter(function (r) {
        return (
            (req[propName] === null && r.end === null) ||
            ((r.start === null || r.start <= req[propName]) &&
            (r.end === null || r.end >= req[propName]))
        );

    })[0];
    if(!range) return ["missing"];

    index = findIndex(range.items, propName, req[propName]);

	if(range.items[index] && range.items[index][propName] === req[propName] && req.before && !req.after) index++;
	/*
		Consider the range [1, 2, 3, 4, 5].
		(index: 3, before: 2) => 2 items [2, 3] so that it is consistent with
		(index: 3, after: 2) =>  2 items [3, 4]. However
		(index: 3, before: 2, after: 2) => 4 items [1, 2, 3, 4].
	*/

    startIndex = index - (req.before || 0);
    endIndex = index + (req.after || 0);

    if(startIndex < 0) {
        if(range.start !== null) missingBefore = true;
        startIndex = 0;
    }

    if(endIndex > range.items.length) {
        if(range.end !== null) missingAfter = true;
        endIndex = range.items.length;
    }

    return Array.prototype.concat(
        (missingBefore? ['missing']: []),
        range.items.slice(startIndex, endIndex),
        (missingAfter? ['missing']: [])
    );
}

function isInRange(range, value) {
	return (range.start === null || range.start <= value) && (range.end === null || range.end >= value);
}


function findTopBound(ranges, propName, value) {
	var topRangeIndex, topItemIndex;
	
	if (value === null) topRangeIndex = -1;
	else {
		for (
			topRangeIndex = 0;
			topRangeIndex < ranges.length && (
				ranges[topRangeIndex].end !== null &&
				ranges[topRangeIndex].end < value);
			topRangeIndex++
		);
	}
	
	if (ranges[topRangeIndex] && isInRange(ranges[topRangeIndex], value)) {
		topItemIndex = findIndex(ranges[topRangeIndex].items, propName, value);
		while(
			ranges[topRangeIndex].items[topItemIndex-1] &&
			ranges[topRangeIndex].items[topItemIndex-1][propName] === value
		) topItemIndex--;
	} else {
		topItemIndex = -1;
	}
	
	return [topRangeIndex, topItemIndex];
}

function findBottomBound(ranges, propName, value) {
	var bottomRangeIndex, bottomItemIndex;
	
	if (value === null) bottomRangeIndex = ranges.length;
	else {
		for (
			bottomRangeIndex = ranges.length-1;
			bottomRangeIndex >= 0 && (
				ranges[bottomRangeIndex].start !== null &&
				ranges[bottomRangeIndex].start > value);
			bottomRangeIndex--
		);
	}
	
	if(ranges[bottomRangeIndex] && isInRange(ranges[bottomRangeIndex], value)){
		bottomItemIndex = findIndex(ranges[bottomRangeIndex].items, propName, value);
		while(
			ranges[bottomRangeIndex].items[bottomItemIndex] &&
			ranges[bottomRangeIndex].items[bottomItemIndex][propName] === value
		) bottomItemIndex++;
	} else {
		bottomItemIndex = -1;
	}
	
	return [bottomRangeIndex, bottomItemIndex];
}

function mergeRange(ranges, range, propName) {
	var topRangeIndex, topItemIndex, bottomRangeIndex, bottomItemIndex, mergedRange = {}, a;

	a = findTopBound(ranges, propName, range.start);
	topRangeIndex = a[0];
	topItemIndex = a[1];
	
	a = findBottomBound(ranges, propName, range.end);
	bottomRangeIndex = a[0];
	bottomItemIndex = a[1];

/*	console.log(JSON.stringify(ranges),'\n', JSON.stringify(range),'\n', topRangeIndex, topItemIndex, bottomRangeIndex, bottomItemIndex);*/

	mergedRange = {start: range.start, end: range.end, items: []};

	if(topItemIndex !== -1) {
		mergedRange.start = ranges[topRangeIndex].start;
		mergedRange.items = mergedRange.items.concat(ranges[topRangeIndex].items.slice(0, topItemIndex));
	}

	mergedRange.items = mergedRange.items.concat(range.items);

	if (bottomItemIndex !== -1) {
		mergedRange.items = mergedRange.items.concat(ranges[bottomRangeIndex].items.slice(bottomItemIndex));
		mergedRange.end = ranges[bottomRangeIndex].end;
	}

	ranges.splice(topRangeIndex, bottomRangeIndex - topRangeIndex + 1, mergedRange);
	return ranges;
}



/*

	Warning: This is an untested function and probably doesn't work.
	
	It is intended to be a more aggressive variant of getItems,
	which does not stop at the boundary of a known range but simply
	inserts a "missing" and goes on to the next range. This allows
	queries to return all the items that are missing.
	
	Todo: Write tests for this function, update higher-level wrappers
	such as store.getTexts and store.getThreads to use this, update
	consumers to handle "missing"s in the middle, especially 
	loadTextsOnNav and loadThreadsOnNav.

*/

function getAllItems(ranges, req, propName) {
    var range, leftBefore = req.before, leftAfter = req.after;
	var topRangeIndex, topItemIndex, bottomRangeIndex, bottomItemIndex, results = [], a, i;

	a = findTopBound(ranges, propName, range.start);
	topRangeIndex = a[0];
	topItemIndex = a[1];
	
	a = findBottomBound(ranges, propName, range.end);
	bottomRangeIndex = a[0];
	bottomItemIndex = a[1];

	// TODO: walk
	
	while(leftBefore > 0) {
		if(topRangeIndex < 0) break;
		
		if(topItemIndex >= 0) {
			if(leftBefore > topItemIndex) {
				leftBefore -= topItemIndex;
				topItemIndex = -1;
			} else {
				topItemIndex -= leftBefore;
				leftBefore = 0;
			}
		} else {
			leftBefore -= 1; // Count "missing" as an item;
			topRangeIndex--;
			topItemIndex = ranges[topRangeIndex].items.length;
		}
	}

	while(leftAfter > 0) {
		if(bottomItemIndex >= ranges.length) break;
		
		if(bottomItemIndex >= 0) {
			if(leftAfter > (ranges[bottomItemIndex].items.length - bottomItemIndex)) {
				leftAfter -= (ranges[bottomItemIndex].items.length - bottomItemIndex);
				bottomItemIndex = -1;
			} else {
				bottomItemIndex += leftAfter;
				leftAfter = 0;
			}
		} else {
			leftAfter -= 1; // Count "missing" as an item;
			bottomRangeIndex++;
			bottomItemIndex = 0;
		}
	}
	
	if(topRangeIndex === bottomRangeIndex) {
		if(topItemIndex === -1) {
			results.push("missing");
		}
		results = results.concat(
			ranges[topRangeIndex].items.slice(
				Math.max(0, topItemIndex),
				Math.max(0, bottomItemIndex)
			)
		);
		if(bottomItemIndex === -1) {
			results.push("missing");
		}
		return results;
	}
	
	if(topItemIndex !== -1) {
		results = results.concat(ranges[topRangeIndex].items.slice(topItemIndex));
	} else {
		results = results.concat(["missing"], ranges[topRangeIndex].items);
	}

	for(i = topRangeIndex + 1; i < bottomRangeIndex; i++) {
		results = results.concat(ranges[i].items, ["missing"]);
	}

	if(bottomItemIndex !== -1) {
		results = results.concat(ranges[bottomRangeIndex].items.slice(0, bottomItemIndex));
	} else {
		results = results.concat(ranges[bottomRangeIndex].items, ["missing"]);
	}
	
	return results;
	
//	
//    index = findIndex(range.items, propName, req[propName]);
//
//	if(range.items[index] && range.items[index][propName] === req[propName] && req.before && !req.after) index++;
//	/*
//		Consider the range [1, 2, 3, 4, 5].
//		(index: 3, before: 2) => 2 items [2, 3] so that it is consistent with
//		(index: 3, after: 2) =>  2 items [3, 4]. However
//		(index: 3, before: 2, after: 2) => 4 items [1, 2, 3, 4].
//	*/
//
//    startIndex = index - (req.before || 0);
//    endIndex = index + (req.after || 0);
//
//    if(startIndex < 0) {
//        if(range.start !== null) missingBefore = true;
//        startIndex = 0;
//    }
//
//    if(endIndex > range.items.length) {
//        if(range.end !== null) missingAfter = true;
//        endIndex = range.items.length;
//    }
//
//    return Array.prototype.concat(
//        (missingBefore? ['missing']: []),
//        range.items.slice(startIndex, endIndex),
//        (missingAfter? ['missing']: [])
//    );
}
