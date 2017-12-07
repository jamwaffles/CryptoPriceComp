import Router from 'koa-router'

const mainRouter = new Router({
	prefix: '',
})

mainRouter.get('/health', async ctx => {
	ctx.body = "Nothing to see here"
})

mainRouter.get('/xmr/gbp', async ctx => {
	const pres = await fetch('https://poloniex.com/public?command=returnTicker')
	const { BTC_XMR } = await pres.json()

	const xmrToBtc = parseFloat(BTC_XMR.last)

	const gdaxRes = await fetch('https://api.gdax.com/products/BTC-GBP/ticker')
	const gdax = await gdaxRes.json()

	const btcToGbp = parseFloat(gdax.price)

	ctx.body = {
		xmrToBtc,
		btcToGbp,
		xmrToGbp: btcToGbp * xmrToBtc,
	}
})

export default mainRouter
