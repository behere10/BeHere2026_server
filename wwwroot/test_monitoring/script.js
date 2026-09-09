function parseBool(val) {
    if (val === null || val === undefined) {
        return false;
    }

    const str = String(val).toLowerCase().trim();
    switch (str) {
        case 'true': case '1': case 'yes': case 'on':
            return true;
        case 'false': case '0': case 'no': case 'off':
            return false;
        default:
            throw new Error(`Cannot parse "${val}" as boolean`);
    }
}


document.addEventListener('DOMContentLoaded', () =>
{
    const statusDiv = document.getElementById('status');
    const messagesDiv = document.getElementById('messages');

    const sendImageButton = document.getElementById('sendImageButton');

    const sendStatusButton = document.getElementById('sendStatusButton');

    const sendCommandFix = document.getElementById('sendCommandFix');
    const sendCommandRelease = document.getElementById('sendCommandRelease');

    const hostname = window.location.hostname;
    const hostPort = 3000;

    const websocketUrl = 'ws://' + hostname + ':' + hostPort + '/ws/';


    let ws = null;

    function connectWebSocket() {
        statusDiv.textContent = 'STATUS: CONNECTING...';
        ws = new WebSocket(websocketUrl);


        ws.onopen = (event) => {
            statusDiv.textContent = 'STATUS: CONNECTED';
            addMessage('STATUS', 'CONNECTED');

            const initialMessage = {
                type: "hello",
                role: "monitoring"
            };

            ws.send(JSON.stringify(initialMessage));
        };


        ws.onmessage = (event) => {
            addMessage('RECV', event.data);
        };


        ws.onclose = (event) => {
            statusDiv.textContent = 'STATUS: CONNECTION CLOSED, RETRYING CONNECTION...';
            addMessage('STATUS', 'CONNECTION CLOSED');

            setTimeout(connectWebSocket, 5000);
        };


        ws.onerror = (event) => {
            statusDiv.textContent = 'STATUS: ERROR';
            addMessage('STATUS', 'ERROR');
            console.error('WebSocket Error:', event);
            ws.close();
        };
    }


    function addMessage(sender, message) {
        const p = document.createElement('p');
        p.textContent = `${sender}: ${message}`;

        messagesDiv.appendChild(p);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }


    sendImageButton.addEventListener('click', () => {
        const imageData = {
            type: 'image',
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
        };

        ws.send(JSON.stringify(imageData));
        addMessage('SEND', JSON.stringify(imageData, null, 1));
    });


    sendStatusButton.addEventListener('click', () => {
        const statusData = {
            type: 'status'
        };


        statusData.deviceName = document.getElementById('deviceName').value;


        const radioThermalStatus = document.getElementsByName('thermalStatus');
        for (let i = 0; i < radioThermalStatus.length; i++) {
            if (radioThermalStatus[i].checked) {
                statusData.thermalStatus = radioThermalStatus[i].value;
                break;
            }
        }


        const radioInternalBatteryStatus = document.getElementsByName('internalBatteryStatus');
        for (let i = 0; i < radioInternalBatteryStatus.length; i++) {
            if (radioInternalBatteryStatus[i].checked) {
                statusData.internalBatteryStatus = radioInternalBatteryStatus[i].value;
                break;
            }
        }

        statusData.internalBatteryLevel = parseInt(document.getElementById('internalBatteryLevel').value);


        const radioExternalBatteryStatus = document.getElementsByName('externalBatteryStatus');
        for (let i = 0; i < radioExternalBatteryStatus.length; i++) {
            if (radioExternalBatteryStatus[i].checked) {
                statusData.externalBatteryStatus = radioExternalBatteryStatus[i].value;
                break;
            }
        }

        statusData.chargeVoltage = parseFloat(document.getElementById('chargeVoltage').value);
        statusData.chargeCurrent = parseFloat(document.getElementById('chargeCurrent').value);


        const radioMode = document.getElementsByName('mode');
        for (let i = 0; i < radioMode.length; i++) {
            if (radioMode[i].checked) {
                statusData.mode = radioMode[i].value;
                break;
            }
        }

        statusData.arModeTime = parseInt(document.getElementById('arModeTime').value);


        const radioMIDIBoard = document.getElementsByName('midiBoard');
        for (let i = 0; i < radioMIDIBoard.length; i++) {
            if (radioMIDIBoard[i].checked) {
                statusData.midiBoard = parseBool(radioMIDIBoard[i].value);
                break;
            }
        }


        const radioLCD = document.getElementsByName('lcd');
        for (let i = 0; i < radioLCD.length; i++) {
            if (radioLCD[i].checked) {
                statusData.lcd = parseBool(radioLCD[i].value);
                break;
            }
        }


        statusData.picoTemp = parseFloat(document.getElementById('picoTemp').value);


        ws.send(JSON.stringify(statusData));
        addMessage('SEND', JSON.stringify(statusData, null, 1));
    });


    sendCommandFix.addEventListener('click', () => {
        const statusData = {
            type: 'command',
            command: 'fix'
        };


        statusData.deviceName = document.getElementById('deviceNameCommand').value;

        ws.send(JSON.stringify(statusData));
        addMessage('SEND', JSON.stringify(statusData, null, 1));
    });

    sendCommandRelease.addEventListener('click', () => {
        const statusData = {
            type: 'command',
            command: 'release'
        };


        statusData.deviceName = document.getElementById('deviceNameCommand').value;

        ws.send(JSON.stringify(statusData));
        addMessage('SEND', JSON.stringify(statusData, null, 1));
    });


    connectWebSocket();
});
