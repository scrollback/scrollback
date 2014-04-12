var format = {
	friendlyTimeRel: function (time, currTime) {
		var d = new Date(parseInt(time, 10)), n = new Date(currTime),
			day_diff = (n.getTime()-d.getTime())/86400000,
			weekDays=["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
				"Friday", "Saturday"],
			months=["January", "February", "March", "April", "May", "June", "July",
				"August", "September", "October", "November", "December"],
			str = "";
		
		if(isNaN(d.getTime()) || isNaN(n.getTime())) return "Sometime";
		
		if (day_diff > 6) {
			str+=months[d.getMonth()] + ' ' + d.getDate();
			str = (d.getFullYear() !== n.getFullYear()? d.getFullYear() + ' ': '')+str;
		}
		else{
			str = str || day_diff > 1? weekDays[d.getDay()]: d.getDay()!=n.getDay()?
			'Yesterday': '';
		}

		return (str? (str + ' at '): '') + d.getHours() + ':' +
			(d.getMinutes()<10? '0': '') + d.getMinutes();
	}
};