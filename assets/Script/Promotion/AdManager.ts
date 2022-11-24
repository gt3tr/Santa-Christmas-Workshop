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
        // @ts-ignore
        if (typeof YYGGames !== 'undefined') {
            // @ts-ignore
            YYGGames.showInterstitial({
                beforeShowAd: () => {
                    AdManager.isAdRunnning = true;
                    me.MuteSound();
                    cc.game.pause();
                },
                afterShowAd: () => {
                    me.onAdComplete();
                },
            });
        }
    }
    isAdRunningOrNot() {
        return AdManager.isAdRunnning;
    }
    async requestRewardAds(lock: cc.Node) {
        return new Promise<boolean>((resolve, reject) => {
            // @ts-ignore
            if (typeof YYGGames !== 'undefined') {
                // @ts-ignore
                const canShowReward = YYGGames.canShowReward(); //return true of flase
                if (canShowReward == false) {
                    console.log('REWARD AD IS YET NOT READY');
                    CocosHelper.getInstance().ShowRewardFailedPopup();
                    resolve(false);
                    return;
                }
                let me = this;
                // @ts-ignore
                YYGGames.showReward({
                    beforeShowAd: () => {
                        AdManager.isAdRunnning = true;
                        me.MuteSound();
                        cc.game.pause();
                    },
                    afterShowAd: () => {
                        me.onAdComplete();
                    },
                    rewardComplete: () => {
                        if (lock) {
                            const str = lock.name;
                            SessionStorageHelper.getInstace().setItem(str, 'true');
                            AdManager.AdString.push(str);
                            lock.removeFromParent();
                        }
                        resolve(true);
                    },
                    rewardDismissed: () => {
                        resolve(false);
                    },
                });
            } else {
                if (CC_DEBUG) {
                    if (lock) {
                        const str = lock.name;
                        SessionStorageHelper.getInstace().setItem(str, 'true');
                        AdManager.AdString.push(str);
                        lock.removeFromParent();
                    }
                    resolve(true);
                    return;
                }
                console.log('sdk not init');
                CocosHelper.getInstance().ShowRewardFailedPopup();
                // if (lock && CC_DEBUG) {
                //     const str = lock.name;
                //     console.log(str);
                //     SessionStorageHelper.getInstace().setItem(str, 'true');
                //     AdManager.AdString.push(str);
                //     lock.removeFromParent();
                // }
                resolve(false);
            }
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
