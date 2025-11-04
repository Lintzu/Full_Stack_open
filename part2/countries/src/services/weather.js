import axios from 'axios'

const api_key = import.meta.env.VITE_OPENWEATHER_API_KEY
const baseUrl = 'https://api.openweathermap.org/data/2.5/weather'

const getWeather = (city) => {
  const request = axios.get(baseUrl, {
    params: {
      q: city,
      appid: api_key,
      units: 'metric'
    }
  })
  return request.then(response => response.data)
}

export default { getWeather }