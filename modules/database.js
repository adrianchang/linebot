//Mongodb setting
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
//Set up file system and stream
const fs = require('fs');
const { Readable } = require('stream');

//Setup exec for calling shell command
const exec = require("child_process").exec;

//Define error function
const helperFunctions = require(__dirname + "/helperFunction.js");
const printErrorMessage = helperFunctions.printErrorMessage;
let db;

//Get mp3 duration
var mp3Duration = require('mp3-duration');
/**
 * Connect Mongo Driver to MongoDB.
 */
MongoClient.connect('mongodb://adrian:loyu0118@ds153890.mlab.com:53890/adriandb', (err, database) => {
    if (err) {
        console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
        process.exit(1);
    }
    db = database.db('adriandb');
});

/**
 * Use ffmeg convert wav to m4a
 * @param id
 * @returns {Promise<any>} resolve: buffer of audio, reject: err
 */
function ffmegConvertWavtoM4a (id) {
    return new Promise((resolve, reject) => {
        exec(__dirname + "/ffmpeg -y -i /tmp/" + id + ".wav -c:a aac -vn /tmp/" + id + ".m4a", (error, stdout, stderr) => {
            //do whatever here
            if (error){
                reject(error);
            }else {
                console.log(stderr);
                let resp = fs.readFileSync("/tmp/" + id + ".m4a");
                console.log("resolved");
                resolve(resp);
            }
        });
    });
}

/**
 * insert audio to database
 * @param buffer the audio buffer
 * @returns {Promise<any>} resolve: stored unique id, reject: err
 */
exports.insertAudioToDB = function insertAudioToDB ( buffer ) {
    return new Promise((resolve, reject) => {
        let trackName = "lalala";
        mp3Duration(buffer, function (err, duration) {
            if (err) {
                reject(err);
            };
            console.log('Your file is ' + duration + ' seconds long');
            // Covert buffer to Readable Stream
            const readableTrackStream = new Readable();
            readableTrackStream.push(buffer);
            readableTrackStream.push(null);

            let bucket = new mongodb.GridFSBucket(db, {
                bucketName: 'tracks'
            });

            let uploadStream = bucket.openUploadStream(trackName);
            let id = uploadStream.id;
            readableTrackStream.pipe(uploadStream);

            uploadStream.on('error', (err) => {
                console.log(err);
                reject(err);
            });

            uploadStream.on('finish', () => {
                console.log("File uploaded successfully, stored under Mongo ObjectID: " + id );
                resolve({id: id, duration: Math.ceil(duration)*1000});
            });
        });
    });
}

/**
 * Get audio from http request and convert wav to m4a
 * @param req http request
 * @param res http response
 * @returns {*}
 */
exports.getAudioFromDB = function (id) {
    return new Promise((resolve, reject) => {
        try {
            var trackID = new ObjectID(id);
        } catch(err) {
            reject("Invalid trackID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters");
        }

        let bucket = new mongodb.GridFSBucket(db, {
            bucketName: 'tracks'
        });
        let writeStream = fs.createWriteStream("/tmp/" + trackID + ".wav");
        let downloadStream = bucket.openDownloadStream(trackID);
        downloadStream.pipe(writeStream);
        // downloadStream.on('data', (chunk) => {
        //     fs.appendFile("/tmp/" + trackID + ".wav", chunk, (err)=> {
        //         if(err){
        //             throw err;
        //         }
        //     });
        //
        // });

        downloadStream.on('error', () => {
            reject("Download stream err" + error);
        });

        downloadStream.on('end', () => {
            // setTimeout(() => {
                ffmegConvertWavtoM4a(trackID)
                    .then((buffer) => {
                        resolve(buffer);
                    }).catch(printErrorMessage);
            // }, 500);
        });

    });
}