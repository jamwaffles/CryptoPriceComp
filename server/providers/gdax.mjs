// @flow

import logger from '../logger'

export async function getGdaxExchangeRates() {
	const res = await fetch('https://api.gdax.com/products')
	const products = await res.json()

	logger.info('gdaxProductsList', products)

	let pairs = []

	for(let product of products) {
		const prod = await fetch(`https://api.gdax.com/products/${product.id}/ticker`)
		const { price } = await prod.json()

		pairs.push({
			provider: 'GDAX',
			from: product.base_currency,
			to: product.quote_currency,
			price,
		})
	}

	return pairs
}
