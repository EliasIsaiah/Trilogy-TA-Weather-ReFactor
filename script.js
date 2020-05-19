const API_KEY = "6d631d9903c32e6ee9bacd581b66a320";

$(document).ready(function () {
  
  
  
  function removeFromHistory(selectedCity) {
    let oldHistory = JSON.parse(window.localStorage.getItem("history")) || [];
    history = oldHistory.filter((city) => { return city !== selectedCity });
    window.localStorage.setItem("history", JSON.stringify(history));
  }
  
  function makeRow(text) {
    let row = $("<div>").addClass("row mb-1");
    let li = $("<li>").addClass("col-10 mr-auto list-group-item list-group-item-action history").text(text);
    let delButton = $("<button>").attr("class", "col-2 btn btn-danger btn-sm deleteBtn").attr("data-city", text).text("Delete");
    
    $(".searchHistory").append(row.append(li).append(delButton));
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
    
    let title = $("<h3>").addClass("card-title").text(nameDateString);
    let card = $("<div>").addClass("card");
    let wind = $("<p>").addClass("card-text").text(windSpeedString);
    let humid = $("<p>").addClass("card-text").text(humidityString)
    let temp = $("<p>").addClass("card-text").text(temperatureString);
    let cardBody = $("<div>").addClass("card-body");
    let img = $("<img>").attr("src", imgURL);
    
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
      if (weatherData.dt_txt.indexOf("15:00:00") !== -1) { //if the current weatherData Object is for 3:00pm
        // create html elements for a bootstrap card
        let col = $("<div>").addClass("col-md-2");
        let card = $("<div>").addClass("card bg-primary text-white");
        let body = $("<div>").addClass("card-body p-2");
        
        let title = $("<h5>").addClass("card-title").text(new Date(weatherData.dt_txt).toLocaleDateString());
        
        let img = $("<img>").attr("src", `http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`);
        
        let p1 = $("<p>").addClass("card-text").text(`Temp: ${weatherData.main.temp_max} °F`);
        let p2 = $("<p>").addClass("card-text").text(`Humidity: ${weatherData.main.humidity}%`);
        
        // merge together and put on page
        col.append(card.append(body.append(title, img, p1, p2)));
        $("#forecast .row").append(col);
      }
    })
  }
  
  function getWeatherData(searchValue, forecastOrCurrentWeather) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "GET",
        url: `http://api.openweathermap.org/data/2.5/${forecastOrCurrentWeather}?q=${searchValue}&appid=${API_KEY}&units=imperial`,
        dataType: "json"
      }).then((weatherData) => { //this is the same as function(weatherdata) {}
      resolve(weatherData); //buildWeatherDOM(weatherData, searchValue);
    }).catch((error) => {
      reject(error);
    })
  })
}

function getWeather(searchValue) {
  getWeatherData(searchValue, "weather").then((weatherData) => {
    buildWeatherDOM(weatherData);
  })
  getWeatherData(searchValue, "forecast").then((weatherData) => {
    buildFiveDayWeatherDOM(weatherData);
  })
}

function getUVIndex(lat, lon) {
  $.ajax({
    type: "GET",
    url: `http://api.openweathermap.org/data/2.5/uvi?appid=${API_KEY}&lat=${lat}&lon=${lon}`,
    dataType: "json"
  }).then((data)=> {
    let uv = $("<p>").text("UV Index: ");
    let btn = $("<span>").addClass("btn btn-sm").text(data.value);
    
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
  });
}

// get current history, if any
let history = JSON.parse(window.localStorage.getItem("history")) || [];

if (history.length > 0) {
  getWeather(history[history.length - 1])
}

for (let i = 0; i < history.length; i++) {
  makeRow(history[i]);
}

$("#search-button").on("click", function () {

  let searchValue = $("#search-value").val();

  // clear input box
  $("#search-value").val("");

  //if it's a new search add it to the history
  if (history.indexOf(searchValue) === -1) {
    history.push(searchValue);
    window.localStorage.setItem("history", JSON.stringify(history));

    makeRow(searchValue);
  }

  getWeather(searchValue);
});

$(document).on("click", "ul.searchHistory li.history", function () {
  let searchValue = $(this).text();
  getWeather(searchValue);
});

//this is bonus functionality, not required
$(document).on("click", "ul.searchHistory button", function () { 
  let cityToDelete = $(this).attr("data-city"); //get the selected city
  removeFromHistory(cityToDelete);
  $(this).parent().remove();
})
});
