const fs = require('fs')
const ini = require('ini')
const path = require('path')

const { configFilePath, defaultConfig } = require('./config')


let configFileContent = {}
if (fs.existsSync(configFilePath)) {
  configFileContent = ini.parse(fs.readFileSync(configFilePath, 'utf-8'))
}
const config = { ...defaultConfig, ...configFileContent }

module.exports = {
  get,
  set,
  remove,
  override
}

function get(key) {
  if (key) {
    return config[key]
  }
  return config
}

function set(key, value) {
  config[key] = value
  configFileContent[key] = value
  fs.writeFileSync(configFilePath, ini.stringify(configFileContent))
}

function remove(key) {
  delete config[key]
  delete configFileContent[key]
  fs.writeFileSync(configFilePath, ini.stringify(configFileContent))
}

function override(newConfig) {
  Object.assign(config, newConfig)
  fs.writeFileSync(configFilePath, ini.stringify(newConfig))
}

