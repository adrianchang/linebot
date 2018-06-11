const express = require('express');

//Creates a express client
const app = express();

const lineRoute = require(__dirname + '/routers/lineRouter');
const dialogRoute = require(__dirname + '/routers/dialogRouter');
const trackRoute = require(__dirname + '/routers/trackRouter');

//setUp routers
app.use('/linewebhook', lineRoute);
app.use('/dialogFlow', dialogRoute);
app.use('/tracks', trackRoute);
/**
 * Get main page(heroku)
 */
app.get('/', (req, res)=>{
    res.send("hello world");
});
app.listen(process.env.PORT || 8080, "0.0.0.0", () => {
    console.log("Listening on port " + process.env.PORT);
});