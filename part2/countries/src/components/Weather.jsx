const Weather = ({ weather, city }) => {
  const iconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`

  return (
    <div>
      <h2>Weather in {city}</h2>
      <div>temperature {weather.main.temp} Celsius</div>
      <img src={iconUrl} alt={weather.weather[0].description} />
      <div>wind {weather.wind.speed} m/s</div>
    </div>
  )
}

export default Weather