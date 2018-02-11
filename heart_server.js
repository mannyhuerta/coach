
const EventEmitter = require('events');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { thingShadows, update } = require('./iot')
const thingName = 'heart_rate_monitor'

var clientTokenUpdate
var heartRate = 65

function emitHeartRate() {
    io.emit('heartRate',  heartRate)
}

function playLoop(callback, timeout) {
    callback()
	setTimeout(() => { playLoop(emitHeartRate, (60/heartRate)*1000) }, timeout)
}

playLoop(emitHeartRate, 1000)

thingShadows.on('connect', function () {
    console.log('connected to IoT service')
    thingShadows.register(thingName, {}, function () {

        if (clientTokenUpdate === null) {
            console.log('update shadow failed, operation still in progress');
        }
    });
});
thingShadows.subscribe('heartRate')


thingShadows.on('message', function(topic, payload) {
    heartRate = JSON.parse(payload.toString()).state.reported.heartRate
});


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });
  
  io.on('connection', function(socket){
    console.log('a user connected');
    
  });
  
  http.listen(3000, function(){
    console.log('listening on *:3000');
  });

