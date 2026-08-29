var MainLoop = function (frameID)
{
    const showInterval = 10000;

    const $frame = $(frameID);

    const frameHeight = $frame.height();

    const freqImageCount = 5;
    const freqShowCountMAX = 3;



    let imageList = [];
    let nextImage = 0;

    let timerID = null;
    let showImageStart = 0;

    let freqShowCount = 0;

    let $currentImage = undefined;
    let $nextImage = undefined;

    function reset()
    {
        if (timerID) {
            clearInterval(timerID);
            timerID = null;
        }

        if ($currentImage) {
            $currentImage.stop();
        }

        nextImage = 0;
        showImageStart = 0;

        freqShowCount = 0;

        $frame.empty();

        $currentImage = undefined;
        $nextImage = undefined;
    }



    function slideImageComplete()
    {
        nextImage++;

        if (nextImage >= imageList.length) {
            nextImage = 0;
        }

        if (nextImage >= freqImageCount) {
            if ((freqShowCount + 1) < freqShowCountMAX) {
                freqShowCount++;
                nextImage = 0;
            }
        }

        let t = Date.now() - showImageStart;
        t = showInterval - t;
        t = (t < 0 ? 0 : (t > showInterval ? showInterval : t));

        timerID = setTimeout(showImage, t);
    }



    function slideInImage()
    {
        const animteTime = 1000;

        if ($currentImage) {
            $currentImage.remove();
        }

        $currentImage = $nextImage;
        $nextImage = undefined;

        if (!$currentImage) {
            //showImageStart += animteTime;
            slideImageComplete();
            return;
        }

        $currentImage.animate({
            top: (frameHeight - $currentImage.height()) / 2.0
        }, animteTime, "easeOutCubic", slideImageComplete);
    }



    function slideOutImage()
    {
        const animteTime = 1000;

        showImageStart = Date.now();

        if (!$currentImage) {
            //showImageStart += animteTime;
            slideInImage();
            return;
        }

        $currentImage.animate({
            top: -$currentImage.height()
        }, animteTime, "easeInCubic", slideInImage);
    }



    function showImage()
    {
        debug.log("showImage");

        let $targetFrame = undefined;
        let src = '';

        $targetFrame = $frame;
        src = imageList[nextImage];

        let $img = $('<img class="image" />');
        $img.attr('src', src);
        $img.css('top', frameHeight);

        $img.on('load', function() {
            slideOutImage();
        });

        $nextImage = $img;

        $targetFrame.append($img);

        if ($img[0].complete) {
            $img.trigger('load');
        }
    }



    function newImageList(msg)
    {
        reset();


        imageList = [];

        for (let i = msg.yourDisplayNo; i < msg.images.length; i += msg.displayCount) {
            imageList.push(msg.images[i]);
        }

        debug.log("NEW IMAGE LIST:", imageList);


        timerID = setTimeout(showImage, showInterval / msg.displayCount * msg.yourDisplayNo + 1000);
    }



    function newImage(msg)
    {
        reset();


        imageList.unshift(msg.imagePath);

        while (imageList.length > 100) {
            imageList.pop();
        }

        debug.log("NEW IMAGE:", imageList[0]);


        timerID = setTimeout(showImage, 500);
    }



    function start()
    {
        const hostname = window.location.hostname;
        const hostPort = 3000;

        const websocketUrl = 'ws://' + hostname + ':' + hostPort + '/ws/';

        let ws = null;

        function connectWebSocket() {
            debug.log('CONNECTING to the server...');
            ws = new WebSocket(websocketUrl);


            ws.onopen = (event) => {
                console.log('CONNECTION ESTABLISHED to the server');

                const initialMessage = {
                    type: "hello",
                    role: "display"
                };

                ws.send(JSON.stringify(initialMessage));
            };


            ws.onmessage = (event) => {
                let msg = null;
                try {
                    msg = JSON.parse(event.data);
                }
                catch (error) {
                    debug.error("BAD MESSAGE:", error.message);
                    return;
                }

                if (!msg.type) {
                    debug.error("BAD MESSAGE: no type", event.data);
                    return;
                }

                if (msg.type === 'image_list') {
                    newImageList(msg);
                    return;
                }

                if (msg.type === 'new_image') {
                    newImage(msg);
                    return;
                }
            };


            ws.onclose = (event) => {
                debug.log('CONNECTION LOST to the server, RETRYING CONNECTION in 5 seconds...');
                setTimeout(connectWebSocket, 5000);
            };


            ws.onerror = (event) => {
                debug.error('CONNECTION ERROR with the server, CONNECTION CLOSED');
                ws.close();
            };
        }

        connectWebSocket();
    }



    return {
        start: start
    }
}
