// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import CocosHelper from '../Helper/CocosHelper';
import SessionStorageHelper from '../Helper/SessionStorageHelper';

const { ccclass, property } = cc._decorator;

@ccclass
export default class AdManager extends cc.Component {
    private static instance: AdManager;
    static isAdRunnning: boolean = false;
    isSwitchTab: boolean = false;
    static AdString: string[] = [];

    static getInstance(): AdManager {
        if (!AdManager.instance) {
            AdManager.instance = new AdManager();
        }
        return AdManager.instance;
    }
    requestAds() {
        let me = this;
    }
    isAdRunningOrNot() {
        return AdManager.isAdRunnning;
    }
    async requestRewardAds(lock: cc.Node) {
        return new Promise<boolean>((resolve, reject) => {
            CocosHelper.getInstance().ShowRewardFailedPopup();
            if (lock && CC_DEBUG) {
                const str = lock.name;
                console.log(str);
                SessionStorageHelper.getInstace().setItem(str, 'true');
                AdManager.AdString.push(str);
                lock.removeFromParent();
            }
            resolve(true);
        });
    }
    onAdComplete() {
        AdManager.isAdRunnning = false;
        if (AdManager.getInstance().isSwitchTab == false) {
            CocosHelper.getInstance().gameResume();
        }
    }

    MuteSound() {
        cc.audioEngine.pauseMusic();
        cc.audioEngine.pauseAllEffects();
    }
    StartSound() {
        if (AdManager.getInstance().isSwitchTab) return;
        cc.audioEngine.resumeMusic();
        cc.audioEngine.resumeAllEffects();
    }
    // update (dt) {}
}
