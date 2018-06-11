const express = require('express');
const trackRoute = express.Router();

const database = require(__dirname + "/../modules/database.js");
const getAudioFromDB = database.getAudioFromDB;


/**
 * Handle audio get request
 */
trackRoute.get('/:trackID', (req, res) => {
    getAudioFromDB(req.params.trackID).then((buffer) => {
        res.set('content-type', 'audio/mp4');
        res.set('accept-ranges', 'bytes');
        console.log("sendddddddddddddd");
        res.send(buffer);
        res.end();
    });
});

module.exports = trackRoute;