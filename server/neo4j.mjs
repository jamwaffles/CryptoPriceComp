// @flow

import logger from './logger'

// TODO: Multiple reqs https://neo4j.com/docs/developer-manual/current/http-api/

async function doNeo4jRequest(url, opts = { method: 'GET' }) {
	const fetchOpts = {
		method: opts.method,
		headers: {
			Accept: 'application/json; charset=UTF-8',
			'Content-Type': 'application/json',
		},
		body: typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body),
		redirect: 'follow',
	}

	logger.debug('neo4jRequest', { url, fetchOpts })

	const res = await fetch(url, fetchOpts)

	let body = null

	try {
		body = await res.json()
	} catch(e) {
		// Don't care
	}

	return { res, body }
}

// nodeData: Object
export async function createNode(nodeData, opts = {}) {
	const { body: createdBody } = await doNeo4jRequest('http://localhost:7474/db/data/node', {
		method: 'POST',
		body: nodeData,
	})

	logger.debug('neo4jNodeCreated', createdBody)

	if(opts.labels instanceof Array) {
		const { res } = await doNeo4jRequest(
			createdBody.labels,
			{
				method: 'POST',
				body: JSON.stringify(opts.labels),
			}
		)

		logger.debug('neo4jNodeLabelsAdded', { status: res.status, labels: opts.labels })

		return {
			...createdBody,
			metadata: {
				...createdBody.metadata,
				labels: opts.labels,
			},
		}
	}

	return createdBody
}

// Get a node or relationship
export async function getItem(nodeUrl) {
	const { body } = await doNeo4jRequest(nodeUrl)

	return body
}

export async function addNodeToIndex(node, { key, value, index }) {
	const { body } = await doNeo4jRequest(index, {
		method: 'POST',
		body: {
			uri: node.self,
			key,
			value,
		},
	})

	return body
}

export async function searchIndex(index, { key, value }) {
	const searchUrl = `http://localhost:7474/db/data/index/node/${index}/${key}/${value}`

	logger.debug('neoIndexSearch', { searchUrl, index, key, value })

	const { body } = await doNeo4jRequest(searchUrl)

	return body
}

// node: NeoNode
// labels: Array
export async function addLabelToNode(node, labels) {
	const { res } = await doNeo4jRequest(node.labels, {
		method: 'POST',
		body: labels,
	})

	return {
		ok: res.ok,
		status: res.status,
	}
}

export async function createRelationship(self, other, options = { data: {}, type: null }) {
	const { body } = await doNeo4jRequest(`${self.self}/relationships`, {
		method: 'POST',
		body: {
			to: other.self,
			...options,
		},
	})

	logger.debug('neo4jEdgeCreated', body)

	return body
}

export async function getShortestPath(self, other, options = {}) {
	const opts = {
		to: other.self,
		max_depth: 10 || options.max_depth,
		relationships: options.relationships,
		cost_property: options.costProperty,
		algorithm: "dijkstra",
	}

	const { body } = await doNeo4jRequest(`${self.self}/path`, { method: 'POST', body: opts })

	logger.debug('neo4jShortestPath', { body })

	return body
}