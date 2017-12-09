// @flow

import logger from './logger'

async function doNeo4jRequest(url, opts) {
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

	console.log(res.headers)

	const body = await res.json()

	return { res, body }
}

// nodeData: Object
export async function createNode(nodeData) {
	const { res, body } = await doNeo4jRequest('http://localhost:7474/db/data/node', {
		method: 'POST',
		body: nodeData,
	})

	console.log(JSON.stringify(body, null, 4))

	logger.debug('neo4jNodeCreated', body)

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
	const { res, body } = await doNeo4jRequest(`${self.self}/relationships`, {
		method: 'POST',
		body: {
			to: other.self,
			...options,
		},
	})

	logger.debug('neo4jEdgeCreated', body)

	return body
}