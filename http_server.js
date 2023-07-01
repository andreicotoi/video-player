const express = require('express')
const app = express()

let port = 3000

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html')
}).listen(port, () => {
	console.log(`App started! Go to http://localhost:${port} to see the player.`);
})

app.use(express.static(__dirname))


