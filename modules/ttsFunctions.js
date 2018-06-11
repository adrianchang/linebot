// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');

// Creates a client
const textClient = new textToSpeech.TextToSpeechClient({
    keyFilename: __dirname +  '/speechkey.json'
});
/**
 * Performs the Text-to-Speech request
 * @param text the text to convert to speech
 */
exports.convertTextToSpeech = function convertTextToSpeech(text){
    // Construct the text to speech request
    const ttsRequest = {
        input: {text: text},
        // Select the language and SSML Voice Gender (optional)
        voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
        // Select the type of audio encoding
        audioConfig: {audioEncoding: 'MP3'},
    };

    return new Promise((resolve, reject) => {
        textClient.synthesizeSpeech(ttsRequest, (err, response) => {
            if (err) {
                reject("convertTextToSpeech " + err);
            }
            resolve(response.audioContent);
        });
    });
}