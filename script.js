$(document).ready(function () {

  async function getLatLongFromLocation(location, callback) {
    const geocodeApiUrl = `https://geocode.maps.co/search?q=${encodeURIComponent(location)}`;

    try {
      const response = await fetch(geocodeApiUrl);
      const geocodeData = await response.json();

      const results = geocodeData;
      console.log(results);

      if (results && results.length > 0) {
        const firstResult = results[0];
        const { lat, lon } = firstResult;
        callback(lat, lon);
      } else {
        showError("Location not found.");
      }
    } catch (error) {
      showError(`Geocode API Error: ${error.message}`);
    }
  }

  async function getSunriseSunset(latitude, longitude, callback) {
    const sunriseSunsetApiUrl = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&formatted=0`;

    try {
      const response = await fetch(sunriseSunsetApiUrl);
      const data = await response.json();

      callback(data.results);
    } catch (error) {
      showError(`Sunrise Sunset API Error: ${error.message}`);
    }
  }

  function updateDashboard(results, displaySunrise) {
    const resultElement = $("#result");
    resultElement.css("display", "block");
    resultElement.html(`
            <h2>${displaySunrise ? 'Sunrise' : 'Sunset'} details of the given location</h2>
    <div class="columns">
      <div class="column">
        ${displaySunrise ? `<p>Sunrise: ${results.sunrise}</p>` : ''}
        ${!displaySunrise ? `<p>Sunset: ${results.sunset}</p>` : ''}
        <p>Dawn: ${results.dawn}</p>
        <p>Dusk: ${results.dusk}</p>
      </div>
      <div class="column">
        <p>Day Length: ${results.day_length}</p>
        <p>Solar Noon: ${results.solar_noon}</p>
        <p>Time Zone: ${results.timezone}</p>
      </div>
    </div>
  `);
  }

  function updateDashboardCurrentLocation(results) {
    const resultElement = $("#result");
    resultElement.css("display", "block");
    resultElement.html(`
            <h2>Sunrise and sunset details based on your current location</h2>
    <div class="columns">
      <div class="column">
        <p>Sunrise: ${results.sunrise}</p>
        <p>Sunset: ${results.sunset}</p>
        <p>Dawn: ${results.dawn}</p>
        <p>Dusk: ${results.dusk}</p>
      </div>
      <div class="column">
        <p>Day Length: ${results.day_length}</p>
        <p>Solar Noon: ${results.solar_noon}</p>
        <p>Time Zone: ${results.timezone}</p>
      </div>
    </div>
  `);
  }


  function showError(message) {
    const resultElement = $("#result");
    resultElement.css("display", "block");

    resultElement.html(`<p class="error-message">${message}</p>`);
  }

  $("#getCurrentLocation").click(async function () {
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const results = await getSunriseSunsetPromise(latitude, longitude);
      updateDashboardCurrentLocation(results, true);
    } catch (error) {
      showError(`Geolocation Error: ${error.message}`);
    }
  });

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  function getSunriseSunsetPromise(latitude, longitude) {
    const sunriseSunsetApiUrl = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&formatted=0`;

    return fetch(sunriseSunsetApiUrl)
      .then(response => response.json())
      .then(data => data.results)
      .catch(error => {
        showError(`Sunrise Sunset API Error: ${error.message}`);
        throw error;
      });
  }


  $("#getSunrise").click(function () {
    const location = $("#locationInput").val();
    getLatLongFromLocation(location, function (latitude, longitude) {
      getSunriseSunset(latitude, longitude, function (results) {
        updateDashboard(results, true);
      });
    });
  });

  $("#getSunset").click(function () {
    const location = $("#locationInput").val();
    getLatLongFromLocation(location, function (latitude, longitude) {
      getSunriseSunset(latitude, longitude, function (results) {
        updateDashboard(results, false);
      });
    });
  });

});
