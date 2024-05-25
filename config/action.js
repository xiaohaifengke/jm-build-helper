const {configFilePath} = require('./config')
const { get, set, remove } = require('./index')
const {guide} = require('./guide')
module.exports = async function(value, options) {
  if (Object.keys(options).length === 0) {
    await guide()
    return
  }
  for(const h in options) {
    if (h === 'get') {
      const key = options[h]
      const result = get(key)
      console.log(result)
    } else if (h === 'set') {
      const key = options[h]
      set(key, value)
      console.log(`You have updated the option: ${key} to ${value}`)
    } else if (h === 'delete') {
      const key = options[h]
      remove(key)
      console.log(`You have removed the option: ${key}`)
    } else if (h === 'json') {
      const config = get()
      console.log(JSON.stringify(config, null, 2))
    }
  }
}
