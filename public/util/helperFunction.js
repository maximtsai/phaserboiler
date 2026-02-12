helperFunction = {};

helperFunction.runFunctionOverIntervals = function runFunctionOverIntervals(func, intervals = [], prevDelay = 0) {
    if (intervals.length > 0) {
        let firstInterval = intervals[0];
        let delayAmt = firstInterval.delay + prevDelay;
        if (firstInterval.duration) {
            prevDelay = firstInterval.duration;
        } else {
            prevDelay = 0;
        }
        setTimeout(() => {
            func(firstInterval);
            intervals.shift();
            helperFunction.runFunctionOverIntervals(func, intervals, prevDelay);
        }, delayAmt);
    }
}

function openFullscreen() {
    var elem = document.body;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

function testMobile() {
  const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(navigator.userAgent);
}


function isSafariIOS() {
    var ua = window.navigator.userAgent;
    var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    var webkit = !!ua.match(/WebKit/i);
    var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
    return iOSSafari;
}

function createGlobalClickBlocker(showPointer) {
    if (!globalObjects.clickBlocker) {
        globalObjects.clickBlocker = new Button({
             normal: {
                 ref: "blackPixel",
                 x: gameConsts.halfWidth,
                 y: gameConsts.halfHeight,
                 alpha: 0.001,
                 scaleX: 1000,
                 scaleY: 1000
             },
             onMouseUp: () => {

             }
         });
    } else {
        globalObjects.clickBlocker.setState(NORMAL);
        globalObjects.clickBlocker.setOnMouseUpFunc(() => {});
        buttonManager.bringButtonToTop(globalObjects.clickBlocker);
    }
    if (showPointer && canvas) {
        canvas.style.cursor = 'pointer';
    }
    return globalObjects.clickBlocker;
}

function hideGlobalClickBlocker() {
    if (!globalObjects.clickBlocker) {
        return;
    }
    globalObjects.clickBlocker.setState(DISABLE);
    if (canvas) {
        canvas.style.cursor = 'default';
    }
}

function typewriterText(textObj, str, delay = 50, sfx) {
    if (str.length <= 0) {
        return;
    }
    if (!textObj || !textObj.active) {
        return;
    }
    textObj.setText(textObj.text + str[0]);
    if (sfx && str[0] !== " " && str[0] !== "•") {
        playSound(sfx);
    }
    let actualDelay = delay;
    if (str[0] === " ") {
        actualDelay = 0;
    }
    setTimeout(() => {
        typewriterText(textObj, str.substring(1, str.length), delay, sfx)
    }, actualDelay)
}

function restartGame() {
    location.reload();
}
