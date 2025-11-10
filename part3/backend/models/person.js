const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const phoneValidator = (value) => {
  
  const phoneRegex = /^\d{2,3}-\d+$/
  
  if (!phoneRegex.test(value)) {
    return false
  }

  if (value.length < 8) {
    return false
  }
  
  return true
}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: phoneValidator,
      message: props => `${props.value} is not a valid phone number! Phone number must have at least 8 characters and be in format: 09-1234556 or 040-22334455`
    },
    required: true
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)