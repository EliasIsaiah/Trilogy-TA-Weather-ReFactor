const apiKey = "6d631d9903c32e6ee9bacd581b66a320";
$(document).ready(function () {
  $("#search-button").on("click", function () {


    var searchValue = $("#search-value").val();

    // clear input box
    $("#search-value").val("");

    if (history.indexOf(searchValue) === -1) {
      history.push(searchValue);
      window.localStorage.setItem("history", JSON.stringify(history));

      makeRow(searchValue);
    }
    
    getWeatherData(searchValue, "weather").then((weatherData) => {
      buildWeatherDOM(weatherData);
    })
      .then(() => {
        getWeatherData(searchValue, "forecast").then((weatherData) => {
          buildFiveDayWeatherDOM(weatherData);
        })
      })
  });
  

  $(".history").on("click", "li", function () {
    let searchValue = $(this).text();
    getWeatherData(searchValue, "weather").then((weatherData) => {
      buildWeatherDOM(weatherData);
    })
      .then(() => {
        getWeatherData(searchValue, "forecast").then((weatherData) => {
          buildFiveDayWeatherDOM(weatherData);
        })
      })
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  function buildWeatherDOM(weatherData) {

    // clear any old content
    $("#today").empty();

    // create html content for current weather
    let nameDateString = `${weatherData.name} ${new Date().toLocaleDateString()}`
    let windSpeedString = `Wind Speed: ${weatherData.wind.speed} MPH`
    let humidityString = `Humidity: ${weatherData.main.humidity}%`
    let temperatureString = `Temperature: ${weatherData.main.temp}°F`
    let imgURL = `http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`

    var title = $("<h3>").addClass("card-title").text(nameDateString);
    var card = $("<div>").addClass("card");
    var wind = $("<p>").addClass("card-text").text(windSpeedString);
    var humid = $("<p>").addClass("card-text").text(humidityString)
    var temp = $("<p>").addClass("card-text").text(temperatureString);
    var cardBody = $("<div>").addClass("card-body");
    var img = $("<img>").attr("src", imgURL);

    // merge and add to page
    title.append(img);
    cardBody.append(title, temp, humid, wind);
    card.append(cardBody);
    $("#today").append(card);

    getUVIndex(weatherData.coord.lat, weatherData.coord.lon);
  }

  function buildFiveDayWeatherDOM(weatherData) {
    $forecastTitleH4 = $("<h4>").addClass("mt-3");
    $forecastTitleH4.text("5-Day Forecast:")
    $newRow = $("<div>").addClass("row");
    // $("#forecast").html(`<h4 class="mt-3">5-Day Forecast:</h4>").append("<div class="row">`);
    $("#forecast").empty()
      .append($forecastTitleH4, $newRow);

    // loop over all forecasts (by 3-hour increments)
    weatherData.list.map((weatherData) => {
      // only look at forecasts around 3:00pm
      if (weatherData.dt_txt.indexOf("15:00:00") !== -1) {
        // create html elements for a bootstrap card
        var col = $("<div>").addClass("col-md-2");
        var card = $("<div>").addClass("card bg-primary text-white");
        var body = $("<div>").addClass("card-body p-2");

        var title = $("<h5>").addClass("card-title").text(new Date(weatherData.dt_txt).toLocaleDateString());

        var img = $("<img>").attr("src", `http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`);

        var p1 = $("<p>").addClass("card-text").text(`Temp: ${weatherData.main.temp_max} °F`);
        var p2 = $("<p>").addClass("card-text").text(`Humidity: ${weatherData.main.humidity}%`);

        // merge together and put on page
        col.append(card.append(body.append(title, img, p1, p2)));
        $("#forecast .row").append(col);
      }
    })
  }


  // async function getWeatherData(searchValue, forecastOrCurrentWeather) {
  //   let weatherData;

  //   try {
  //     weatherData = await $.ajax({
  //       type: "GET",
  //       url: `http://api.openweathermap.org/data/2.5/${forecastOrCurrentWeather}?q=${searchValue}&appid=${apiKey}&units=imperial`,
  //       dataType: "json"
  //     });

  //     return weatherData
  //   } catch(error) {
  //     console.error(error);
  //   }
  // }

  function getWeatherData(searchValue, forecastOrCurrentWeather) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "GET",
        url: `http://api.openweathermap.org/data/2.5/${forecastOrCurrentWeather}?q=${searchValue}&appid=${apiKey}&units=imperial`,
        dataType: "json"
      }).then((weatherData) => { //this is the same as function(weatherdata) {}
        resolve(weatherData); //buildWeatherDOM(weatherData, searchValue);
      }).catch((error) => {
        reject(error);
      })
    })
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`,
      dataType: "json",
      success: function (data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);

        // change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }

        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    getWeatherData(history[history.length - 1], "weather").then((weatherData) => {
      buildWeatherDOM(weatherData);
    })
      .then(() => {
        getWeatherData(history[history.length - 1], "forecast").then((weatherData) => {
          buildFiveDayWeatherDOM(weatherData);
        })
      })
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
