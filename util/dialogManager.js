class DialogManager {
    constructor() {
        this.reset();
        messageBus.subscribe("gotoDialogNode", this.showDialogNode.bind(this));
    }

    addDialogNode(nodeName, dialog) {
        if (this.dialogNodes[nodeName]) {
            console.warn("Duplicate node: ", nodeName);
            return;
        }
        this.dialogNodes[nodeName] = dialog;
    }

    showDialogNode(nodeName, nodeNum, showLastChat = false) {
        if (showLastChat) {
            messageBus.publish("keepLastChat");
        }
        this.hideDialogNode();
        if (nodeNum) {
            this.dialogNodes[nodeName].showIdx(nodeNum);
            this.currNode = nodeName;
        } else {
            this.dialogNodes[nodeName].show();
            this.currNode = nodeName;
        }
    }

    hideDialogNode() {
        if (this.currNode !== null) {
            this.dialogNodes[this.currNode].hide();
            this.currNode = null;
        }
    }

    reset() {
        this.dialogNodes = {};
        this.currNode = null;
    }
}

dialogManager = new DialogManager();

class DialogNode {
    constructor(dialogData) {
        this.nodeName = null;
        if (!dialogData) {
            dialogData = [{speaker: '(Me):', text: '...'}]
        }
        this.dialogData = dialogData;
        this.currTextIdx = 0;
        this.branches = this.dialogData.branches;
        this.speech = this.dialogData.speech;
    }

    show() {
        this.currTextIdx = 0;
        messageBus.publish("showTalkSpeaker", this.speech[0].speaker);
        messageBus.publish("showTalkText", this.speech[0].text, this.speech[0].instant);
        if (this.speech[0].size) {
            messageBus.publish("updateTextSize", this.speech[0].size);
        }
        if (this.speech[0].forceProgress) {
            messageBus.publish("forceTextProgress");
        }
        if (this.speech[0].doNotRecord) {
            messageBus.publish("doNotRecord");
        }
        if (this.speech[0].unclickable) {
            messageBus.publish("unclickable");
        }
        if (this.speech[0].data) {
            gameState[this.speech[0].data.property] = this.speech[0].data.value;
        }
        if (this.speech[0].face) {
            messageBus.publish("showTalkFace", this.speech[0].face);
        }
        if (this.speech[0].duration) {
            messageBus.publish("setDuration", this.speech[0].duration);
        }
        if (this.speech[0].onStart) {
            this.speech[0].onStart();
        }
        if (this.speech[0].publish) {
            messageBus.publish(this.speech[0].publish, this.speech[0].param);
        }
        if (this.speech.length > 0) {
            messageBus.publish("showNextButton", this.showNext.bind(this));
        }
        if (this.hasBranches() && this.speech.length == 1) {
            this.setupBranches();
        }
    }

    showIdx(idx = 0) {
        this.currTextIdx = idx;
        messageBus.publish("showTalkSpeaker", this.speech[this.currTextIdx].speaker);
        messageBus.publish("showTalkText", this.speech[this.currTextIdx].text, this.speech[this.currTextIdx].instant);
        if (this.speech[this.currTextIdx].size) {
            messageBus.publish("updateTextSize", this.speech[this.currTextIdx].size);
        }
        if (this.speech[this.currTextIdx].forceProgress) {
            messageBus.publish("forceTextProgress");
        }
        if (this.speech[this.currTextIdx].doNotRecord) {
            messageBus.publish("doNotRecord");
        }
        if (this.speech[this.currTextIdx].unclickable) {
            messageBus.publish("unclickable");
        }
        if (this.speech[this.currTextIdx].data) {
            gameState[this.speech[this.currTextIdx].data.property] = this.speech[this.currTextIdx].data.value;
        }
        if (this.speech[this.currTextIdx].face) {
            messageBus.publish("showTalkFace", this.speech[this.currTextIdx].face);
        }
        if (this.speech[this.currTextIdx].publish && this.speech[this.currTextIdx].publish !== "savePoint") {
            messageBus.publish(this.speech[this.currTextIdx].publish, this.speech[this.currTextIdx].param);
        }
        // if (this.speech[this.currTextIdx - 1] && this.speech[this.currTextIdx - 1].onFinish) {
        //     this.speech[this.currTextIdx - 1].onFinish();
        // }
        // TODO Not sure if needed
        // if (this.speech.length > this.currTextIdx) {
        //     messageBus.publish("showNextButton", this.showNext.bind(this));
        // }
        if (!this.speech[this.currTextIdx + 1]) {
            if (this.hasBranches()) {
                this.setupBranches();
            }
        }
    }

