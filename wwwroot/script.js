let ws = null;


function newStatus(status)
{
    let $newStatus = $(`
<div id="${status.deviceName}" class="status">
    <div class="title"
        ><span class="deviceName">${status.deviceName}</span
        ><span class="deviceMode"></span
        ><span class="summary"></span
        ><span class="detailButton"><img class="down" src="chevron-double-down.svg"><img class="up" src="chevron-double-up.svg"></span
    ></div>
    <div class="details">
        <p>
            Mode: <span class="mode"></span>,
            Thermal Status: <span class="thermal"></span>,
            iPhone Battery: <span class="batteryStatus"></span> (<span class="batteryLevel"></span> %),
            MIDI Board: <span class="midiBoard"></span>
        </p>
        <p>
            Power Bank Status: <span class="pbStatus"></span><span class="pbCharging"> (<span class="chargeVoltage"></span>V / <span class="chargeCurrent"></span>A)</span>
        </p>
        <p>
            AR Tracking State: <span class="arTrackingState"></span>,
            Elapsed time in AR mode: <span class="arModeTime"></span> sec,
            Staying time in AR mode: <span class="arStayTime"></span> sec
        </p>
        <p>
            LCD Power: <span class="lcdPower"></span>,
            Pi PICO Temperature: <span class="picoTempC"></span>℃ / <span class="picoTempF"></span>℉
        </p>
        <p>
            AR space is fixed: <span class="arIsFixed"></span>&nbsp;
            <button class="arSpaceFix">FIX</button><button class="arSpaceRelease">RELEASE</button>
        </p>
    </div>
    <div class="warnings">
    </div>
</div>
`);

    $newStatus.data('lastUpdate', Math.floor(Date.now() / 1000));

    $('#statusView').append($newStatus);


    let $downBtn = $newStatus.find('.detailButton .down');
    let $upBtn = $newStatus.find('.detailButton .up');
    let $details = $newStatus.find('.details');
    let $arSpaceFix = $newStatus.find('.arSpaceFix');
    let $arSpaceRelease = $newStatus.find('.arSpaceRelease');
    let $warnings = $newStatus.find('.warnings');

    $downBtn.show();
    $upBtn.hide();
    $details.hide();
    $warnings.hide();

    $downBtn.on('click', function () {
        $downBtn.hide();
        $upBtn.show();
        $details.show();
    });

    $upBtn.on('click', function () {
        $downBtn.show();
        $upBtn.hide();
        $details.hide();
    });

    $arSpaceFix.on('click', function () {
        console.log("FIX", status.deviceName);

        const statusData = {
            type: 'command',
            command: 'fix',
            deviceName: status.deviceName
        };

        ws.send(JSON.stringify(statusData));
    });

    $arSpaceRelease.on('click', function () {
        console.log("RELEASE", status.deviceName);

        const statusData = {
            type: 'command',
            command: 'release',
            deviceName: status.deviceName
        };

        ws.send(JSON.stringify(statusData));
    });

    let $items = $('#statusView').children().get().sort(function(a, b) {
        var idA = $(a).attr('id');
        var idB = $(b).attr('id');

        if (idA > idB) return 1;
        if (idA < idB) return -1;
        return 0;
    });

    $('#statusView').append($items);
}


