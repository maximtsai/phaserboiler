class DialogBranchButton {
    constructor(scene, x = gameConsts.halfWidth, y = gameConsts.halfHeight) {
        gameVars.typeWriterAccumulate = 99999;
        gameVars.typeWriterNextDelay = 0;
        this.scene = scene || PhaserScene;

        this.dialogButton = new Button({
            normal: {
                "ref": "blackPixel",
                x: x,
                y: y,
                alpha: 0.65
            },
            hover: {
                "ref": "blackPixel",
                alpha: 0.75
            },
            press: {
                "ref": "blackPixel",
                alpha: 0.45
            },
            disable: {
                "ref": "blackPixel",
                alpha: 0.001
            },
            onMouseUp: () => {
                if (this.prevFinishFunc) {
                    this.prevFinishFunc();
                    this.prevFinishFunc = null;
                }
                messageBus.publish("clearBranchOptions");
                // TODO: Move publishMessage up
                if (this.publishMessage) {
                    messageBus.publish(this.publishMessage, this.publishParam);
                }
                if (this.destNode) {
                    messageBus.publish('gotoDialogNode', this.destNode);
                } else {
                    messageBus.publish("hideAllDialog");
                    messageBus.publish("hideUndoPoint");
                }
            }
        });
        this.dialogButton.setDepth(998);
        this.dialogButton.setState(DISABLE);
        this.dialogButton.setScale(215, 29.5);

        this.text = this.scene.add.bitmapText(x, y, 'dialog', '', 26);
        this.text.align = 1;
        this.text.visible = false;
        this.text.setDepth(1000);
        this.text.setOrigin(0.5, 0.48);
        this.setPosition(0, -999);
    }

    setPosition(x, y) {
        this.dialogButton.setPos(x, y);
        this.text.setPosition(x, y);
    }

    setText(text) {
        this.prevFinishFunc = null;

        this.text.setText(text);
        if (this.text.text.length > 40) {
            this.text.setFontSize(18);
        }
        if (this.text.text.length > 24) {
            this.text.setFontSize(23);
        } else {
            this.text.setFontSize(26);
        }
    }

    setActive() {
        this.text.visible = true;
        this.dialogButton.setState(NORMAL);
    }

    setDestNode(nodeName) {
        this.destNode = nodeName
    }

    setPublishData(message, param) {
        this.publishMessage = message;
        this.publishParam = param;
    }

    setPrevFinishFunc(func) {
        this.prevFinishFunc = func;
    }

    setInactive() {
        this.text.visible = false;
        this.dialogButton.setState(DISABLE);
        this.publishMessage = null;
        this.prevFinishFunc = null;
    }
}

