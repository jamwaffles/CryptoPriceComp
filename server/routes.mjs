import Router from 'koa-router'

import logger from './logger'

const mainRouter = new Router({
	prefix: '',
})

mainRouter.get('/health', async ctx => {
	ctx.body = "Nothing to see here"
})

async function getGdaxPairs() {
	const res = await fetch('https://api.gdax.com/products')
	const products = await res.json()

	logger.info('gdaxProductsList', products)

	let pairs = []

	for(let product of products) {
		const prod = await fetch(`https://api.gdax.com/products/${product.id}/ticker`)
		const { price } = await prod.json()

		pairs.push({
			from: product.base_currency,
			to: product.quote_currency,
			price,
		})
	}

	return pairs
}

mainRouter.get('/xmr/gbp', async ctx => {
	// const pres = await fetch('https://poloniex.com/public?command=returnTicker')
	// const { BTC_XMR } = await pres.json()

	// const xmrToBtc = parseFloat(BTC_XMR.last)

	// const gdaxRes = await fetch('https://api.gdax.com/products/BTC-GBP/ticker')
	// const gdax = await gdaxRes.json()

	// const btcToGbp = parseFloat(gdax.price)

	const pairs = await getGdaxPairs()

	ctx.body = pairs

	// ctx.body = {
	// 	xmrToBtc,
	// 	btcToGbp,
	// 	xmrToGbp: btcToGbp * xmrToBtc,
	// }
})

export default mainRouter
