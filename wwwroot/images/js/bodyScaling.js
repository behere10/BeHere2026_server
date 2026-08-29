var BodyScaling = function ()
{
    var $BODY = $('#BODY');
    var width = $BODY.width();
    var height = $BODY.height();

    var prevScale = -1.0;
    var timer = false;



    function scaling () {
        var bodyWidth = $(window).width();
        var bodyHeight = $(window).height();
        var wScale = bodyWidth / width;
        var hScale = bodyHeight / height;

        var scale = (wScale < hScale ? wScale : hScale);
        if (0.95 <= scale && scale <= 1.05) {
            scale = 1.0;
        }

        //if (scale == prevScale) {
        //    return;
        //}

        debug.log("(" + width + ", " + height + ") -- " + scale + " --> (" + (width * scale) + ", " + (height * scale) + ") / (" + bodyWidth + ", " + bodyHeight + ")");

        $BODY.css('transform', 'scale(' + scale + ',' + scale + ')');

        prevScale = scale;
    }



    scaling();

    //setInterval(scaling, 60000);



    $(window).resize(function () {
        if (timer !== false) {
            clearTimeout(timer);
        }

        timer = setTimeout(scaling, 100);
    });



    return {}
}