class DialogDisplay {
    constructor(scene) {
        this.scene = scene || PhaserScene;
        this.lastSpeaker = "";
        let horizOffset = 30;

        this.dialogUnder = this.scene.add.image(90, gameConsts.height - 58, 'blackPixel');
        this.dialogUnder.visible = false;
        this.dialogUnder.setDepth(997).setScale(0);
        this.dialogUnder.setOrigin(0.5, 0.5);
        this.dialogUnder.scrollFactorX = 0;
        this.dialogUnder.scrollFactorY = 0;

        this.dialogBox = this.scene.add.image(gameConsts.halfWidth, gameConsts.height, 'blackPixel');
        this.dialogBox.setScale(gameConsts.width * 0.5 + 1, 74);
        this.dialogBox.visible = false;
        this.dialogBox.setDepth(997).setAlpha(0.75);
        this.dialogBox.setOrigin(0.5, 1);
        this.dialogBox.scrollFactorX = 0;
        this.dialogBox.scrollFactorY = 0;

        this.dialogTextYPos = gameConsts.height - 129;
        this.dialogText = this.scene.add.bitmapText(32 + horizOffset * 1.5, this.dialogTextYPos, 'dialog', '', 22);
        this.dialogText.startX = this.dialogText.x;
        this.dialogText.visible = false;
        this.dialogText.setDepth(999);
        this.dialogText.setOrigin(0, 0);
        this.dialogText.scrollFactorX = 0;
        this.dialogText.scrollFactorY = 0;

        this.secondDialogText = this.scene.add.bitmapText(this.dialogText.x, this.dialogTextYPos, 'dialog', '', 22);
        this.secondDialogText.startX = this.secondDialogText.x;
        this.secondDialogText.visible = false;
        this.secondDialogText.setDepth(999).setAlpha(0.7);
        this.secondDialogText.setOrigin(0, 0);
        this.secondDialogText.scrollFactorX = 0;
        this.secondDialogText.scrollFactorY = 0;

        this.dialogPrompt = this.scene.add.image(gameConsts.halfWidth, gameConsts.height - 144, 'ui', 'timer_bar.png');
        this.dialogPrompt.visible = false;
        this.dialogPrompt.setDepth(999).setScale(1.5, 1);
        this.dialogPrompt.setOrigin(0.5, 0.5);
        this.dialogPrompt.scrollFactorX = 0;
        this.dialogPrompt.scrollFactorY = 0;
        this.dialogAccRatio = 1;

        this.dialogSpeaker = this.scene.add.bitmapText(gameConsts.halfWidth + horizOffset * 1.5, gameConsts.height - 154, 'dialog', 'INSERT NAME', 30);
        this.dialogSpeaker.visible = false;
        this.dialogSpeaker.setScale(0); // hidden for now
        this.dialogSpeaker.setDepth(999);
        this.dialogSpeaker.setOrigin(0.5, 0);
        this.dialogSpeaker.scrollFactorX = 0;
        this.dialogSpeaker.scrollFactorY = 0;

        this.dialogFace = this.scene.add.sprite(54 + horizOffset * 1.25, gameConsts.height - 72, 'faces', 'air_happy_talk.png');
        this.dialogFace.startX = this.dialogFace.x;
        this.dialogFace.setDepth(998);
        this.dialogFace.visible = false;
        this.dialogFace.setScale(0.645);
        this.dialogFace.scrollFactorX = 0;
        this.dialogFace.scrollFactorY = 0;

        this.createDialogTalkBars(this.dialogFace.x, this.dialogFace.y);

        this.dialogClickBlocker = new Button({
            normal: {
                ref: "blackPixel",
                x: this.dialogBox.x,
                y: this.dialogBox.y + 3,
                alpha: 0,
                scaleX: this.dialogBox.scaleX,
                scaleY: this.dialogBox.scaleY
            },
            onHover: () => {
                if (canvas) {
                    canvas.style.cursor = 'pointer';
                }
            },
            onHoverOut: () => {
                if (canvas) {
                    canvas.style.cursor = 'default';
                }
            },
            onMouseUp: () => {
                messageBus.publish('clickNextDialog');
            }
        });
        this.dialogClickBlocker.setDepth(9998);
        this.dialogClickBlocker.setOrigin(0.5, 1);
        this.dialogClickBlocker.setState(DISABLE);

        // No dialog clicking here
        // this.dialogButton = new Button({
        //     normal: {
        //         atlas: "buttons",
        //         ref: "continue_btn.png",
        //         x: gameConsts.halfWidth,
        //         y: gameConsts.height- 85,
        //         scaleX: 10,
        //         scaleY: 200,
        //         alpha: 0.001
        //     },
        //     hover: {
        //         atlas: "buttons",
        //         "ref": "continue_btn_hover.png",
        //         alpha: 0.001
        //     },
        //     press: {
        //         "atlas": "buttons",
        //         "ref": "continue_btn_hover.png",
        //         alpha: 0.001
        //     },
        //     disable: {
        //         "atlas": "buttons",
        //         "ref": "continue_btn_hover.png",
        //         alpha: 0.001
        //     },
        //     onMouseUp: () => {
        //         messageBus.publish('clickNextDialog');
        //     },
        //     cursorInteractive: true
        // });
        // this.dialogButton.setDepth(998);
        // this.dialogButton.setState(DISABLE);

        this.subscriptions = [
            messageBus.subscribe("hideAllDialog", this.hideAll.bind(this)),
            messageBus.subscribe("showTalkText", this.showTalkText.bind(this)),
            messageBus.subscribe("showTalkFace", this.showTalkFace.bind(this)),
            messageBus.subscribe("hideTalkText", this.hideTalkText.bind(this)),
            messageBus.subscribe("showTalkSpeaker", this.showDialogSpeaker.bind(this)),
            messageBus.subscribe("updateTextSize", this.updateTextSize.bind(this)),
            messageBus.subscribe("setDuration", this.setDuration.bind(this)),

            messageBus.subscribe("hideTalkSpeaker", this.hideDialogSpeaker.bind(this)),
            messageBus.subscribe("showNextButton", this.showNextButton.bind(this)),
            messageBus.subscribe("setBranches", this.setBranchesDelayed.bind(this)),
            messageBus.subscribe("clearBranchOptions", this.clearBranchOptions.bind(this)),

            messageBus.subscribe("clickNextDialog", this.clickNextDialog.bind(this)),
            messageBus.subscribe("forceTextProgress", this.setForceTextProgress.bind(this)),
            messageBus.subscribe("doNotRecord", this.setDoNotRecord.bind(this)),
            messageBus.subscribe("unclickable", this.setUnclickable.bind(this)),
            messageBus.subscribe("keepLastChat", this.setKeepLastChat.bind(this)),


            messageBus.subscribe("setDialogBtnToTop", this.setDialogBtnToTop.bind(this)),
            messageBus.subscribe("progressUpdate", this.progressUpdate.bind(this)),
        ];

        this.buttons = [];
        for (let i = 0; i < 5; i++) {
            let newButton = new DialogBranchButton(this.scene);
            this.buttons.push(newButton);
        }

    }

