// @flow

import Router from 'koa-router'

import { getGdaxExchangeRates } from './providers/gdax'
import { getPoloniexExchangeRates } from './providers/poloniex'

import * as neo from './neo4j'

const mainRouter = new Router({
	prefix: '',
})

mainRouter.get('/health', async ctx => {
	ctx.body = "Nothing to see here"
})

mainRouter.get('/update', async ctx => {
	const gdaxPairs = await getGdaxExchangeRates()

	const uniqueGdaxCurrencies = gdaxPairs
		.reduce((carry, pair) => {
			carry.add(pair.from)
			carry.add(pair.to)

			return carry
		}, new Set())

	const gdaxNodes = await Promise.all(
		Array.from(
			uniqueGdaxCurrencies.values()
		)
		.map(currency => neo.createNode({ currency }, { labels: [ 'currency' ] }))
	)

	const gdaxEdges = await Promise.all(
		gdaxPairs
			.map(pair => {
				const fromNode = gdaxNodes.find(n => n.data.currency === pair.from)
				const toNode = gdaxNodes.find(n => n.data.currency === pair.to)

				return neo.createRelationship(
					fromNode,
					toNode,
					{ type: 'exchange', data: { last: pair.price } }
				)
			})
	)

	ctx.body = {
		gdaxNodes,
		gdaxEdges,
	}


	// try {
	// 	const xmr = await neo.createNode({ currency: 'XMR' })
	// 	const btc = await neo.createNode({ currency: 'BTC' })
	// 	const gbp = await neo.createNode({ currency: 'GBP' })

	// 	await neo.createRelationship(xmr, btc, { type: 'exchange', data: { last: 0.01 } })
	// 	await neo.createRelationship(btc, gbp, { type: 'exchange', data: { last: 12000.0 } })

	// 	ctx.body = 'noice'
	// } catch(e) {
	// 	console.error(e)
	// }

	// ctx.body = 'noice'
})

// mainRouter.get('/:from/:to', async ctx => {
// 	const fromNode =
// 	const toNode =

// 	const path = await neo.getShortesPath(fromNode, toNode, { relationships: { type: "exchange", "direction": "out" }})
// })

export default mainRouter
