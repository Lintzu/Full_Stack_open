const CountryList = ({ countries, handleShowCountry }) => {
  return (
    <div>
      {countries.map(country => (
        <div key={country.name.common}>
          {country.name.common} 
          <button onClick={() => handleShowCountry(country)}>show</button>
        </div>
      ))}
    </div>
  )
}

export default CountryList