    progressUpdate(progressTotal, dt) {
        if (this.dialogPrompt.visible) {
            this.dialogPrompt.scaleX -= dt * 0.01 * this.dialogAccRatio;
            if (this.dialogPrompt.scaleX <= 0) {
                this.dialogPrompt.scaleX = 0;
                this.dialogPrompt.alpha -= dt * 0.08;
                if (this.dialogPrompt.alpha <= 0) {
                    this.clickNextDialog();



                }
            }
        }

    }

    createDialogTalkBars(x, y) {
        this.dialogTalkBar1 = this.scene.add.sprite(x - 34, y, 'faces', 'talkbar.png').setVisible(false).setDepth(999);
        this.dialogTalkBar2 = this.scene.add.sprite(x, y, 'faces', 'talkbar.png').setVisible(false).setDepth(999);
        this.dialogTalkBar3 = this.scene.add.sprite(x + 34, y, 'faces', 'talkbar.png').setVisible(false).setDepth(999);

        this.dialogTalkBar1.scrollFactorX = 0;
        this.dialogTalkBar2.scrollFactorX = 0;
        this.dialogTalkBar3.scrollFactorX = 0;
    }

    showDialogTalkBars() {
        this.dialogTalkBar1.visible = true;
        this.dialogTalkBar2.visible = true;
        this.dialogTalkBar3.visible = true;

        this.dialogTalkBar1.setScale(0.8, 1);
        this.dialogTalkBar2.setScale(0.8, 1);
        this.dialogTalkBar3.setScale(0.8, 1);
        this.dialogTalkBar1.currAnim = PhaserScene.tweens.add({
            targets: this.dialogTalkBar1,
            duration: 420,
            ease: 'Quad.easeInOut',
            scaleY: 2.5,
            yoyo: true,
            repeatDelay: 1200,
            repeat: -1,
        });
        this.dialogTalkBar2.currAnim = PhaserScene.tweens.add({
            delay: 200,
            targets: this.dialogTalkBar2,
            duration: 420,
            ease: 'Quad.easeInOut',
            scaleY: 2.5,
            yoyo: true,
            repeatDelay: 1200,
            repeat: -1,
        });
        this.dialogTalkBar3.currAnim = PhaserScene.tweens.add({
            delay: 400,
            targets: this.dialogTalkBar3,
            duration: 420,
            ease: 'Quad.easeInOut',
            scaleY: 2.5,
            yoyo: true,
            repeatDelay: 1200,
            repeat: -1,
        });
    }

