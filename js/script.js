
var device;
var intervalId;

const humidityServiceUuid = '00001234-b38d-4985-720e-0f993a68ee41';
const humidityCharacteristicsUuid = '00001235-b38d-4985-720e-0f993a68ee41';
const temperatureServiceUuid = '00002234-b38d-4985-720e-0f993a68ee41';
const temperatureCharacteristicsUuid = '00002235-b38d-4985-720e-0f993a68ee41';

async function connect() {
    const options = { acceptAllDevices: true, optionalServices: ['battery_service', humidityServiceUuid, temperatureServiceUuid] }
    try {
        const device_req = await navigator.bluetooth.requestDevice(options)
        device = await device_req.gatt.connect();
        if (device.connected) {
            document.getElementById('connect-btn').style.display = 'none';
            document.getElementById('disconnect-btn').style.display = 'inline-block';
            showNotification('Successfully connected!', true);
            intervalId = window.setInterval(getData, 5000);
        } else {
            showNotification('Error while connecting!', false);
        }
    } catch (err) {
        console.error(err.message)
        showNotification(err.message, false);
    }
}

async function disconnect() {
    await device.disconnect();
    clearInterval(intervalId);
    showNotification('Successfully disconnected!', true);
    document.getElementById('connect-btn').style.display = 'inline-block';
    document.getElementById('disconnect-btn').style.display = 'none';
}


async function getData() {
    const humidityService = await device.getPrimaryService(humidityServiceUuid);
    const humidityCharacteristic = await humidityService.getCharacteristic(humidityCharacteristicsUuid);
    const humidity = await humidityCharacteristic.readValue();

    const temperatureService = await device.getPrimaryService(temperatureServiceUuid);
    const temperatureCharacteristics = await temperatureService.getCharacteristic(temperatureCharacteristicsUuid);
    const temperature = await temperatureCharacteristics.readValue();

    const batteryService = await device.getPrimaryService('battery_service');
    const batteryCharacteristic = await batteryService.getCharacteristic('battery_level');
    const battery = await batteryCharacteristic.readValue();
    document.getElementById('temperature').innerText = temperature.getFloat32(0, true).toPrecision(5);
    document.getElementById('humidity').innerText = humidity.getFloat32(0, true).toPrecision(5);
    document.getElementById('battery').innerText = battery.getUint8(0);
}

function showNotification(msg, success) {
    document.getElementById('toast-container').innerHTML = `
        <div class="toast__cell">
        <div class="toast toast--success--${success}">
        <div class="toast__content">
          <p class="toast__message">${msg}</p>
        </div>
        <div class="toast__close" onClick="closeNotification()">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.642 15.642"
            xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 15.642 15.642">
            <path fill-rule="evenodd"
              d="M8.882,7.821l6.541-6.541c0.293-0.293,0.293-0.768,0-1.061  c-0.293-0.293-0.768-0.293-1.061,0L7.821,6.76L1.28,0.22c-0.293-0.293-0.768-0.293-1.061,0c-0.293,0.293-0.293,0.768,0,1.061  l6.541,6.541L0.22,14.362c-0.293,0.293-0.293,0.768,0,1.061c0.147,0.146,0.338,0.22,0.53,0.22s0.384-0.073,0.53-0.22l6.541-6.541  l6.541,6.541c0.147,0.146,0.338,0.22,0.53,0.22c0.192,0,0.384-0.073,0.53-0.22c0.293-0.293,0.293-0.768,0-1.061L8.882,7.821z">
            </path>
          </svg>
        </div>
      </div>
    </div>
      `;
    setTimeout(closeNotification, 2000);
}

function closeNotification() {
    document.getElementById('toast-container').innerHTML = '';
}