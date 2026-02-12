let canFinishLoading = false;
let tempBG;

function setupLoadingBar(scene) {
    // PhaserScene.cameras.main.setZoom(0.98);
    // fadeInBackground('backgroundPreload', 5000, 3.28);

    // Basic loading bar visual
    loadObjects.version = scene.add.text(CONSTANTS.VERSION_PADDING_X, gameConsts.height - CONSTANTS.VERSION_PADDING_X, window.gameVersion).setOrigin(0, 1).setAlpha(0.7);
    loadObjects.version.scrollFactorX = 0; loadObjects.version.scrollFactorY = 0;

    loadObjects.loadingText = scene.add.text(gameConsts.halfWidth, gameConsts.height - (window.isMobile ? CONSTANTS.LOADING_TEXT_MOBILE_Y : CONSTANTS.LOADING_TEXT_DESKTOP_Y), 'Loading...', {fontFamily: 'garamondbold', fontSize: 36, color: '#FFFFFF', align: 'center'}).setDepth(CONSTANTS.LOADING_TEXT_DEPTH);
    loadObjects.loadingText.setScale(CONSTANTS.LOADING_TEXT_SCALE).setAlpha(CONSTANTS.LOADING_TEXT_ALPHA);
    loadObjects.loadingText.setAlign('center');
    loadObjects.loadingText.setOrigin(0.5, 0);
    loadObjects.loadingText.scrollFactorX = 0.3; loadObjects.loadingText.scrollFactorY = 0.3;
    loadObjects.loadingBarBack = scene.add.image(gameConsts.halfWidth, gameConsts.halfHeight + CONSTANTS.LOADING_BAR_OFFSET_Y, 'whitePixel').setAlpha(0.5);
    loadObjects.loadingBarMain = scene.add.image(gameConsts.halfWidth, gameConsts.halfHeight + CONSTANTS.LOADING_BAR_OFFSET_Y, 'whitePixel');

    loadObjects.loadingBarBack.setScale(CONSTANTS.LOADING_BAR_WIDTH, CONSTANTS.LOADING_BAR_HEIGHT);
    loadObjects.loadingBarMain.setScale(1, CONSTANTS.LOADING_BAR_HEIGHT);

    // Use centralized loading manager with progress callback for visual feedback
    loadingManager.setupMainLoading(
        scene,
        // On complete callback
        () => {
            loadObjects.loadingText.setVisible(false);
            onLoadComplete(scene);
            // loadObjects.fadeBG = scene.add.image(gameConsts.halfWidth, gameConsts.halfHeight, 'blackPixel').setScale(1000).setAlpha(0.5).setDepth(-5);

            for (let i in loadObjects) {
                if (loadObjects[i] && loadObjects[i].destroy) {
                    loadObjects[i].destroy();
                }
            }
        },
        // On progress callback - handles loading bar and text updates
        (progress, statusText) => {
            if (progress !== null && progress !== undefined) {
                loadObjects.loadingBarMain.scaleX = CONSTANTS.LOADING_BAR_WIDTH * progress;
            }
            if (statusText) {
                loadObjects.loadingText.setText(`Loading... (${statusText})`);
            }
        }
    );
}


function clickIntro() {
    gameVars.runningIntro = true;

    PhaserScene.tweens.add({
        targets: PhaserScene.cameras.main,
        scrollX: 0,
        scrollY: 0,
        duration: CONSTANTS.CAMERA_TWEEN_DURATION,
        ease: 'Cubic.easeOut'
    });

    PhaserScene.tweens.add({
        targets: [loadObjects.loadingText2, loadObjects.loadingText3],
        alpha: 0,
        duration: CONSTANTS.TEXT_FADE_DURATION,
        ease: 'Quad.easeOut'
    });


    if (gameOptions.skipIntroFull) {
        loadObjects.glowBG.alpha = 0;
        PhaserScene.tweens.add({
            targets: loadObjects.glowBG,
            alpha: 1,
            duration: CONSTANTS.INTRO_GLOW_DURATION,
            ease: 'Quart.easeIn',
            onComplete: () => {
                this.skipIntro();
            }
        });
        loadObjects.glowBG.setScale(CONSTANTS.INTRO_GLOW_SCALE);

    } else {
        PhaserScene.tweens.add({
            delay: CONSTANTS.INTRO_GLOW_DELAY,
            targets: loadObjects.glowBG,
            alpha: CONSTANTS.INTRO_GLOW_ALPHA,
            scaleX: CONSTANTS.INTRO_GLOW_SCALE,
            scaleY: CONSTANTS.INTRO_GLOW_SCALE,
            duration: CONSTANTS.INTRO_GLOW_DURATION,
            ease: 'Quart.easeIn',
            onComplete: () => {
                cleanupIntro(PhaserScene);
            }
        });
    }

    loadObjects.skipIntroText = PhaserScene.add.text(gameConsts.width - CONSTANTS.SKIP_TEXT_OFFSET, gameConsts.height - CONSTANTS.SKIP_TEXT_OFFSET, getLangText('click_to_skip'), {fontFamily: 'verdana', fontSize: 18, color: '#FFFFFF', align: 'right'}).setDepth(CONSTANTS.SKIP_TEXT_DEPTH).setAlpha(0).setOrigin(1, 1);
    // loadObjects.loadingText.setText(" ").setAlpha(0).setScale(0.75).y -= 18;
    loadObjects.whiteOverall = PhaserScene.add.image(gameConsts.halfWidth, gameConsts.halfHeight, 'whitePixel').setDepth(CONSTANTS.WHITE_OVERLAY_DEPTH).setAlpha(0).setScale(CONSTANTS.BACKGROUND_SCALE);
    PhaserScene.tweens.add({
        targets: loadObjects.whiteOverall,
        alpha: CONSTANTS.INTRO_WHITE_OVERLAY_ALPHA,
        ease: 'Quad.easeIn',
        duration: CONSTANTS.INTRO_WHITE_OVERLAY_DURATION
    });
}

