// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from '../Helper/AudioManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class RewardFailed extends cc.Component {
    safeArea: cc.Node = null;
    onLoad() {}
    protected start(): void {
        cc.game.on('RewarFailed.Open', this.OpenRewardFailed, this);
        cc.game.on('RewarFailed.Close', this.CloseRewardFailed, this);

        this.safeArea = this.node.children[0];
        cc.find('Failclose', this.safeArea).on(cc.Node.EventType.TOUCH_START, this.rewardCloseAction, this);
    }
    rewardCloseAction() {
        AudioManager.getInstance().play('button_common');
        this.CloseRewardFailed();
    }
    OpenRewardFailed() {
        this.safeArea.active = true;
    }
    CloseRewardFailed() {
        if (this.safeArea) this.safeArea.active = false;
    }
    // update (dt) {}
}
