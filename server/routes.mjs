// @flow

import Router from 'koa-router'
import crypto from 'crypto'
import qs from 'querystring'
import nonceLib from 'nonce'
const n = nonceLib()

import logger from './logger'
import config from './config'

const mainRouter = new Router({
	prefix: '',
})

mainRouter.get('/health', async ctx => {
	ctx.body = "Nothing to see here"
})

async function getPoloniexTradingFees() {
	const nonce = n()

	const params = qs.stringify({
		nonce,
		command: 'returnFeeInfo',
	})

	let hash = crypto.createHmac('sha512', config('POLONIEX_API_SECRET'))
	hash.update(params)
	const sign = hash.digest('hex')
	console.log(sign)

	const headers = new Headers({
		'Content-Type': 'application/x-www-form-urlencoded',
		Key: config('POLONIEX_API_KEY'),
		Sign: sign,
		'User-Agent': 'Crypto Comp',
	})

	const fullUrl = `https://poloniex.com/tradingApi?${params}`

	logger.debug('poloniexApiRequest', { fullUrl, method: 'POST', headers, body: params })

	const res = await fetch(fullUrl, { method: 'POST', headers, body: params })

	logger.debug('poloniexApiResponse', { status: res.status })

	return await res.json()
}

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

	// const pairs = await getGdaxPairs()

	// ctx.body = pairs
	ctx.body = await getPoloniexTradingFees()

	// ctx.body = {
	// 	xmrToBtc,
	// 	btcToGbp,
	// 	xmrToGbp: btcToGbp * xmrToBtc,
	// }
})

export default mainRouter
