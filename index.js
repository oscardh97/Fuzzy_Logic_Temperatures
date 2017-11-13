$(document).ready(function() {
	// console.log(arguments);
	bindEvents();
});

var getValues = function() {
	return {
		city: $("#ciudad").val() || "Tegucigalpa"
	}
};
var getWeather = function() {
	var _data = getValues(); 
	$.ajax({
		type: "GET",
        url: "http://api.worldweatheronline.com/premium/v1/weather.ashx",
        data: {
			q: _data.city,
			key: "98e6471d57df456d9e105014171311",
			format: "json",
			mca: "yes"
		},
        dataType: "json",
        success: function (msg) {       
            console.log(msg);
            analizeData(msg.data);
        },
        error: function (req, status, error) {
            console.log(req + "# " + status + "@ " + error);
        }
    });
};

var analizeYear = function(months) {
	console.log("@analizeYear.arguments", months);
	var absMaxTemp = 0;
	var avgMinTemp = 0;
	var avgRainFall = 0;
	var today = new Date();
	var actualMonth = today.getMonth();

	for (var i = 0; i < months.length; i++) {
		absMaxTemp += parseFloat(months[i].absMaxTemp);
		avgMinTemp += parseFloat(months[i].avgMinTemp);
		avgRainFall += parseFloat(months[i].avgDailyRainfall);
	
	}
	absMaxTemp /= months.length;
	avgMinTemp /= months.length;
	avgRainFall /= months.length;
	
	return {
		year: {
			avgMax: absMaxTemp,
			avgMin: avgMinTemp,
			avgRain: avgRainFall
		},
		month: {
			avgMax: months && months[actualMonth] ? parseFloat(months[actualMonth].absMaxTemp) : null,
			avgMin: months && months[actualMonth] ? parseFloat(months[actualMonth].avgMinTemp) : null,
			avgRain: months && months[actualMonth] ? parseFloat(months[actualMonth].avgDailyRainfall) : null
		}
	};
};

var compare = function(avgValues, actualValue, isYear) {
	var mean = Math.abs(avgValues.avgMin - avgValues.avgMax) / 8;
	var tr = $("<tr></tr>");
	var retVal = "";

	tr.append("<td>Desde -50 hasta " + (avgValues.avgMin - mean).toFixed(2) + "</td>");
	tr.append("<td>Desde " + (avgValues.avgMin - mean).toFixed(2) + " hasta " + (avgValues.avgMin + mean).toFixed(2) + "</td>");
	tr.append("<td>Desde " + (avgValues.avgMin + mean).toFixed(2) + " hasta " + (avgValues.avgMin + (2 * mean)).toFixed(2) + "</td>");
	tr.append("<td>Desde " + (avgValues.avgMin + (2 * mean)).toFixed(2) + " hasta " + (avgValues.avgMin + (3 * mean)).toFixed(2) + "</td>");
	tr.append("<td>Desde " + (avgValues.avgMin + (3 * mean)).toFixed(2) + " hasta " + (avgValues.avgMin + (5 * mean)).toFixed(2) + "</td>");
	tr.append("<td>Desde " + (avgValues.avgMin + (5 * mean)).toFixed(2) + " hasta " + (avgValues.avgMax - (2 * mean)).toFixed(2) + "</td>");
	tr.append("<td>Desde " + (avgValues.avgMax - (2 * mean)).toFixed(2) + " hasta " + (avgValues.avgMax - mean).toFixed(2) + "</td>");
	tr.append("<td>Desde " + (avgValues.avgMax - mean).toFixed(2) + " hasta " + (avgValues.avgMax + mean).toFixed(2) + "</td>");
	tr.append("<td>Desde " + (avgValues.avgMax + mean).toFixed(2) + " hasta 100 </td>");

	$("#tableValues" + (isYear ? "Year" : "Month")).empty().append(tr);

	console.log("Mean", mean);
	console.log("AvgMin", avgValues.avgMin);
	console.log("AvgMax", avgValues.avgMax);
	console.log("ActualValue", actualValue);
	var index = -1;

	if (actualValue < avgValues.avgMin - mean) {
		retVal = "Muy Helado";
		index = 0;
	} else if (actualValue < avgValues.avgMin + mean) {
		retVal = "Helado";
		index = 1;
	} else if (actualValue < avgValues.avgMin + (2 * mean)) {
		retVal = "Fresco";
		index = 2;
	} else if (actualValue < avgValues.avgMin + (3 * mean)) {
		retVal = "Agradable";
		index = 3;
	} else if (actualValue < avgValues.avgMin + (5 * mean)) {
		retVal = "Ideal;"
		index = 4;
	} else if (actualValue < avgValues.avgMax - (2 * mean)) {
		retVal = "Cálido";
		index = 5;
	} else if (actualValue < avgValues.avgMax - mean) {
		retVal = "Caliente";
		index = 6;
	} else if (actualValue < avgValues.avgMax + mean) {
		retVal = "Muy Caliente";
		index = 7;
	} else {
		retVal = "Ardiente";
		index = 8;
	}

	var flag = true;
	setInterval(function() {
		tr.find("td").eq(index).css("background-color", flag ? "#337ab7" : "#dfd94c");
		flag = !flag;
	}, 1500);

	return retVal;
};

var analizeData = function(data) {
	var yearData = analizeYear(data.ClimateAverages[0].month);

	console.log("Year", compare(yearData.year, data.current_condition[0].FeelsLikeC, true));
	console.log("Month", compare(yearData.month, data.current_condition[0].FeelsLikeC, false));

	$("#valActual").html(data.current_condition[0].FeelsLikeC + " C");
	$("#valMinY").html(yearData.year.avgMin.toFixed(2) + " C");
	$("#valMaxY").html(yearData.year.avgMax.toFixed(2) + " C");
	$("#valMinM").html(yearData.month.avgMin.toFixed(2) + " C");
	$("#valMaxM").html(yearData.month.avgMax.toFixed(2) + " C");
};

var bindEvents = function() {
	$("#search").bind("click", getWeather);
};
