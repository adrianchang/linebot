# Multi Input Line Chatbot

![lineQRCode](/Users/adrian/Downloads/lineQRCode.png)

### 1.What is it?

​	This is a chatbot build for Line. And it can reply to both text and audio message. It support Chinese and English text replying and English voice note replying. 

​	PS.  If you are interested in how this chat bot works, here is a demo video https://drive.google.com/file/d/1tz4Ad6Fgej9h2ZdS-P2QZUeB5uuQo8Qx/view?usp=sharing. Please feel free to take a look.

### 2.How did I build it?

​	First I use line message api's webhook to get the message. Then if the message is a text message, the bot will use Dialog flow to generate English replies and use my own defined function to generate Chinese replies. If the message is an audio message, the bot will convert the audio into .wav format and then pass it to the Google Speech to Text API. After that, the bot will use Dialogflow to generate a text reply and pass it to Google Text to Speech API. After getting the speech replies, the bot will store it in Mongodb, gave it a unique ID and send the URL with the unique ID back to line server. When the user click on the voice note, a Get request will be sent to the bot(heroku server). The bot will extract the data from Mongodb and write it into an mp3 file. After that, the bot will use ffmeg(A CLI tool) to convert the mp3 file into m4a file and finally send the audio back to the user.

