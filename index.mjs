import 'isomorphic-fetch'

import logger from './server/logger'
import server from './server'

import config from './server/config'

const port = config('PORT')

if(!port) {
	logger.error('invalidPortNumber', { port })

	process.exit()
}

server.listen(port, () => {
	logger.info('serverStarted', { port })
})
