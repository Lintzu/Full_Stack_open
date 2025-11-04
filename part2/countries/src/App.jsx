import { useState, useEffect } from 'react'
import countryService from './services/countries'
import SearchFilter from './components/SearchFilter'
import CountryList from './components/CountryList'
import CountryDetails from './components/CountryDetails'

const App = () => {
  const [countries, setCountries] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)

  // Fetch all countries on mount
  useEffect(() => {
    countryService
      .getAll()
      .then(allCountries => {
        setCountries(allCountries)
      })
      .catch(error => {
        console.log('Error fetching countries:', error)
      })
  }, [])

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    setSelectedCountry(null) // Clear selected country when search changes
  }

  const handleShowCountry = (country) => {
    setSelectedCountry(country)
  }

  // Filter countries based on search
  const filteredCountries = search
    ? countries.filter(country =>
        country.name.common.toLowerCase().includes(search.toLowerCase())
      )
    : []

  return (
    <div>
      <SearchFilter search={search} handleSearchChange={handleSearchChange} />
      
      {selectedCountry ? (
        <CountryDetails country={selectedCountry} />
      ) : (
        <>
          {search && filteredCountries.length > 10 && (
            <p>Too many matches, specify another filter</p>
          )}
          
          {search && filteredCountries.length > 1 && filteredCountries.length <= 10 && (
            <CountryList 
              countries={filteredCountries} 
              handleShowCountry={handleShowCountry}
            />
          )}
          
          {search && filteredCountries.length === 1 && (
            <CountryDetails country={filteredCountries[0]} />
          )}
          
          {search && filteredCountries.length === 0 && (
            <p>No matches found</p>
          )}
        </>
      )}
    </div>
  )
}

export default App