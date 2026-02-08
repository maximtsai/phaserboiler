let canFinishLoading = false;
let canvas;

function setupLoadingBar(scene) {
    // PhaserScene.cameras.main.setZoom(0.98);
    // fadeInBackground('backgroundPreload', 5000, 3.28);

    // Basic loading bar visual
    loadObjects.version = scene.add.text(4, gameConsts.height - 4, gameVersion).setOrigin(0, 1).setAlpha(0.7);
    loadObjects.version.scrollFactorX = 0; loadObjects.version.scrollFactorY = 0;

    loadObjects.loadingText = scene.add.text(gameConsts.halfWidth, gameConsts.height - (isMobile ? 342 : 328), 'Loading...', {fontFamily: 'garamondbold', fontSize: 36, color: '#FFFFFF', align: 'center'}).setDepth(1001);
    loadObjects.loadingText.setScale(0.6).setAlpha(0.93);
    loadObjects.loadingText.setAlign('center');
    loadObjects.loadingText.setOrigin(0.5, 0);
    loadObjects.loadingText.scrollFactorX = 0.3; loadObjects.loadingText.scrollFactorY = 0.3;
    loadObjects.loadingBarBack = scene.add.image(gameConsts.halfWidth, gameConsts.halfHeight + 100, 'whitePixel').setAlpha(0.5);
    loadObjects.loadingBarMain = scene.add.image(gameConsts.halfWidth, gameConsts.halfHeight + 100, 'whitePixel');

    loadObjects.loadingBarBack.setScale(200, 3);
    loadObjects.loadingBarMain.setScale(1, 3);

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
                loadObjects.loadingBarMain.scaleX = 200 * progress;
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
        duration: 750,
        ease: 'Cubic.easeOut'
    });

    PhaserScene.tweens.add({
        targets: [loadObjects.loadingText2, loadObjects.loadingText3],
        alpha: 0,
        duration: 800,
        ease: 'Quad.easeOut'
    });


    if (gameOptions.skipIntroFull) {
        loadObjects.glowBG.alpha = 0;
        PhaserScene.tweens.add({
            targets: loadObjects.glowBG,
            alpha: 1,
            duration: 900,
            ease: 'Quart.easeIn',
            onComplete: () => {
                this.skipIntro();
            }
        });
        loadObjects.glowBG.setScale(14);

    } else {
        PhaserScene.tweens.add({
            delay: 1500,
            targets: loadObjects.glowBG,
            alpha: 1.25,
            scaleX: 14,
            scaleY: 14,
            duration: 500,
            ease: 'Quart.easeIn',
            onComplete: () => {
                cleanupIntro(PhaserScene);
            }
        });
    }

    loadObjects.skipIntroText = PhaserScene.add.text(gameConsts.width - 5, gameConsts.height - 5, getLangText('click_to_skip'), {fontFamily: 'verdana', fontSize: 18, color: '#FFFFFF', align: 'right'}).setDepth(1005).setAlpha(0).setOrigin(1, 1);
    // loadObjects.loadingText.setText(" ").setAlpha(0).setScale(0.75).y -= 18;
    loadObjects.whiteOverall = PhaserScene.add.image(gameConsts.halfWidth, gameConsts.halfHeight, 'whitePixel').setDepth(2000).setAlpha(0).setScale(1000);
    PhaserScene.tweens.add({
        targets: loadObjects.whiteOverall,
        alpha: 0.75,
        ease: 'Quad.easeIn',
        duration: 2100
    });
}

function cleanupIntro() {
    if (gameVars.introFinished) {
        return;
    }
    gameVars.introFinished = true;
    tempBG = PhaserScene.add.image(gameConsts.halfWidth, gameConsts.halfHeight, 'whitePixel').setScale(1000).setAlpha(0.85).setDepth(1002);
    PhaserScene.tweens.add({
        targets: tempBG,
        alpha: 0,
        duration: 750,
        onComplete: () => {
            tempBG.destroy();
        }
    });

    hideGlobalClickBlocker();
}

function setupGame() {
    canvas = game.canvas;
    if (gameVars.started) {
        return;
    }

    gameVars.started = true;
    // PhaserScene.sound.pauseOnBlur = false;

    createAnimations(PhaserScene);

    globalObjects.timeManager = new TimeManager();
    globalObjects.hoverTextManager = new InternalHoverTextManager(PhaserScene);

    console.log("setup game called")
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