    hideDialogTalkBars() {
        this.dialogTalkBar1.visible = false;
        this.dialogTalkBar2.visible = false;
        this.dialogTalkBar3.visible = false;

        if (this.dialogTalkBar1.currAnim) {
            this.dialogTalkBar1.currAnim.stop();
            this.dialogTalkBar2.currAnim.stop();
            this.dialogTalkBar3.currAnim.stop();
            this.dialogTalkBar1.currAnim = null;
        }

    }

    disableClickNext() {
        // this.dialogButton.setState(DISABLE);
    }

    hideAll() {
        this.dialogClickBlocker.setState(DISABLE);
        this.hideDialogTalkBars()
        this.dialogSpeaker.visible = false;
        this.dialogBox.visible = false;
        this.dialogFace.visible = false;

        this.dialogPrompt.visible = false;
        if (this.dialogPrompt.currDelay) {
            this.dialogPrompt.currDelay.remove();
        }
        // this.dialogButton.setState(DISABLE);

        this.hideTalkText();
    }

    showDialogSpeaker(name) {
        this.lastSpeaker = this.dialogSpeaker.text;
        this.dialogSpeaker.setText(name);
        this.dialogSpeaker.visible = true;
        this.dialogBox.visible = true;
        this.dialogBox.x = gameConsts.halfWidth;
        this.dialogUnder.visible = true;
        this.dialogSpeaker.x = gameConsts.halfWidth;
    }

    updateTextSize(size = 'normal') {
        if (size === 'small') {
            this.dialogText.setFontSize(16);
            this.secondDialogText.setFontSize(16);
        } else if (size === 'large') {
            this.dialogText.setFontSize(24);
            this.secondDialogText.setFontSize(24);
        } else {
            this.dialogText.setFontSize(22);
            this.secondDialogText.setFontSize(22);
        }
    }

    setDuration(duration = 4000) {
        this.overwriteDuration = duration;
    }

    hideDialogSpeaker() {
        this.dialogSpeaker.visible = false;
    }

