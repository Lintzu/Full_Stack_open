import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'
import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const showNotification = (text, type) => {
    setNotification({ text, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const addPerson = (event) => {
    event.preventDefault()
    
    const personExists = persons.find(person => person.name === newName)
    
    if (personExists) {
      const confirmUpdate = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      )
      
      if (confirmUpdate) {
        const changedPerson = { ...personExists, number: newNumber }
        
        personService
          .update(personExists.id, changedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(person => 
              person.id !== personExists.id ? person : returnedPerson
            ))
            setNewName('')
            setNewNumber('')
            showNotification(
              `Updated ${returnedPerson.name}`,
              'success'
            )
          })
          .catch(error => {
            showNotification(
              `Information of ${personExists.name} has already been removed from server`,
              'error'
            )
            setPersons(persons.filter(p => p.id !== personExists.id))
          })
      }
      return
    }

    const personObject = {
      name: newName,
      number: newNumber,
    }

    personService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
        showNotification(
          `Added ${returnedPerson.name}`,
          'success'
        )
      })
      .catch(error => {
        showNotification(
          `Failed to add ${newName}`,
          'error'
        )
      })
  }

  const deletePerson = (id) => {
    const person = persons.find(p => p.id === id)
    const confirmDelete = window.confirm(`Delete ${person.name}?`)
    
    if (confirmDelete) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
          showNotification(
            `Deleted ${person.name}`,
            'success'
          )
        })
        .catch(error => {
          showNotification(
            `Information of ${person.name} has already been removed from server`,
            'error'
          )
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
      
      <Notification message={notification} />
      
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

export default App