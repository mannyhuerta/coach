var noble = require('noble');
const EventEmitter = require('events');
const playsound = require('play-sound')
const { thingShadows, update } = require('./iot')
const thingName = 'heart_rate_monitor'

var clientTokenUpdate

thingShadows.on('connect', function () {
    console.log('connected to IoT service')
    thingShadows.register(thingName, {}, function () {

        if (clientTokenUpdate === null) {
            console.log('update shadow failed, operation still in progress');
        }
    });
});



const myEmitter = new EventEmitter();
// Only do this once so we don't loop forever
myEmitter.once('newListener', (event, listener) => {
});
myEmitter.on('event', (heartRate) => {
	update(thingName, 'heartRate', { "state" :  { "reported" : { "heartRate" : heartRate } } })
	.then((res) => { console.log(`updated thing shadow with heart rate: ${heartRate}`) })
	.catch((err) => { console.log(`err: ${err}`) })
});

if(process.env.NODE_ENV === 'development'){
noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});


noble.on('discover', function(peripheral) {
console.log(peripheral.uuid);
  if(peripheral.uuid.toString()=="d1edf72e5d69"){
	console.log("H7 found...");
  	peripheral.connect(function(error) {
		if(error){
			console.log(error)
		}else {
			console.log('connected to peripheral: ' + peripheral.uuid);
			var serviceUUIDs = ["180d"];
			var characteristicUUIDs = ["2a37"];
			peripheral.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, function(error, services, characteristics){
				if(error){
					console.log(error)
				}else{
					console.log(services, characteristics)
					characteristics[0].notify(true, function(error){
						console.log("error notify: "+error);
						characteristics[0].on('data', function(data, isNotification){
							// console.log("Heartrate: ",data[1],"bpm");
							myEmitter.emit('event', data[1])
						});
					});

					characteristics[0].read( function(error, data){
						console.log("data: "+data);
					});
				}
			});
		}
		
	});
  }
  else {
	console.log("Andere...");
  }
});
}else{
	setInterval(() => {	myEmitter.emit('event', Math.floor(Math.random() * 120) + 60) }, 1000)

}