    showNext() {
        let resetCurrentTextIdx = false;
        this.currTextIdx++
        let nextDialogSpeech = this.speech[this.currTextIdx];
        if (nextDialogSpeech) {
            if (nextDialogSpeech.dependentState && !gameState[nextDialogSpeech.dependentState]) {
                this.showNext();
                return;
            } else if (nextDialogSpeech.rejectState && gameState[nextDialogSpeech.rejectState]) {
                this.showNext();
                return;
            }
            messageBus.publish("showTalkSpeaker", nextDialogSpeech.speaker);
            messageBus.publish("showTalkText", nextDialogSpeech.text, nextDialogSpeech.instant);
            if (nextDialogSpeech.size) {
                messageBus.publish("updateTextSize", nextDialogSpeech.size);
            }
            if (nextDialogSpeech.forceProgress) {
                messageBus.publish("forceTextProgress");
            }
            if (nextDialogSpeech.doNotRecord) {
                messageBus.publish("doNotRecord");
            }
            if (nextDialogSpeech.unclickable) {
                messageBus.publish("unclickable");
            }
            if (nextDialogSpeech.face) {
                messageBus.publish("showTalkFace", nextDialogSpeech.face);
            }
            if (nextDialogSpeech.onStart) {
                nextDialogSpeech.onStart();
            }
            if (nextDialogSpeech.publish) {
                messageBus.publish(nextDialogSpeech.publish, nextDialogSpeech.param);
            }
            if (nextDialogSpeech.data) {
                if (nextDialogSpeech.data.value !== undefined) {
                    gameState[nextDialogSpeech.data.property] = nextDialogSpeech.data.value;
                } else if (gameState[nextDialogSpeech.data.property] > 0) {
                    gameState[nextDialogSpeech.data.property] += 1;
                } else {
                    gameState[nextDialogSpeech.data.property] = 1;
                }
            }
            if (!this.speech[this.currTextIdx + 1]) {
                if (this.hasBranches()) {
                    resetCurrentTextIdx = true;
                    this.setupBranches(this.speech[this.currTextIdx].onFinish);
                }
            }
        } else if (!this.hasBranches()) {
            messageBus.publish("hideAllDialog");
            messageBus.publish('hideUndoPoint');
        } else {
            resetCurrentTextIdx = true;
        }
        if (this.speech[this.currTextIdx - 1] && this.speech[this.currTextIdx - 1].onFinish) {
            this.speech[this.currTextIdx - 1].onFinish();
        }
        if (resetCurrentTextIdx) {
            this.currTextIdx = 0;
        }
    }

    hide() {
        messageBus.publish("clearBranchOptions");
        messageBus.publish("hideAllDialog");
    }

    setTargetNode(targetNode) {
        this.targetNode = targetNode;
    }

    hasBranches() {
        return this.branches && this.branches.length > 0;
    }

    setupBranches(onFinishFunc) {
        messageBus.publish("setBranches", this.branches, onFinishFunc);
    }
}
/*
class DialogBranch {
    constructor() {
        this.displayText = "...";
        this.pointedNode = null;
    }

    canShow() {
        return true;
    }

    show() {
        messageBus.publish("showBranch", this.displayText, this.click);
    }

    click() {
        messageBus.publish("clearBranchOptions");
        dialogManager.showDialogNode(this.pointedNode.nodeName);
    }
}
*/
