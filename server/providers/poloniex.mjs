// @flow

import crypto from 'crypto'
import qs from 'querystring'
import nonceLib from 'nonce'
const n = nonceLib()

import logger from '../logger'
import config from '../config'

export async function getPoloniexExchangeRates() {
	const res = await fetch(`https://poloniex.com/public?command=returnTicker`)

	const body = await res.json()

	return Object.entries(body).map(([ k, v ]) => ({
		provider: 'Poloniex',
		from: k.split('_')[0],
		to: k.split('_')[1],
		price: v.last,
	}))
}

// TODO: Finish/use
// export async function getPoloniexTxFees() {
// 	const res = await fetch(`https://poloniex.com/public?command=returnCurrencies`)

// 	const body = await res.json()

// 	let activeCurrencies = []

// 	for(let [ currency, data ] in body) {
// 		if(!data.delisted && !data.frozen) {
// 			activeCurrencies.push({
// 				currency,
// 				fee: data.txFee,
// 			})
// 		}
// 	}
// }

export async function getPoloniexTradingFees() {
	const nonce = n()

	const params = qs.stringify({
		nonce,
		command: 'returnFeeInfo',
	})

	let hash = crypto.createHmac('sha512', config('POLONIEX_API_SECRET'))
	hash.update(params)
	const sign = hash.digest('hex')

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
