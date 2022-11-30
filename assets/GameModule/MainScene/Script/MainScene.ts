// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from '../../../Script/Helper/AudioManager';
import { Delay, preloadScene } from '../../../Script/Helper/HelperTools';
import AdManager from '../../../Script/Promotion/AdManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainScene extends cc.Component {
    onLoad() {
        cc.debug.setDisplayStats(false);
        AudioManager.getInstance();
        AudioManager.getInstance().add('Music', cc.find('Canvas/SafeArea/Music').getComponent(cc.AudioSource).clip);
    }

    start() {
        AudioManager.getInstance().playMusic('Music', true);
        preloadScene(['LevelScene', 'PlayArea1', 'PlayArea2', 'PlayArea3', 'PlayArea4', 'PlayArea5', 'PlayArea6', 'PlayArea7']);
    }

    async PlayBtnAction(event: cc.Event.EventCustom) {
        let node: cc.Node = event.target;
        node.getComponent(cc.Button).interactable = false;
        AudioManager.getInstance().play('TestButtonClick');
        AdManager.getInstance().requestAds();
        await Delay(0.3);
        cc.director.loadScene('LevelScene');
    }
    SoundOnOff(event: cc.Event.EventCustom) {
        const node: cc.Node = event.target;
        if (cc.audioEngine.getEffectsVolume() == 0 || cc.audioEngine.getMusicVolume() == 0) {
            node.getChildByName('Off').active = false;
            cc.audioEngine.setEffectsVolume(1);
            cc.audioEngine.setMusicVolume(1);
            AudioManager.getInstance().play('TestButtonClick');
        } else {
            node.getChildByName('Off').active = true;
            cc.audioEngine.setEffectsVolume(0);
            cc.audioEngine.setMusicVolume(0);
        }
    }
    // update (dt) {}
}