function cleanupIntro() {
    if (gameVars.introFinished) {
        return;
    }
    gameVars.introFinished = true;
    tempBG = PhaserScene.add.image(gameConsts.halfWidth, gameConsts.halfHeight, 'whitePixel').setScale(CONSTANTS.BACKGROUND_SCALE).setAlpha(CONSTANTS.INTRO_TEMP_BG_ALPHA).setDepth(CONSTANTS.TEMP_BG_DEPTH);
    PhaserScene.tweens.add({
        targets: tempBG,
        alpha: 0,
        duration: CONSTANTS.INTRO_TEMP_BG_DURATION,
        onComplete: () => {
            tempBG.destroy();
        }
    });

    hideGlobalClickBlocker();
}

function setupGame() {
    window.canvas = game.canvas;
    if (gameVars.started) {
        return;
    }

    gameVars.started = true;
    // PhaserScene.sound.pauseOnBlur = false;

    createAnimations(PhaserScene);

    // Managers are singletons created at module load
    globalObjects.timeManager = timeManager;
    globalObjects.hoverTextManager = hoverTextManager;

    handleGlobalKeyPresses();

    console.log("setup game called");
}

function setupPlayer() {
    globalObjects.options = new Options(PhaserScene, gameConsts.width - 27, 27);
}

function handleGlobalKeyPresses() {
    globalObjects.currentOpenedPopups = [];
    messageBus.subscribe('toggleCancelScreen', () => {
        if (globalObjects.currentOpenedPopups.length > 0) {
            let topFunc = globalObjects.currentOpenedPopups[globalObjects.currentOpenedPopups.length - 1];
            let success = topFunc(false);
            if (success) {
                globalObjects.currentOpenedPopups.pop();
            }
        } else {
            globalObjects.options.showOptions();
        }
    });
}

function addPopup(closeFunc) {
    globalObjects.currentOpenedPopups.push(closeFunc);
    if (globalObjects.length === 4) {
        console.warn("unexpected number of popups");
    }
}

function removePopup() {
    globalObjects.currentOpenedPopups.pop();
}

Object.assign(window, {
    setupLoadingBar,
    clickIntro,
    cleanupIntro,
    setupGame,
    setupPlayer,
    handleGlobalKeyPresses,
    addPopup,
    removePopup,
});

// function repeatFlash() {
//     if (gameVars.introFinished) {
//         return;
//     }

//     loadObjects.flash.currAnim = PhaserScene.tweens.add({
//         targets: loadObjects.flash,
//         scaleX: 0.28,
//         scaleY: 0.4,
//         ease: 'Quart.easeIn',
//         duration: 500,
//         onComplete: () => {
//             loadObjects.flash.currAnim = PhaserScene.tweens.add({
//                 targets: loadObjects.flash,
//                 scaleX: 0.1,
//                 scaleY: 0.2,
//                 ease: 'Back.easeOut',
//                 duration: 600,
//                 onComplete: () => {
//                     loadObjects.flash.currAnim = PhaserScene.tweens.add({
//                         targets: loadObjects.flash,
//                         scaleX: 0.18,
//                         scaleY: 0.3,
//                         ease: 'Quart.easeIn',
//                         duration: 550,
//                         onComplete: () => {
//                             loadObjects.flash.currAnim = PhaserScene.tweens.add({
//                                 targets: loadObjects.flash,
//                                 scaleX: 0.1,
//                                 scaleY: 0.2,
//                                 ease: 'Back.easeOut',
//                                 duration: 600,
//                                 onComplete: () => {
//                                     this.repeatFlash();
//                                 }
//                             });
//                         }
//                     });
//                 }
//             });
//         }
//     });
// }
