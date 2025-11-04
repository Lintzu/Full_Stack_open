import { useState, useEffect } from 'react'
import weatherService from '../services/weather'
import Weather from './Weather'

const CountryDetails = ({ country }) => {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    // Fetch weather for capital city
    if (country.capital && country.capital[0]) {
      weatherService
        .getWeather(country.capital[0])
        .then(weatherData => {
          setWeather(weatherData)
        })
        .catch(error => {
          console.log('Error fetching weather:', error)
        })
    }
  }, [country])

  return (
    <div>
      <h1>{country.name.common}</h1>
      
      <div>capital {country.capital ? country.capital[0] : 'N/A'}</div>
      <div>area {country.area}</div>
      
      <h3>languages:</h3>
      <ul>
        {Object.values(country.languages || {}).map(language => (
          <li key={language}>{language}</li>
        ))}
      </ul>
      
      <img 
        src={country.flags.png} 
        alt={`flag of ${country.name.common}`}
        width="150"
      />
      
      {weather && <Weather weather={weather} city={country.capital[0]} />}
    </div>
  )
}

export default CountryDetails