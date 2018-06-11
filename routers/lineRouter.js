const express = require('express');
const linebot = require('linebot');
const lineRoute = express.Router();

//Create a linebot and parser
const bot = linebot({
    channelId: process.env.myChannelId,
    channelSecret: process.env.myChannelSecret,
    channelAccessToken: process.env.myChannelAccessToken
});

//Get insert audio functions
const database = require(__dirname + "/../modules/database.js");
const insertAudioToDB = database.insertAudioToDB;

const linebotParser = bot.parser();

//Define error function
const helperFunctions = require(__dirname + "/../modules/helperFunction.js");
const printErrorMessage = helperFunctions.printErrorMessage;

//Define text processing functions
const textProcessor = require(__dirname + "/../modules/textProcess.js");
const processText = textProcessor.processText;

//Define speech to text functions
const sst = require(__dirname + "/../modules/sstFunctions.js");
const speechRecognition = sst.speechRecognition;
const queryRecognition = sst.queryRecognition;

//Define text to speech functions
const tts = require(__dirname + "/../modules/ttsFunctions.js");
const convertTextToSpeech = tts.convertTextToSpeech;

/**
 * Post line webhook
 * parse the package
 */
lineRoute.post('/', linebotParser);

/**
 * When linebot get a line webhook message Post it to dialogflow
 * After getting response from dialogflow send the respond to user
 */
bot.on('message', (event) => {
    if (event.message.text !== undefined){
        processText(event.message.text).then((dialogReply)=>{
            event.reply(dialogReply).then((data)=>{
                console.log('Success' + data);
            }).catch(printErrorMessage);
        }).catch(printErrorMessage);
    }else{
        event.message.content().then(function (content) {
            console.log("got voice note! ");
            speechRecognition(content)
                .then(queryRecognition)
                .then(processText)
                .then(convertTextToSpeech)
                .then(insertAudioToDB)
                .then(({id, duration}) => {
                    event.reply({
                        type: 'audio',
                        originalContentUrl: 'https://adrian-chatbot.herokuapp.com/tracks/' + id,
                        duration: duration
                    });
                })
                .catch((err) => {
                    printErrorMessage(err);
                });
        });
    }
});

module.exports = lineRoute;