const express = require('express')
// 静态资源压缩
const compression = require('compression')
const https = require('https')
const fs = require('fs')
const app = express()

const options = {
    cert: fs.readFileSync('./full_chain.pem'),
    key: fs.readFileSync('./private.key')
}

app.use(compression())
app.use(express.static('./dist'))

app.listen(8080, () => {
    console.log('服务器正在运行，地址为127.0.0.1:8080')
})

// https.createServer(options, app).listen(443)