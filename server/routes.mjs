// @flow

import Router from 'koa-router'

import logger from './logger'
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
		.map(currency =>
			neo.createNode({ currency, source: 'GDAX' }, { labels: [ 'currency', 'gdax' ] })
				.then(node => neo.addNodeToIndex(node, { key: 'gdax', value: currency, index: 'http://localhost:7474/db/data/index/node/currencies' })
			))
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
})

mainRouter.get('/:from/:to', async ctx => {
	const fromNode = await neo.searchIndex('currencies', { key: 'gdax', value: ctx.params.from.toUpperCase() })
	const toNode = await neo.searchIndex('currencies', { key: 'gdax', value: ctx.params.to.toUpperCase() })

	logger.debug('pathRequest', { fromNode, toNode })

	const { nodes, relationships } = await neo.getShortestPath(fromNode[0], toNode[0], { relationships: { type: "exchange", "direction": "out" }, costProperty: "last" })

	const nodeData = (await Promise.all(nodes.map(neo.getItem))).map(item => item.data)
	const relData = (await Promise.all(relationships.map(neo.getItem))).map(item => item.data)

	const enriched = nodeData.map((node, i) => ({
		...node,
		...(relData[i] || {}),
	}))

	ctx.body = enriched
})

export default mainRouter
