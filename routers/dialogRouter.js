const express = require('express');
const dialogRoute = express.Router();
/**
 * Post dialogFlow fulfillment webhook
 * Right now it's not used. But I might used it for future scaling
 */
dialogRoute.post('/', (req, res) => {
    console.log("Got post request from dialogflow");
    res.json({ fulfillmentText: 'This is a sample response from your webhook!' });
});

module.exports = dialogRoute;