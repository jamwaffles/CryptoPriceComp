import logger from '../logger'

export default async function requestLogger(ctx, next) {
	const start = Date.now()

	await next()

	logger.info('httpRequest', {
		time: Date.now() - start,
		href: ctx.href,
		method: ctx.method,
		// TODO: Session
	})
}