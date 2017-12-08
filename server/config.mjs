import dotenv from 'dotenv'
dotenv.config()

export default function getConfigVar(key) {
  return process.env[key] || ''
}
