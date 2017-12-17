import Koa from 'koa'
import favicon from 'koa-favicon'
import bodyParser from 'koa-bodyparser'
import serveStatic from 'koa-static'
import path from 'path'

import requestLogger from './middleware/requestLogger'
import router from './routes'

const app = new Koa()

app.use(favicon())
app.use(bodyParser())
app.use(serveStatic('public'))
app.use(requestLogger)
app.use(router.routes())

export default app
