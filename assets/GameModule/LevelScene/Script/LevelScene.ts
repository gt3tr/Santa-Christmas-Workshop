// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from '../../../Script/Helper/AudioManager';
import { GlobalData } from '../../../Script/Helper/GlobalData';
import { Delay } from '../../../Script/Helper/HelperTools';
import AdManager from '../../../Script/Promotion/AdManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelScene extends cc.Component {
    @property(cc.Node)
    ButtonContent: cc.Node = null;

    isClick = false;
    Count = 0;

    onLoad() {
        AudioManager.getInstance();
    }

    start() {
        if (GlobalData.data.flags.ViewName.length == 0) {
            cc.find('Canvas/SafeArea/Scroll').getComponent(cc.ScrollView).scrollToRight(0);
            cc.find('Canvas/SafeArea/Scroll').getComponent(cc.ScrollView).scrollToLeft(5);
        }
        GlobalData.data.flags.ViewName.forEach((element) => {
            this.ButtonContent.getChildByName(element).getComponent(cc.Button).interactable = false;
            this.ButtonContent.getChildByName(element).removeComponent(cc.Animation);
            this.Count++;
        });
        if (this.Count == 7) {
            cc.find('Canvas/Done').active = true;
        }
    }
    async SceneLoad(event: cc.Event.EventCustom) {
        let node: cc.Node = event.target;
        if (this.isClick) return;
        this.isClick = true;
        AudioManager.getInstance().play('ClickBtn');
        node.getComponent(cc.Button).interactable = false;
        AdManager.getInstance().requestAds();
        await Delay(0.3);
        GlobalData.data.flags.ViewName.push(node.name);
        cc.director.loadScene(node.name);
    }

    async DoneButtonClick(event: cc.Event.EventCustom) {
        let node: cc.Node = event.target;
        node.active = false;
        AudioManager.getInstance().play('ClickBtn');
        AdManager.getInstance().requestAds();
        await Delay(0.3);
        cc.find('Canvas/logo').active = false;
        cc.find('Canvas/more').active = false;
        cc.find('Canvas/promotion').position = cc.Vec3.ZERO;
        GlobalData.data.flags.ViewName.splice(0, GlobalData.data.flags.ViewName.length);
    }
    // update (dt) {}
}