    showTalkText(text, instant = false) {
        this.dialogClickBlocker.setState(NORMAL);

        this.dialogPrompt.visible = false;
        if (this.dialogPrompt.currDelay) {
            this.dialogPrompt.currDelay.remove();
        }
        if (this.dialogSpeaker.text.length > 0) {
            this.speakerStartText = this.dialogSpeaker.text + ": ";
        } else {
            this.speakerStartText = "";
        }
        this.currentlyTypedText = this.speakerStartText;
        this.dialogSpeakerTextLength = this.speakerStartText.length;

        this.finalText = text;
        if (this.finalText.length >= 2) {
            this.finalText += "• • • ";
        }

        this.typingText = true;

        if (!this.doNotRecord) {
            if (this.keepLastChat) {
                this.secondDialogText.setText(this.lastChatText);
                this.keepLastChat = false;
            } else {
                this.secondDialogText.setText(this.dialogText.text)
            }

            this.secondDialogText.setAlpha(0.85);

            this.secondDialogText.x = this.dialogText.startX;
            this.secondDialogText.visible = true;
            this.secondDialogText.setFontSize(22);
            PhaserScene.tweens.add({
                targets: this.secondDialogText,
                alpha: 0.55,
                duration: 2200,
                ease: 'Cubic.easeOut'
            });
        } else {
            this.doNotRecord = false;
        }


        this.dialogText.setText(this.currentlyTypedText);
        this.lastChatText = this.finalText;
        this.dialogText.x = this.dialogText.startX;
        this.dialogText.visible = true;
        this.dialogText.setFontSize(22);

        if (this.secondDialogText.text.length > 0 || this.keepLastChat) {
            this.dialogText.y = this.secondDialogText.y + this.secondDialogText.height + 6;
        } else {
            this.dialogText.y = this.secondDialogText.y;
        }


        this.dialogFace.visible = false;

        this.dialogBox.visible = true;
        this.dialogBox.x = gameConsts.halfWidth;
        this.dialogUnder.visible = true;
        // this.dialogButton.setState(NORMAL);
        // this.dialogButton.setPos(gameConsts.halfWidth, gameConsts.height- 85);

        let i = 0;
        // let numCharRevealed = 1 + gameVars.typeWriterAccumulate; Math.max(1, Math.floor(gameVars.averageDeltaScale * 1.2));
        let prevDateNow = Date.now();
        this.currentTypewriterEvent = this.scene.time.addEvent({
            callback: () => {
                if (this.typingText) {
                    if (gameVars.typeWriterAccumulate >= gameVars.typeWriterNextDelay) {
                        let nextWordRevealed = this.getNextWord(this.finalText, i);
                        let delayCount = this.getDelayCount(nextWordRevealed);
                        gameVars.typeWriterAccumulate = 0;
                        gameVars.typeWriterNextDelay = nextWordRevealed.length * 5 + 40 + 50 * delayCount;
                        this.currentlyTypedText += nextWordRevealed;
                        this.dialogText.setText(this.currentlyTypedText);
                        i += nextWordRevealed.length;

                        if (this.currentlyTypedText.length >= this.finalText.length + this.dialogSpeakerTextLength) {
                            this.finishTypingText();
                        } else if (nextWordRevealed !== "•" && nextWordRevealed !== "• ") {
                            if (i === 0) {
                                playSound('typewrite').detune = -100 + Math.random() * 130;
                            } else {
                                let soundSfx = Math.random() < 0.5 ? 'typewrite' : 'typewrite2';
                                playSound(soundSfx).detune = -100 + Math.random() * 200;
                            }
                        }
                    } else {
                        let timeDiff = Date.now() - prevDateNow;
                        prevDateNow = Date.now();
                        gameVars.typeWriterAccumulate += timeDiff;
                    }

                } else {
                    this.currentTypewriterEvent.remove();
                }
            },
            repeat: this.finalText.length * 10,
            delay: 10
        });
        if (instant) {
            this.finishTypingText();
        }
    }

    getNextWord(text, startIdx) {
        let currWord = "";
        if (!text[startIdx]) {
            // do nothing
        } else if (text[startIdx] === " "
            || text[startIdx] === "."
            || text[startIdx] === "!"
            || text[startIdx] === ","
            || text[startIdx] === "?") {
            currWord += text[startIdx];
        } else {
            currWord += text[startIdx] + this.getNextWord(text, startIdx + 1);
        }
        return currWord;
    }

    getDelayCount(text) {
        let count = 0;
        for (let char of text) {
            if (char === '•') {
                count++;
            }
        }
        return count;
    }

    showTalkFace(faceFrame = 'blank.png') {
        this.dialogText.x = this.dialogText.startX + 100;
        this.dialogFace.visible = true;
        this.dialogFace.x = this.dialogFace.startX;
        this.secondDialogText.x = this.dialogText.x;
        // Special case for player
        if (faceFrame === 'player1.png' && this.dialogFace.frame.name !== 'player1.png') {
            this.showDialogTalkBars()
        } else if (this.dialogFace.frame.name === 'player1.png') {
            this.hideDialogTalkBars();
        }
        this.swapFace(faceFrame);

    }

    swapFace(frame) {
        this.dialogFace.setFrame(frame);
        this.dialogFace.setDepth(998);
        return this.dialogFace;
    }