function updateStatus(status)
{
    console.log(status);


    const timeLimitARMode = 72000000;


    let $root = $(`#${status.deviceName}`);
    if ($root.length === 0) {
        return;
    }

    $root.data('lastUpdate', Math.floor(Date.now() / 1000));

    let $deviceMode = $root.find('.deviceMode');
    let $summary = $root.find('.summary');
    let $warnings = $root.find('.warnings');

    let $mode = $root.find('.mode');
    let $thermal = $root.find('.thermal');
    let $batteryStatus = $root.find('.batteryStatus');
    let $batteryLevel = $root.find('.batteryLevel');
    let $midiBoard = $root.find('.midiBoard');

    let $pbStatus = $root.find('.pbStatus');
    let $pbCharging = $root.find('.pbCharging');
    let $chargeVoltage = $root.find('.chargeVoltage');
    let $chargeCurrent = $root.find('.chargeCurrent');
    let $arTrackingState = $root.find('.arTrackingState');
    let $arModeTime = $root.find('.arModeTime');
    let $arStayTime = $root.find('.arStayTime');

    let $lcdPower = $root.find('.lcdPower');
    let $picoTempC = $root.find('.picoTempC');
    let $picoTempF = $root.find('.picoTempF');

    let $arIsFixed = $root.find('.arIsFixed');
    let $arSpaceFix = $root.find('.arSpaceFix');
    let $arSpaceRelease = $root.find('.arSpaceRelease');


    $deviceMode.empty();
    $summary.empty();

    $mode.empty();
    $thermal.empty();
    $batteryStatus.empty();
    $batteryLevel.empty();
    $midiBoard.empty();

    $pbStatus.empty();
    $chargeVoltage.empty();
    $chargeCurrent.empty();
    $arTrackingState.empty();
    $arModeTime.empty();
    $arStayTime.empty();
    $arIsFixed.empty();

    $lcdPower.empty();
    $picoTempC.empty();
    $picoTempF.empty();


    /*
    {
        "arIsFixed":false,
        "arModeTime":0,
        "arStayTime":0,
        "arTrackingState":"not available",
        "chargeCurrent":0.024590538814663887,
        "chargeVoltage":0,
        "deviceName":"Camera03",
        "internalBatteryLevel":1,
        "internalBatteryStatus":"full",
        "isAR":false,
        "lcd":false,
        "midiBoard":true,
        "picoTemp":40.246295928955078,
        "thermalStatus":"nominal",
        "type":"status"
    }
    */


    if (status.midiBoard) {
        if (status.isAR) {
            $mode.append('<span class="green">AR</span>');
        }
        else {
            $mode.append('<span class="cyan">POWER-SAVING</span>');
        }
    }
    else {
        $mode.append('<span class="green">AR-DISPLAYOUT</span>');
    }


    if (status.thermalStatus === 'nominal') {
        $thermal.append('<span class="green">Nominal</span>');
    }
    else if (status.thermalStatus === 'fair') {
        $thermal.append('<span class="green">Fair</span>');
    }
    else if (status.thermalStatus === 'serious') {
        $thermal.append('<span class="magenta">Serious</span>');
    }
    else if (status.thermalStatus === 'critical') {
        $thermal.append('<span class="red">Critical</span>');
    }


    if (status.internalBatteryStatus === 'unplugged') {
        $batteryStatus.append('<span class="red">Unplugged</span>');
    }
    else if (status.internalBatteryStatus === 'charging') {
        $batteryStatus.append('<span class="magenta">Charging</span>');
    }
    else if (status.internalBatteryStatus === 'full') {
        $batteryStatus.append('<span class="green">Full</span>');
    }

    status.internalBatteryLevel = parseInt(status.internalBatteryLevel * 100);
    if (status.internalBatteryLevel === 100) {
        $batteryLevel.append(`<span class="green">${status.internalBatteryLevel}</span>`);
    }
    else {
        $batteryLevel.append(`<span class="magenta">${status.internalBatteryLevel}</span>`);
    }


    if (status.midiBoard) {
        $midiBoard.append('<span class="green">Yes</span>');
    }
    else {
        $midiBoard.append('<span class="magenta">None</span>');
    }

    if (status.midiBoard) {
        if (status.internalBatteryStatus === 'unplugged') {
            $pbStatus.append('<span class="red">Empty</span>');
            $pbCharging.hide();
        }
        else if(4.0 < status.chargeVoltage && status.chargeVoltage < 9000.0) {
            if (0.1 < status.chargeCurrent && status.chargeCurrent < 9000.0) {
                $pbStatus.append('<span class="red">Charging</span>');
                $pbCharging.show();
            }
            else {
                $pbStatus.append('<span class="green">Full</span>');
                $pbCharging.show();
            }
        }
        else {
            $pbStatus.append('<span class="cyan">Discharging</span>');
            $pbCharging.hide();
        }
    }
    else {
        $pbStatus.append('---');
        $pbCharging.hide();
    }

    const voltage = status.chargeVoltage.toFixed(1);
    $chargeVoltage.append(`${voltage}`);

    const current = status.chargeCurrent.toFixed(1);
    $chargeCurrent.append(`${current}`);


    if (status.isAR) {
        if (status.arTrackingState === "not available") {
            $arTrackingState.append(`<span class="red">${status.arTrackingState}</span>`);
        }
        else {
            $arTrackingState.append(`<span class="green">${status.arTrackingState}</span>`);
        }
    }
    else {
        $arTrackingState.append(`---`);
    }


    if (status.arModeTime < timeLimitARMode) {
        $arModeTime.append(`<span class="green">${status.arModeTime}</span>`);
    }
    else {
        $arModeTime.append(`<span class="magenta">${status.arModeTime}</span>`);
    }


    if (status.midiBoard && status.isAR) {
        $arStayTime.append(`${status.arStayTime}`);
    }
    else {
        $arStayTime.append('---');
    }


    if (!status.midiBoard && status.isAR) {
        if (status.arIsFixed) {
            $arIsFixed.append('<span class="green">YES</span>');
            $arSpaceFix.hide();
            $arSpaceRelease.show();
        }
        else {
            $arIsFixed.append('NO');
            $arSpaceFix.show();
            $arSpaceRelease.hide();
        }
    }
    else {
        $arIsFixed.append('---');
        $arSpaceFix.hide();
        $arSpaceRelease.hide();
    }


    if (status.midiBoard) {
        if (status.lcd) {
            $lcdPower.append(`<span class="green">ON</span>`);
        }
        else {
            $lcdPower.append(`<span class="cyan">OFF</span>`);
        }
    }
    else {
        $lcdPower.append(`---`);
    }


    if (status.midiBoard) {
        const picoTempC = status.picoTemp.toFixed(1);
        $picoTempC.append(`${picoTempC}`);

        const picoTempF = (status.picoTemp * 9.0 / 5.0 + 32.0).toFixed(1);
        $picoTempF.append(`${picoTempF}`);
    }
    else {
        $picoTempC.append(`---`);
        $picoTempF.append(`---`);
    }


    if (status.midiBoard) {
        if (status.isAR) {
            $deviceMode.html('<span class="green">AR</span>');
        } else {
            $deviceMode.html('<span class="cyan">POWER-SAVING</span>');
        }
    }
    else {
        $deviceMode.html('<span class="green">AR-DISPLAYOUT</span>');
    }


    let summary = 'Thermal: ';

    if (status.thermalStatus === 'nominal') {
        summary += '<span class="green">Nominal</span>, ';
    }
    else if (status.thermalStatus === 'fair') {
        summary += '<span class="green">Fair</span>, ';
    }
    else if (status.thermalStatus === 'serious') {
        summary += '<span class="magenta">Serious</span>, ';
    }
    else if (status.thermalStatus === 'critical') {
        summary += '<span class="red">Critical</span>, ';
    }

    if (status.isAR) {
        summary += 'Elapsed Time: ';

        const min = (status.arModeTime / 60).toFixed();
        if (status.arModeTime < timeLimitARMode) {
            summary += `<span class="green">${min}</span> min`;
        }
        else {
            summary += `<span class="magenta">${min}</span> min`;
        }
    } else {
        summary += 'Power Bank: ';

        if (status.internalBatteryStatus === 'unplugged') {
            summary += '<span class="red">Empty</span>';
        }
        else if(4.0 < status.chargeVoltage && status.chargeVoltage < 9000.0) {
            if (0.1 < status.chargeCurrent && status.chargeCurrent < 9000.0) {
                summary += '<span class="red">Charging</span>';
                summary += ` [${voltage}V / ${current}A]`;
            }
            else {
                summary += '<span class="green">Full</span>';
            }
        }
        else {
            summary += '<span class="cyan">Discharging</span>';
        }
    }

    $summary.html(summary);


    let warnings = '';

    if (status.thermalStatus === 'critical') {
        warnings += '<p class="bold red">Switched to POWER-SAVING mode due to critical overheating.</p>';
    }

    if (status.midiBoard) {
        if (status.arModeTime >= timeLimitARMode && status.externalBatteryStatus === 'discharging') {
            warnings += '<p class="bold red">Charging is recommended.</p>'
        }

        if (status.internalBatteryStatus === 'unplugged') {
            warnings += '<p class="bold red">Power bank is empty; please charge it.</p>';
        }
    }

    if (status.isAR && !status.arIsFixed) {
        if (status.arTrackingState !== "normal") {
            warnings += '<p class="bold red">AR tracking is not available.</p>';
        }
    }

    if (status.midiBoard && status.isAR) {
        if (status.arStayTime >= 1800) {
            warnings += '<p class="bold red">Move camera.</p>';
        }
    }

    if (warnings === '') {
        $warnings.hide();
    }
    else {
        $warnings.html(warnings);
        $warnings.show();
    }
}


