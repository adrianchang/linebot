//Libraries for sound encoding convertion
const createAudioBuffer = require('audio-buffer-from');
const toWav = require('audiobuffer-to-wav');
const AudioContext = require('web-audio-api').AudioContext;
const audioContext = new AudioContext;
const btoa = require('btoa');

const sampleRate = 16000;

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');

//Create a speech client
const speechClient = new speech.SpeechClient({
    keyFilename: __dirname +  '/speechkey.json'
});

/**
 * Helper function to convert buffer to base64
 * @param buffer to convert
 * @returns {*} String of base64
 */
function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * convert content buffer and recognize the audio file
 * @param contentBuffer download from line content
 * @returns {Promise<any>} resolve: baseEncoded string, reject: none
 */
exports.speechRecognition = function speechRecognition(contentBuffer) {
    console.log("type of contentbuffer " + (typeof contentBuffer));
    return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(contentBuffer, (buffer) => {
            // console.log("buffer length " + buffer.length);
            let audioBuffer = createAudioBuffer(buffer);
            let wav = toWav(audioBuffer);
            let chunk = new Uint8Array(wav);
            let baseEncoded = arrayBufferToBase64(chunk);
            resolve(baseEncoded);
        });
    });
}

/**
 * Query google speech to text api for speech recognition
 * @param baseEncoded baseEncoded string
 * @returns {Promise<any>} resovlve: recognized text ,reject: err
 */
exports.queryRecognition = function queryRecognition(baseEncoded) {
    return new Promise((resolve, reject)=>{
        const audio = {
            content: baseEncoded,
        };
        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: sampleRate,
            languageCode: 'en-US',
            model: 'command_and_search'
        };
        const request = {
            audio: audio,
            config: config,
        };

// Detects speech in the audio file
        speechClient
            .recognize(request)
            .then(data => {
                console.log("data " + JSON.stringify(data));
                const response = data[0];
                const transcription = response.results
                    .map(result => result.alternatives[0].transcript)
                    .join('\n');
                console.log(`Transcription: ${transcription}`);
                resolve(transcription);
            })
            .catch(err => {
                reject(err);
            });
    });
}