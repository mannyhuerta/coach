var noble = require('noble');
const fileSystem = require('fs')
const EventEmitter = require('events');
const player = require('play-sound')(opts = {player: 'omxplayer'})
const { thingShadows, update } = require('./iot')
const thingName = 'heart_rate_monitor'

var clientTokenUpdate


var heartRate = 65

function playLoop(playSound, timeout) {
	playSound()
	console.log(timeout)
	setTimeout(() => { playLoop(playSound, (60/heartRate)*1000) }, timeout)
}


function heartBeat() {
	player.play('beat.mp3')	
}

playLoop(heartBeat, 1000)

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
  	//startInterval((heartRate/60)*1000)
});
