const noble = require('noble');
const fileSystem = require('fs')
const EventEmitter = require('events');
const player = require('play-sound')(opts = {player: 'omxplayer'})
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { thingShadows, update } = require('./iot')
const thingName = 'heart_rate_monitor'

var clientTokenUpdate
var heartRate = 65
var workoutStatus = 'off'
var motivationCount = 0

function setWorkoutStatus(status, callback) {
    status === "on" ? console.log('Starting workout') : console.log('Stopping workout')
    workoutStatus = status
    callback()
}

function playLoop(playSound, timeout) {
    playSound()
    io.emit('heartRate',  heartRate)
	setTimeout(() => { playLoop(playSound, (60/heartRate)*1000) }, timeout)
}

function motivate(percentAchieved) {
    // console.log(percentAchieved, motivationCount)
    if(motivationCount % 10 === 0){
    if(percentAchieved > 2){
        console.log('Uhh you are you still alive?')
        process.env.ENV === 'pi'  && player.play('1')
    }else if(percentAchieved > 1.5){
        console.log(`Slow it down! You're 50% passed target`)
        process.env.ENV === 'pi'  && player.play('2')
    }else if(percentAchieved > 1.25){
        console.log(`You're doing great, but slow it down a bit`)
        process.env.ENV === 'pi'  && player.play('3')
    }else if(percentAchieved > 1.10){
        console.log(`You're about 10% over target`)
        process.env.ENV === 'pi'  && player.play('4')
    }else if(percentAchieved > .97){
        console.log(`Awesome! Keep it here`)
        process.env.ENV === 'pi'  && player.play('5')
    }else if(percentAchieved > .9){
        console.log(`You're almost there, a tiny bit more to go`)
        process.env.ENV === 'pi'  && player.play('6')
    }else if(percentAchieved > .85){
        console.log(`About 15% more to go! Keep it up!`)
        process.env.ENV === 'pi'  && player.play('7')
    }else if(percentAchieved > .75){
        console.log(`Hello? Are you there? Pick up the pace!`)
        process.env.ENV === 'pi'  && player.play('8')
    }else {
        console.log(`You're gonna have to give it a bit more!`)
        process.env.ENV === 'pi'  && player.play('9')
    }
    }
    motivationCount++
}

function heartBeat() {
	process.env.ENV === 'pi' ? player.play('beat.mp3') : ''
}

playLoop(heartBeat, 1000)

thingShadows.on('connect', function () {
    console.log('connected to IoT service')
    
    thingShadows.register(thingName, {}, function () {
        if (clientTokenUpdate === null) {
            console.log('update shadow failed, operation still in progress');
        }
        update(thingName, 'heartRate', { "state" :  { "desired" : { "workout" : "off" } } })
        .then((res) => { console.log(`updated workout: ${res}`) })
        .catch((err) => { console.log(`err: ${err}`) })
    });
    
});
thingShadows.subscribe('heartRate')


thingShadows.on('delta', function (thingName, stateObject) {
   const percentAchieved = heartRate / stateObject.state.heartRate
   stateObject.state.workout && setWorkoutStatus(stateObject.state.workout, () => { update(thingName, 'heartRate', { "state" :  { "reported" : { "workout" : stateObject.state.workout } } })} )
   workoutStatus === "on" && motivate(percentAchieved)
 })


thingShadows.on('message', function(topic, payload) {
    payloadObj =  JSON.parse(payload.toString())
    payloadObj.state.reported && payloadObj.state.reported.heartRate ? heartRate = payloadObj.state.reported.heartRate : ''
   
  	//startInterval((heartRate/60)*1000)
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

// set workout to off, initially


