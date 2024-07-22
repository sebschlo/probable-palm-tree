console.log('Hello, world!')

// creatre a reference to the button
let btn = document.querySelector('.search-button')
let zipcode = document.querySelector('.zipcode')
let form = document.querySelector('form')
let img = document.querySelector('img')

let CITY_NAME = document.querySelector('.city_name')
let CITY_TEMP = document.querySelector('.temperature')

// add an event listener to the button
btn.addEventListener('click', getCityName)

const API_KEY = "";


// event handler
function getCityName(event) {
  event.preventDefault()
  let city_name = zipcode.value;
  console.log(city_name)
  getWeatherData(city_name)
}

function getWeatherData(city) {
  const Url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${encodeURIComponent(API_KEY)}`
  console.log(Url)
    // fetch request goes in here :-)
    fetch(Url)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        const weatherData = data

        let weather_in_celcius = Math.round(weatherData.main.temp - 273.15)

        CITY_NAME.textContent = weatherData.name
        CITY_TEMP.textContent = weather_in_celcius

        const temp = weatherData.main.temp
        const feelsLike = weatherData.main.feels_like
        const humidity = weatherData.main.humidity
        const windSpeed = weatherData.wind.speed
        const weatherDescription = weatherData.weather[0].description
        const weatherIcon = weatherData.weather[0].icon
        const weatherIconUrl = `http://openweathermap.org/img/w/${weatherIcon}.png`
        const weatherLocation = weatherData.name
        const weatherCountry = weatherData.sys.country

        console.log(weatherIcon)
        console.log(weatherIconUrl)

        img.setAttribute('src', weatherIconUrl)

        // console.log(temp, feelsLike, humidity, windSpeed, weatherDescription, weatherIcon, weatherLocation, weatherCountry)
        // document.getElementById('temp').innerText = temp
        // document.getElementById('feels-like').innerText = feelsLike
        // document.getElementById('humidity').innerText = humidity
        // document.getElementById('wind-speed').innerText = windSpeed
        // document.getElementById('weather-description').innerText = weatherDescription
        // document.getElementById('weather-icon').src = weatherIconUrl
        // document.getElementById('weather-location').innerText = weatherLocation
        // document.getElementById('weather-country').innerText = weatherCountry
      
      form.reset()
      zipcode.focus()
      });
}

// getWeatherData()