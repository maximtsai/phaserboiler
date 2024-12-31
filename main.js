let newcanvas = document.getElementById('newgamecanvas');
const contextCreationConfig = {
    alpha: false,
    depth: false,
    antialias: true,
    premultipliedAlpha: true,
    stencil: true,
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: false,
    powerPreference: 'default'
};
const myCustomContext = newcanvas.getContext('webgl2', contextCreationConfig);

let isMobile = testMobile();
let pixelWidth = isMobile ? 594 : 604
let pixelHeight = isMobile ? 810 : 775
handleBorders();
let gameVersion = "v.1.0";
let config = {
    type: Phaser.WEBGL,
    scale: {
        autoRound: true,
        width: pixelWidth,
        height: isMobile ? 810 : 775,
        orientation: 'landscape',
        mode: Phaser.Scale.FIT,
        forceLandscape: true
    },
    render: {
        // Leave on to prevent pixelated graphics
        antialias: true,
        roundPixels: true,
    },
    transparent: true,
    expandParent: true,
    clearBeforeRender: false,
    canvas: newcanvas,
    context: myCustomContext,

    loader: {
        baseURL: '' // Where we begin looking for files
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    dom: {
        createContainer: true,
    },
};

let game;
let gameCanvas;
function onloadFunc() {
    game = new Phaser.Game(config); // var canvas = game.canvas;
    gameCanvas = game.canvas;
    initWebGLStuff(game.canvas);

}

let gameConsts = {
    width: config.scale.width,
    halfWidth: config.scale.width * 0.5,
    height: config.scale.height,
    halfHeight: config.scale.height * 0.5,
    SDK: null
};

let challenges = {};
let cheats = {};
let funnies = {};
let gameOptions = {};
let gameVars = {
    hideCheatVal: 0,
    latestLevel: 0,
    maxLevel: 0,
    isHardMode: false,
    gameConstructed: false,
    mousedown: false,
    mouseJustDowned: false,
    mouseposx: 0,
    mouseposy: 0,
    lastmousedown: {x: 0, y: 0},
    timeSlowRatio: 1,
    timeScale: 1,
    gameManualSlowSpeed: 1,
    gameManualSlowSpeedInverse: 1,
    gameScale: 1,
    canvasXOffset: 0,
    canvasYOffset: 0
};
let loadObjects = {}; // Objects used in loading screen, removed once game starts
let globalObjects = {}; // globally accessible objects
// let updateFunctions = {};
let PhaserScene = null; // Global
let oldTime = 0;
let deltaScale = 1;
let timeUpdateCounter = 0;
let timeUpdateCounterMax = 3;
let url1 = 'localhost';// 'crazygames';
let url2 = 'maximtsai';// 'localhost';
let url3 = 'ground';// '1001juegos';
let url4 = 'classic.itch';// '1001juegos';

function preload ()
{
    handleBorders();
    gameVars.latestLevel = parseInt(localStorage.getItem("latestLevel"));
    gameVars.maxLevel = parseInt(localStorage.getItem("maxLevel"));
    if (!gameVars.latestLevel) {
        gameVars.latestLevel = 0;
    }
    if (!gameVars.maxLevel) {
        gameVars.maxLevel = gameVars.latestLevel;
    }

    // if (isMobile && screen && screen.orientation && screen.orientation.lock) {
    //     var myScreenOrientation = window.screen.orientation;
    //     myScreenOrientation.lock('portrait')
    // }

    resizeGame();
    let gameDiv = document.getElementById('preload-notice');
    gameDiv.innerHTML = "";
    loadFileList(this, imageFilesPreload, 'image');
    setTimeout(() => {
        resizeGame();
    }, 100)
}

function create ()
{
    if (!document.location.href.includes(url1) && !document.location.href.includes(url2) && !document.location.href.includes(url4)) {
        // Stops execution of rest of game
        let gameDiv = document.getElementById('preload-notice');
        let invalidSite = document.location.href.substring(0, 25);
        gameDiv.innerHTML = invalidSite + "...\nis an invalid site.\n\n\n" + "Try the game on Crazygames.com!";
        return;
    }
    oldTime = Date.now();
    PhaserScene = this;
    onPreloadComplete(this);
}

function onPreloadComplete (scene)
{
    showHTMLBackground();
    globalObjects.tempBG = scene.add.sprite(0, 0, 'whitePixel').setScale(10, 10).setDepth(-1);

    setupMouseInteraction(scene);
    setupLoadingBar(scene);

    loadFileList(scene, audioFiles, 'audio');
    loadFileList(scene, imageAtlases, 'atlas');
    loadFileList(scene, imageFiles, 'image');
    loadFileList(scene, fontFiles, 'bitmap_font');
    loadFileList(scene, videoFiles, 'video');

    scene.load.start();
}

function onLoadComplete(scene) {
    initializeSounds(scene);
    initializeMiscLocalstorage();
    setupGame(scene);
}

document.addEventListener('fullscreenchange', (event) => {
    if (!document.fullscreenElement) {
        gameOptions.fullscreen = false;
    } else {
        gameOptions.fullscreen = true;
    }
    globalObjects.options.fullscreenToggleVisual.setFrame(gameOptions.fullscreen ? 'check_box_on.png' : 'check_box_normal.png');
});

function initializeMiscLocalstorage() {
    language = localStorage.getItem("language") || 'en_us';
    gameOptions.infoBoxAlign = localStorage.getItem("info_align") || 'center';

    let storedSkipIntro = localStorage.getItem("skip_intro");
    if (storedSkipIntro) {
        gameOptions.skipIntro = storedSkipIntro === 'true';
    } else {
        gameOptions.isFirstTime = true;
        localStorage.setItem("skip_intro", 'true');
    }
}

let lastUpdateValues = [1, 1, 1, 1, 1];
let lastUpdateValuesIdx = 0;
let avgDeltaScale = 1;
function update(time, delta) {
    // check mouse
    if (timeUpdateCounter >= timeUpdateCounterMax) {
        timeUpdateCounter = 0;
        let newTime = Date.now();
        let deltaTime = newTime - oldTime;
        oldTime = newTime;
        deltaScale = Math.min(5, deltaTime / 100);
        lastUpdateValues[lastUpdateValuesIdx] = deltaScale;
        lastUpdateValuesIdx = (lastUpdateValuesIdx + 1) % 5;
        avgDeltaScale = 0;
        for (let i = 0; i < 5; i++) {
            avgDeltaScale += lastUpdateValues[i] * 0.2;
        }
    } else {
        timeUpdateCounter++;
    }
    // mywebgl.clearColor(0.08, 0.48, 0.08, 1.0);
    // mywebgl.clear(mywebgl.COLOR_BUFFER_BIT | mywebgl.DEPTH_BUFFER_BIT); // both color and depth are integers with a single bit set to 1, rest 0, so you can | them

    avgDeltaScale *= gameVars.timeScale;
    gameVars.avgDeltaScale = avgDeltaScale;

    buttonManager.update(avgDeltaScale);
    updateManager.update(avgDeltaScale);


    gameVars.mouseJustDowned = false;
    gameVars.mouseJustUpped = false;
    if (!gameVars.wasTouch && !game.input.mousePointer.isDown && gameVars.mousedown) {
        gameVars.mousedown = false;
    }
}

function loadFileList(scene, filesList, type) {
    for (let i in filesList) {
        let data = filesList[i];
        switch (type) {
            case 'audio':
                scene.load.audio(data.name, data.src);
                break;
            case 'image':
                scene.load.image(data.name, data.src);
                break;
            case 'bitmap_font':
                scene.load.bitmapFont(data.name, data.imageUrl, data.url);
                break;
            case 'atlas':
                scene.load.multiatlas(data.name, data.src);
                break;
            case 'video':
                scene.load.video({
                    key: data.name,
                    url: data.src,
                    noAudio: true
                });
                break;
            default:
                console.warn('unrecognized type: ', type);
                break;
        }
    }
}

let lastShakeLeft = true;

function screenShake(amt, durMultManual = 1) {
    lastShakeLeft = !lastShakeLeft;
    if (lastShakeLeft) {
        amt = -amt;
    }
    PhaserScene.cameras.main.scrollX = -amt;
    let durMult = 1 + 0.1 * amt;
    durMult *= durMultManual;
    PhaserScene.tweens.add({
        targets: PhaserScene.cameras.main,
        scrollX: amt,
        ease: "Quint.easeOut",
        duration: 50*durMult,
        onComplete: () => {
            PhaserScene.tweens.add({
                targets: PhaserScene.cameras.main,
                scrollX: 0,
                ease: "Bounce.easeOut",
                easeParams: [3],
                duration: 150*durMult,
            });
        }
    });
}


function screenShakeLong(amt) {
    lastShakeLeft = !lastShakeLeft;
    if (lastShakeLeft) {
        amt = -amt;
    }
    PhaserScene.cameras.main.scrollX = -amt;
    let durMult = 1 + 0.1 * amt;
    PhaserScene.tweens.add({
        targets: PhaserScene.cameras.main,
        scrollX: amt,
        ease: "Quint.easeOut",
        duration: 150*durMult,
        onComplete: () => {
            PhaserScene.tweens.add({
                targets: PhaserScene.cameras.main,
                scrollX: 0,
                ease: "Bounce.easeOut",
                easeParams: [3],
                duration: 400*durMult,
            });
        }
    });
}

function screenShakeManual(amt, durMultManual = 1) {
    lastShakeLeft = !lastShakeLeft;
    if (lastShakeLeft) {
        amt = -amt;
    }
    PhaserScene.cameras.main.scrollX = -amt;
    let durMult = 1 + 0.1 * amt;
    durMult *= durMultManual;
    PhaserScene.tweens.add({
        targets: PhaserScene.cameras.main,
        scrollX: amt,
        ease: "Quint.easeOut",
        duration: 50*durMult,
        onComplete: () => {
            PhaserScene.tweens.add({
                targets: PhaserScene.cameras.main,
                scrollX: -amt * 0.9,
                ease: "Quint.easeInOut",
                duration: 50*durMult,
                onComplete: () => {
                    PhaserScene.tweens.add({
                        targets: PhaserScene.cameras.main,
                        scrollX: 0,
                        ease: "Bounce.easeOut",
                        easeParams: [3],
                        duration: 150*durMult,
                    });
                }
            });
        }
    });
}

function zoomTemp(zoomAmt) {
    PhaserScene.cameras.main.setZoom(zoomAmt);
    PhaserScene.tweens.add({
        targets: PhaserScene.cameras.main,
        zoom: 1,
        ease: "Cubic.easeOut",
        duration: 200
    });
}

function zoomTempSlow(zoomAmt) {
    PhaserScene.tweens.add({
        targets: PhaserScene.cameras.main,
        zoom: zoomAmt,
        ease: "Cubic.easeIn",
        duration: 40,
        onComplete: () => {
            PhaserScene.tweens.add({
                targets: PhaserScene.cameras.main,
                zoom: 1,
                ease: "Cubic.easeOut",
                duration: 300
            });
        }
    });
}

function handleBorders() {
    let leftBorder = document.getElementById('leftborder');
    let rightBorder = document.getElementById('rightborder');
    if (!leftBorder || !rightBorder) {
        return;
    }
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = pixelWidth / pixelHeight;
    var gameScale = 1;
    let isNarrow = false;
    if (windowRatio < gameRatio) {
        gameScale = windowWidth / pixelWidth;
        isNarrow = true;
    } else {
        gameScale = windowHeight / pixelHeight;

    }
    if (isNarrow) {
        rightBorder.style.display = 'none';
        leftBorder.style.display = 'none';
    } else {
        rightBorder.style.display = 'block';
        leftBorder.style.display = 'block';
    }
    //block


    let widthAmt = 86 * gameScale
    leftBorder.style.width = widthAmt + 'px';
    rightBorder.style.width = widthAmt + 'px';
    let shiftAmt = pixelWidth * gameScale * 0.5 + widthAmt - 2;
    leftBorder.style.left = 'calc(50% - ' + shiftAmt + 'px)'
    rightBorder.style.right = 'calc(50% - ' + shiftAmt + 'px)'
}

function showHTMLBackground() {
    let leftBorder = document.getElementById('leftborder');
    let rightBorder = document.getElementById('rightborder');
    let background = document.getElementById('background');


    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if (windowRatio >= gameRatio) {
        background.style['animation-name'] = 'changeShadow';
        background.style.opacity = '1';
    }

    leftBorder.style['animation-name'] = 'changeFull';
    leftBorder.style.opacity = '1';
    rightBorder.style['animation-name'] = 'changeFull';
    rightBorder.style.opacity = '1';
}

let currBackground = 'grass_bg.webp';
function switchBackground(newBG) {
    if (currBackground === newBG) {
        return;
    }
    let background = document.getElementById('background');
    background.style['animation-name'] = 'fadeAway';
    background.style['animation-duration'] = '1.5s';
    background.style.opacity = '0';
    setTimeout(() => {
        currBackground = newBG;
        background.style['background-image'] = 'url("sprites/preload/' + newBG + '")';

        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var windowRatio = windowWidth / windowHeight;
        var gameRatio = game.config.width / game.config.height;
        if (windowRatio >= gameRatio) {
            background.style['animation-name'] = 'changeShadow';
            background.style.opacity = '1';
        }
    }, 1400)
}

function switchBackgroundInstant(newBG) {

    if (currBackground === newBG) {
        return;
    }
    currBackground = newBG;
    let background = document.getElementById('background');
    background.style['background-image'] = 'url("sprites/preload/' + newBG + '")';

    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if (windowRatio >= gameRatio) {
        background.style.opacity = '1';
    }
    background.style['animation-duration'] = '0.5s';
    background.style['animation-name'] = 'fastChange';

}

function preloadImage(newBG) {
    let preload = document.getElementById('preload');
    preload.style['content'] = 'url("sprites/preload/' + newBG + '")'
}

function fadeBackground() {
    let background = document.getElementById('background');
    background.style.opacity = '0';
    background.style['animation-name'] = 'fadeAway';
    background.style['animation-duration'] = '3s';
}
