const WebSocket = require('ws');
const fs = require('fs');


const imageManager = require('./imageManager');

imageManager.init();


/**
 * parse Data URI string
 * @param {string} dataUri
 * @returns {{mime: string, data: Buffer} | null}
 */
function parseDataUri(dataUri) {
    const matches = dataUri.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9\-\+\.]+)(;base64)?,(.*)$/);
    if (!matches) {
            console.error('parseDataUri: Invalid Data URI');
            return null;
    }

    const mimeType = matches[1];
    const isBase64 = !!matches[2];
    const encodedData = matches[3];

    if (!isBase64) {
        console.error('parseDataUri: Not Base64 encoded data');
        return null;
    }

    try {
        const buffer = Buffer.from(encodedData, 'base64');
        return { mime: mimeType, data: buffer };
    }
    catch (error) {
        console.error('parseDataUri: ERROR: during Base64 decoding:', error);
        return null;
    }
}


function sendImageList(clients) {
    let monitoring = [];
    let displayCount = 0;

    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            if (client.role === "display") {
                displayCount++;
            }
            else if (client.role === "monitoring") {
                monitoring.push(client);
            }
        }
    });


    let json = {
        type: "image_list",
        images: imageManager.getImageList(),
        displayCount: displayCount,
        yourDisplayNo: 0
    };

    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            if (client.role === "display") {
                const jsonStr = JSON.stringify(json);
                client.send(jsonStr);

                monitoring.forEach((monitor) => {
                    monitor.send(jsonStr);
                });

                json.yourDisplayNo++;
            }
        }
    });
}


let newImageTarget = 0;

function newImage(msg, clients) {
    const result = parseDataUri(msg.image);
    if (!result) {
        console.error("BAD MESSAGE: bad image data");
        return;
    }

    imageManager.saveImageToFile(result.mime, result.data, function complete(imagePath) {
        const newImage = {
            type: "new_image",
            imagePath: imagePath
        };
        const jsonStr = JSON.stringify(newImage);


        let display = [];

        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                if (client.role === "display") {
                    display.push(client);
                }
                else if (client.role === "display" || client.role === "monitoring") {
                    client.send(jsonStr);
                }
            }
        });

        if (display.length === 0) {
            return;
        }

        if (newImageTarget >= display.length) {
            newImageTarget = 0;
        }

        display[newImageTarget].send(jsonStr);

        newImageTarget++;
    });
}


//  receive pong

function recv_pong() {
    this.isAlive = true;
}


//  WebSocket Server

const wss = new WebSocket.Server({
    port: 3000,
    maxPayload: 1024 * 1024 * 100 // 100 MiB
});

wss.on('connection', (ws) =>
{
    console.log('NEW CONNECTION');


    ws.on('message', (message) => {
        console.log(`Message: ${message}`);

        let msg = null;
        try {
            msg = JSON.parse(message);
        }
        catch (error) {
            console.error("BAD MESSAGE:", error.message);
            return;
        }

        if (!msg.type) {
            console.error("BAD MESSAGE: no type", message);
            ws.terminate();
            return;
        }

        if (msg.type === "hello") {
            if (!msg.role) {
                console.error("BAD MESSAGE: no role", message);
                ws.terminate();
            }
            else {
                ws.role = msg.role;
                console.log('NEW CLIENT:', ws.role);

                if (msg.role === 'display') {
                    sendImageList(wss.clients);
                }
            }

            return;
        }

        if (msg.type === "status") {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    if (client.role === "status_monitoring" || client.role === "monitoring") {
                        client.send(`${message}`);
                    }
                }
            });

            return;
        }

        if (msg.type === "image") {
            newImage(msg, wss.clients);
            return;
        }
    });


    ws.on('pong', recv_pong);


    ws.on('close', () => {
        console.log('CLIENT DISCONNECTED');
    });
});


//  send ping

const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) {
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', function close() {
    clearInterval(interval);
});
