const thingShadow = require('aws-iot-device-sdk').thingShadow;
const isUndefined = require('./node_modules/aws-iot-device-sdk/common/lib/is-undefined');

const host = 'a34hla6atspgwh.iot.us-east-1.amazonaws.com';
const region = 'us-east-1';
const key = 'heart_rate_monitor.private.key';
const cert = 'heart_rate_monitor.cert.pem';
const caCert = 'root-CA.crt';

const operationTimeout = 10000;

const thingShadows = thingShadow({
    keyPath: key,
    certPath: cert,
    caPath: caCert,
    region: region,
    host: host
});

function update(thingName, topic, payload) {
	return new Promise((resolve, reject) => {
	    try {
		//thingShadows.update(thingName, payload)
		console.log(thingName, topic, payload)
		thingShadows.publish(topic, JSON.stringify(payload))
		thingShadows.update(thingName, payload)
		resolve('success')
	    } catch (err) {
		reject(err)
	    }
	})

}
module.exports = {
    thingShadows,
    update
}
