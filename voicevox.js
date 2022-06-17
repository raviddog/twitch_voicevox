const tmi = require('tmi.js');
const config = require('./config.json');
const http = require('http');
const hepburn = require('hepburn');
const stream = require('stream');
const Speaker = require('speaker');

const client = new tmi.Client({
    connection: {
        secure: true,
        reconnect: true
    },
    identity: {
        username: config.username,
        password: config.oauth
    },
    channels: ['#raviddog']
});

const reward_id = "51d3e4ce-c08b-4659-80ef-4afea3c68144";
const translate_rewardid = "ceb908c8-2f1c-4a2c-9e63-4e28ada2ca43";

client.on('message', (channel, tags, message, self) => {
    if(self) return;
    if(tags["custom-reward-id"] === reward_id) {
        speakTranslated(message);
    } else if(tags["custom-reward-id"] === translate_rewardid) {
        speakTranslated(message);
    }
});

client.connect();

function speakTranslated(text) {
    var b = JSON.stringify({
        q: text,
        source: "en",
        target: "ja",
        format: "text"
    });
    var res = {
        host: '192.168.1.110',
        path: '/translate',
        port: '5002',
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        }
    }

    var k = false;
    if(hepburn.containsHiragana(text)) k = true;
    if(hepburn.containsKatakana(text)) k = true;
    if(hepburn.containsKana(text)) k = true;
    if(hepburn.containsKanji(text)) k = true;

    if(!k) {
        //  plain english, translate

        var request = http.request(res, (response) => {
            var data = '';
            response.on('data', function(chunk) {
                data += chunk;
            });
            response.on('end', function() {
                try {
                    data = JSON.parse(data);
                    // console.log(data.translatedText);
                    client.say('#raviddog', data.translatedText);
                    speak(data.translatedText);
                } catch (e) {
                    console.log(e);
                    console.log(data);
                }
            });
        });
        request.write(b);
        request.end();

        // text = hepburn.cleanRomaji(text);
        text = hepburn.toKatakana(text);
        // text = hepburn.toHiragana(text);
        // console.log(text);
    } else {
        speak(text);
    }

    
}

function speak(text) {
    

    text_encode = encodeURI(text);
    
    var postparams = {
        host: '127.0.0.1',
        port: '50021',
        path: '/audio_query?speaker=8&text=' + text_encode,
        method: 'POST'
    };
    
    var request = http.request(postparams, function(response) {
        var data = '';
        response.on('data', function(chunk) {
            data += chunk;
        });

        response.on('end', function() {
            const postparams2 = {
                host: '127.0.0.1',
                port: '50021',
                path: '/synthesis?speaker=8',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            var request = http.request(postparams2, function (response) {
                var data = new Uint8Array();
                response.on('data', function(chunk) {
                    data = Buffer.concat([data, Buffer.from(chunk)]);
                });
                
                response.on('end', function() {
                    playAudioFromBuffer(data);
                });
            });
            request.write(data);
            request.end();
        });
    });
    request.end();
}

function playAudioFromBuffer(data) {
    var sp = new Speaker({
        channels: 1,
        bitDepth: 16,
        sampleRate: 24000
    });
    var s = new stream.Readable();
    s.push(data);
    s.push(null);
    s.pipe(sp);
}