import { useState, useEffect } from 'react'
import personService from './services/persons'
import './index.css'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
      .catch(error => {
        setErrorMessage('Failed to fetch persons from server')
        setTimeout(() => setErrorMessage(null), 5000)
      })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()
    
    const existingPerson = persons.find(p => p.name === newName)
    
    if (existingPerson) {
      if (window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      )) {
        const changedPerson = { ...existingPerson, number: newNumber }
        
        personService
          .update(existingPerson.id, changedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(p => 
              p.id !== existingPerson.id ? p : returnedPerson
            ))
            setSuccessMessage(`Updated ${returnedPerson.name}'s number`)
            setTimeout(() => setSuccessMessage(null), 5000)
            setNewName('')
            setNewNumber('')
          })
          .catch(error => {
            if (error.response) {
              setErrorMessage(error.response.data.error)
            } else {
              setErrorMessage(`Information of ${existingPerson.name} has already been removed from server`)
            }
            setTimeout(() => setErrorMessage(null), 5000)
            setPersons(persons.filter(p => p.id !== existingPerson.id))
          })
      }
    } else {
      const personObject = {
        name: newName,
        number: newNumber
      }

      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setSuccessMessage(`Added ${returnedPerson.name}`)
          setTimeout(() => setSuccessMessage(null), 5000)
          setNewName('')
          setNewNumber('')
        })
        .catch(error => {
          if (error.response) {
            setErrorMessage(error.response.data.error)
          } else {
            setErrorMessage('Failed to add person')
          }
          setTimeout(() => setErrorMessage(null), 5000)
        })
    }
  }

  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
          setSuccessMessage(`Deleted ${name}`)
          setTimeout(() => setSuccessMessage(null), 5000)
        })
        .catch(error => {
          setErrorMessage(
            `Information of ${name} has already been removed from server`
          )
          setTimeout(() => setErrorMessage(null), 5000)
          setPersons(persons.filter(p => p.id !== id))
        })
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const personsToShow = filter
    ? persons.filter(person => 
        person.name.toLowerCase().includes(filter.toLowerCase())
      )
    : persons

  return (
    <div>
      <h2>Phonebook</h2>
      
      <Notification message={errorMessage} type="error" />
      <Notification message={successMessage} type="success" />
      
      <Filter filter={filter} handleFilterChange={handleFilterChange} />
      
      <h3>Add a new</h3>
      
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      
      <h3>Numbers</h3>
      
      <Persons persons={personsToShow} deletePerson={deletePerson} />
    </div>
  )
}

const Notification = ({ message, type }) => {
  if (message === null) {
    return null
  }

  return (
    <div className={type}>
      {message}
    </div>
  )
}

const Filter = ({ filter, handleFilterChange }) => {
  return (
    <div>
      filter shown with: <input value={filter} onChange={handleFilterChange} />
    </div>
  )
}

const PersonForm = ({ 
  addPerson, 
  newName, 
  handleNameChange, 
  newNumber, 
  handleNumberChange 
}) => {
  return (
    <form onSubmit={addPerson}>
      <div>
        name: <input value={newName} onChange={handleNameChange} />
      </div>
      <div>
        number: <input value={newNumber} onChange={handleNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ persons, deletePerson }) => {
  return (
    <div>
      {persons.map(person =>
        <Person 
          key={person.id} 
          person={person} 
          deletePerson={() => deletePerson(person.id, person.name)}
        />
      )}
    </div>
  )
}

const Person = ({ person, deletePerson }) => {
  return (
    <div>
      {person.name} {person.number} 
      <button onClick={deletePerson}>delete</button>
    </div>
  )
}

export default App