document.addEventListener('DOMContentLoaded', () =>
{
    const hostname = window.location.hostname;
    const hostPort = 3000;

    const websocketUrl = 'ws://' + hostname + ':' + hostPort + '/ws/';


    const $messagesDiv = $('#messages');

    function addMessage(message) {
        let $messages = $messagesDiv.children();
        const removeCount = $messages.length - 100;

        if (removeCount > 0) {
            $messages.slice(0, removeCount).remove();
        }


        const $p = $('<p/>');
        $p.text(message);

        $messagesDiv.append($p);

        var scrollHeight = $messagesDiv[0] ? $messagesDiv[0].scrollHeight : 0;
        $messagesDiv.scrollTop(scrollHeight);
    }



    function connectWebSocket() {
        addMessage('CONNECTING to the server...');
        ws = new WebSocket(websocketUrl);


        ws.onopen = (event) => {
            addMessage('CONNECTION ESTABLISHED to the server');

            const initialMessage = {
                type: "hello",
                role: "status_monitoring"
            };

            ws.send(JSON.stringify(initialMessage));

            $('#systemMessage').hide();
        };


        ws.onmessage = (event) => {
            let msg = null;
            try {
                msg = JSON.parse(event.data);
            }
            catch (error) {
                console.error("BAD MESSAGE:", error.message);
                return;
            }

            if (!msg.type) {
                console.error("BAD MESSAGE: no type", event.data);
                return;
            }

            if (msg.type !== 'status') {
                console.error("BAD MESSAGE TYPE:", msg.type);
                return;
            }


            let statusElement = $(`#${msg.deviceName}`);
            if (statusElement.length === 0) {
                addMessage(`NEW CONNECTION: ${msg.deviceName}`);
                newStatus(msg);
            }

            updateStatus(msg);
        };


        ws.onclose = (event) => {
            addMessage('CONNECTION LOST to the server, RETRYING CONNECTION in 5 seconds...');
            setTimeout(connectWebSocket, 5000);

            $('#systemMessage').show();
        };


        ws.onerror = (event) => {
            addMessage('CONNECTION ERROR with the server, CONNECTION CLOSED');
            ws.close();

            $('#systemMessage').show();
        };
    }


    function connectionTimeoutCheck() {
        const timeout = 60; // sec

        const now = Math.floor(Date.now() / 1000);

        $("#statusView").children().filter(function() {
            if ((now - $(this).data("lastUpdate")) >= timeout) {
                const id = $(this).attr('id');
                addMessage(`DISCONNECT: ${id}`);

                return true;
            }

            return false;
        }).remove();

        setTimeout(connectionTimeoutCheck, 10000);
    }


    connectWebSocket();

    connectionTimeoutCheck();
});