    finishTypingText() {
        gameVars.typeWriterAccumulate = 99999;
        this.typingText = false;
        if (this.currentTypewriterEvent) {
            this.currentTypewriterEvent.remove();
        }
        this.currentlyTypedText = this.speakerStartText + this.finalText;
        this.dialogText.setText(this.currentlyTypedText);
        if (this.branchesToSet) {
            this.showBranches();
        } else {
            if (this.dialogPrompt.currDelay) {
                this.dialogPrompt.currDelay.remove();
            }
            if (this.finalText.length > 48) {
                this.overwriteDuration = this.overwriteDuration || (230 + 1000 + this.finalText.length * 10);
            } else {
                this.overwriteDuration = this.overwriteDuration || (230 + this.finalText.length * 20);
            }
            this.dialogAccRatio = 1000 / this.overwriteDuration;
            this.overwriteDuration = 0;
            this.dialogPrompt.visible = true;
            this.dialogPrompt.setScale(1.5, 1);
            this.dialogPrompt.setAlpha(0.2);
            PhaserScene.tweens.add({
                targets: this.dialogPrompt,
                alpha: 1,
                ease: 'Cubic.easeOut',
                duration: 160
            })

        }
        if (this.forceTextProgress) {
            this.forceTextProgress = false;
            if (this.onButtonClick) {
                this.onButtonClick();
            }
        }
    }

    update() {

    }

    hideTalkText() {
        this.dialogText.visible = false;
        this.dialogText.setText('');
        this.secondDialogText.visible = false;
        this.secondDialogText.setText('');
        this.typingText = false;
        if (this.currentTypewriterEvent) {
            this.currentTypewriterEvent.remove();
        }
    }

    showNextButton(onButtonClick) {
        this.onButtonClick = onButtonClick;
    }

    setBranchesDelayed(branches, onFinishFunc) {
        this.branchesToSet = branches;
        this.onFinishFunc = onFinishFunc;
    }

    showBranches() {
        this.dialogPrompt.visible = false;
        if (this.dialogPrompt.currDelay) {
            this.dialogPrompt.currDelay.remove();
        }

        let branches = this.branchesToSet;
        let onFinishFunc = this.onFinishFunc;
        let branchIndexOffset = 0;
        for (let i = 0; i < branches.length; i++) {
            let branchData = branches[i];
            let idx = i - branchIndexOffset;
            let currButton = this.buttons[idx];

            if ((branchData.dependentState && !gameState[branchData.dependentState]) || (branchData.rejectState && gameState[branchData.rejectState])) {
                // hidden option, make sure button is used for next option if it comes
                branchIndexOffset++;
            } else {
                let yPos = gameConsts.halfHeight - (branches.length - 1) * 32 + idx * 64 - branches.length * 12;
                currButton.setPosition(gameConsts.halfWidth + gameVars.cameraPosX, yPos);
                currButton.setText(branchData.text);
                currButton.setDestNode(branchData.targetNode);
                if (branchData.publish) {
                    currButton.setPublishData(branchData.publish, branchData.param);
                }
                if (onFinishFunc) {
                    currButton.setPrevFinishFunc(onFinishFunc);
                }
                currButton.setActive();
            }
        }
        this.branchesToSet = null;
        this.onFinishFunc = null;
        if (branches.length > 0) {
            this.disableClickNext();
        }
    }

    clearBranchOptions() {
        for (let i = 0; i < this.buttons.length; i++) {
            let currButton = this.buttons[i];
            currButton.setInactive();
        }
    }

    clickNextDialog() {
        if (this.delayNext) {
            return;
        }
        this.delayNext = true;
        setTimeout(() => {
            this.delayNext = false;
        }, 70);
        // if (this.dialogButton.getState() === DISABLE) {
        //     return;
        // }
        if (this.typingText) {
            this.finishTypingText();
        } else {
            if (this.onButtonClick) {
                this.onButtonClick();
            }
        }
    }


    setForceTextProgress() {
        this.forceTextProgress = true
    }

    setDoNotRecord() {
        this.doNotRecord = true;
    }

    setKeepLastChat() {
        this.keepLastChat = true;
    }

    setUnclickable() {
        this.disableClickNext();
    }



    setDialogBtnToTop() {
        // buttonManager.bringToTop(this.dialogButton);
        // buttonManager.bringToTop(globalObjects.mutebtn);
    }

    reset() {
        for (let i in this.subscriptions) {
            this.subscriptions[i].unsubscribe();
        }
    }

    destroy() {
        this.reset();
    }
}
