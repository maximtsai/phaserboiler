// Global error handler to catch startup failures
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    let gameDiv = document.getElementById('preload-notice');
    if (gameDiv && !gameVars.gameConstructed) {
        gameDiv.innerHTML = "An error occurred while loading.\nPlease refresh the page.";
        gameDiv.style.color = '#ff6b6b';
        gameDiv.style.fontSize = '16px';
    }
});

let isMobile = testMobile();
window.isMobile = isMobile;
let pixelWidth = isMobile ? CONSTANTS.MOBILE_WIDTH : CONSTANTS.DESKTOP_WIDTH;
let pixelHeight = isMobile ? CONSTANTS.MOBILE_HEIGHT : CONSTANTS.DESKTOP_HEIGHT;
handleBorders();
let gameVersion = CONSTANTS.GAME_VERSION;
window.gameVersion = gameVersion;
let config = {
    type: Phaser.AUTO,
    scale: {
        parent: 'newgame',
        autoRound: true,
        width: pixelWidth,
        height: isMobile ? CONSTANTS.MOBILE_HEIGHT : CONSTANTS.DESKTOP_HEIGHT,
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
    clearBeforeRender: false,
    parent: 'newgame',
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
window.game = game;

function onloadFunc() {
    if (!document.location.href.includes(url1) && !document.location.href.includes(url2) && !document.location.href.includes(url4)) {
        let gameDiv = document.getElementById('preload-notice');
        let invalidSite = document.location.href.substring(0, CONSTANTS.URL_SUBSTRING_LENGTH);
        gameDiv.innerHTML = invalidSite + "...\nis an invalid site.\n\n" + "Try the game on Crazygames.com!";
        gameDiv.style.color = '#ff6b6b';
        gameDiv.style.fontSize = '18px';
        gameDiv.style.cursor = 'default';
        gameDiv.onclick = null;
        return; // Don't start the game
    }

    game = new Phaser.Game(config); // var canvas = game.canvas;
    window.game = game;
    gameVars.gameConstructed = true;
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
let timeUpdateCounterMax = CONSTANTS.TIME_UPDATE_MAX;
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

    // Use centralized loading manager for stall detection and retry logic
    loadingManager.setupInitialPreload(this, gameDiv);

    loadFileList(this, imageFilesPreload, 'image');
    setTimeout(() => {
        resizeGame();
    }, CONSTANTS.SMALL_TIMEOUT)
}

function create ()
{
    if (!document.location.href.includes(url1) && !document.location.href.includes(url2) && !document.location.href.includes(url4)) {
        return;
    }
    oldTime = Date.now();
    PhaserScene = this;
    window.PhaserScene = PhaserScene;
    onPreloadComplete(this);
}

function onPreloadComplete (scene)
{
    try {
        showHTMLBackground();
        globalObjects.tempBG = scene.add.sprite(0, 0, 'blackPixel').setScale(CONSTANTS.BACKGROUND_SCALE, CONSTANTS.BACKGROUND_SCALE).setDepth(-1);

        setupMouseInteraction(scene);
        setupLoadingBar(scene);

        loadFileList(scene, audioFiles, 'audio');
        loadFileList(scene, imageAtlases, 'atlas');
        loadFileList(scene, imageFiles, 'image');
        loadFileList(scene, fontFiles, 'bitmap_font');
        loadFileList(scene, videoFiles, 'video');

        scene.load.start();
    } catch (error) {
        console.error('Error in onPreloadComplete:', error);
        // Try to continue anyway
        setTimeout(() => {
            onLoadComplete(scene);
        }, CONSTANTS.LARGE_TIMEOUT);
    }
}

function onLoadComplete(scene) {
    gameVars.gameConstructed = true;
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
        deltaScale = Math.min(5, deltaTime / CONSTANTS.DELTA_TIME_BASE);
        lastUpdateValues[lastUpdateValuesIdx] = deltaScale;
        lastUpdateValuesIdx = (lastUpdateValuesIdx + 1) % 5;
        avgDeltaScale = 0;
        for (let i = 0; i < 5; i++) {
            avgDeltaScale += lastUpdateValues[i] * 0.2;
        }
    } else {
        timeUpdateCounter++;
    }

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
    for (const data of filesList) {
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
        duration: CONSTANTS.SHAKE_DURATION_SHORT * durMult,
        onComplete: () => {
            PhaserScene.tweens.add({
                targets: PhaserScene.cameras.main,
                scrollX: 0,
                ease: "Bounce.easeOut",
                easeParams: [CONSTANTS.SHAKE_BOUNCE_PARAM],
                duration: CONSTANTS.SHAKE_DURATION_LONG * durMult,
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
        duration: CONSTANTS.SHAKE_DURATION_LONG * durMult,
        onComplete: () => {
            PhaserScene.tweens.add({
                targets: PhaserScene.cameras.main,
                scrollX: 0,
                ease: "Bounce.easeOut",
                easeParams: [CONSTANTS.SHAKE_BOUNCE_PARAM],
                duration: CONSTANTS.SHAKE_DURATION_EXTRA_LONG * durMult,
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
        duration: CONSTANTS.SHAKE_DURATION_SHORT * durMult,
        onComplete: () => {
            PhaserScene.tweens.add({
                targets: PhaserScene.cameras.main,
                scrollX: -amt * 0.9,
                ease: "Quint.easeInOut",
                duration: CONSTANTS.SHAKE_DURATION_SHORT * durMult,
                onComplete: () => {
                    PhaserScene.tweens.add({
                        targets: PhaserScene.cameras.main,
                        scrollX: 0,
                        ease: "Bounce.easeOut",
                        easeParams: [CONSTANTS.SHAKE_BOUNCE_PARAM],
                        duration: CONSTANTS.SHAKE_DURATION_LONG * durMult,
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
        duration: CONSTANTS.ZOOM_DURATION_FAST
    });
}

function zoomTempSlow(zoomAmt) {
    PhaserScene.tweens.add({
        targets: PhaserScene.cameras.main,
        zoom: zoomAmt,
        ease: "Cubic.easeIn",
        duration: CONSTANTS.ZOOM_DURATION_SLOW_IN,
        onComplete: () => {
            PhaserScene.tweens.add({
                targets: PhaserScene.cameras.main,
                zoom: 1,
                ease: "Cubic.easeOut",
                duration: CONSTANTS.ZOOM_DURATION_SLOW_OUT
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


    let widthAmt = CONSTANTS.BORDER_WIDTH_FACTOR * gameScale;
    leftBorder.style.width = widthAmt + 'px';
    rightBorder.style.width = widthAmt + 'px';
    let shiftAmt = pixelWidth * gameScale * 0.5 + widthAmt - CONSTANTS.BORDER_SHIFT_OFFSET;
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
    background.style['animation-duration'] = CONSTANTS.BACKGROUND_FADE_DURATION + 's';
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
    }, CONSTANTS.BACKGROUND_SWITCH_DELAY)
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
    background.style['animation-duration'] = CONSTANTS.BACKGROUND_ANIMATION_FAST + 's';
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
    background.style['animation-duration'] = CONSTANTS.BACKGROUND_FADE_DURATION_LONG + 's';
}

let canResizeGame = true;
function resizeGame() {
    if (!canResizeGame) {
        return;
    }
    if (!game) {
        return;
    }
    if (!game.canvas) {
        return;
    }
    var canvas = game.canvas;
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    var gameScale = 1;
    let background = document.getElementById('background');
    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + "px";
        canvas.style.height = windowWidth / gameRatio + "px";
        gameScale = windowWidth / game.config.width;
        gameVars.canvasXOffset = 0;
        gameVars.canvasYOffset = (windowHeight - game.config.height * gameScale) * 0.5;
        background.style.opacity = '0';
    } else {
        canvas.style.width = windowHeight * gameRatio + "px";
        canvas.style.height = windowHeight + "px";
        gameScale = windowHeight / game.config.height;
        gameVars.canvasYOffset = 0;
        gameVars.canvasXOffset = (windowWidth - game.config.width * gameScale) * 0.5;
        background.style.opacity = '1';
    }
    gameVars.gameScale = gameScale;

    handleBorders();
}

Object.assign(window, {
    onloadFunc,
    onLoadComplete,
    resizeGame,
    gameConsts,
    gameVars,
    loadObjects,
    globalObjects,
    gameOptions,
    challenges,
    cheats,
    funnies,
    loadFileList,
    screenShake,
    screenShakeLong,
    screenShakeManual,
    zoomTemp,
    zoomTempSlow,
    handleBorders,
    showHTMLBackground,
    switchBackground,
    switchBackgroundInstant,
    preloadImage,
    fadeBackground,
});

window.addEventListener('load', onloadFunc);
window.addEventListener('resize', resizeGame);
