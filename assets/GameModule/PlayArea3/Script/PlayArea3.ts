// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from '../../../Script/Helper/AudioManager';
import { addButtonEvent, Delay } from '../../../Script/Helper/HelperTools';
import AdManager from '../../../Script/Promotion/AdManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayArea3 extends cc.Component {
    @property(cc.Node)
    Panel: cc.Node = null;

    @property(cc.Node)
    SetItem: cc.Node = null;

    Count = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        AudioManager.getInstance();
    }

    start() {
        this.Panel.children.forEach((element) => {
            cc.find('view/' + element.name, element).children.forEach((Btn) => {
                addButtonEvent(Btn, this.node, 'PlayArea3', 'ButtonClick', false, NaN);
            });
        });
        this.ScrollEntry(this.Panel.children[this.Count]);
    }
    async ButtonClick(event: cc.Event.EventCustom) {
        const node: cc.Node = event.target;
        console.log('click');
        this.Sound('ClickBtn');
        if (node.getChildByName('Ads')) {
            const val = await AdManager.getInstance().requestRewardAds(node.getChildByName('Ads'));
            if (!val) return;
        }
        node.parent.children.forEach((element) => {
            element.getComponent(cc.Button).interactable = false;
        });
        if (node.parent.name == '1' || node.parent.name == '2' || node.parent.name == '3' || node.parent.name == '4' || node.parent.name == '5') {
            let Items = this.SetItem.getChildByName(node.parent.name).getChildByName(node.name);
            let Pos = this.GetNodePos(Items, node);
            let picPos = Items.position;

            cc.tween(Items)
                .set({ position: Pos, scale: node.scale, active: true })
                .to(0.3, { position: picPos, scale: 1 })
                .call(() => {
                    this.Sound('veshi');
                    this.SetItem.getChildByName('H' + node.parent.name).active = false;
                    this.ScrollExit(this.Panel.children[this.Count]);
                    if (node.parent.name != '5') {
                        this.ScrollEntry(this.Panel.children[this.Count + 1]);
                        this.Count++;
                    } else {
                        this.HintSet(cc.find('Canvas/SafeArea/GlueItems/GlueHint'));
                        cc.find('Canvas/SafeArea/GlueItems/GlueBotel').getComponent(cc.Button).interactable = true;
                    }
                })
                .start();
        }
        if (node.parent.name == '6') {
            let Items = this.SetItem.getChildByName(node.parent.name).getChildByName(node.name);
            let Pos = this.GetNodePos(Items, node);
            let picPos = Items.position;

            cc.tween(Items)
                .set({ position: Pos, scale: node.scale, active: true })
                .to(0.3, { position: picPos, scale: 1 })
                .call(() => {
                    this.Sound('Star');
                    this.SetItem.getChildByName('H' + node.parent.name).active = false;
                    cc.tween(cc.find('Canvas/SafeArea/GlueItems/Glue')).to(0.1, { opacity: 0 }).start();
                    this.ScrollExit(this.Panel.children[5]);
                })
                .delay(0.2)
                .call(() => {
                    cc.find('Canvas/SafeArea/Done').active = true;
                })
                .start();
        }
    }
    AnimButtonClick(event: cc.Event.EventCustom) {
        const node: cc.Node = event.target;
        console.log('click');
        this.Sound('ClickBtn');
        node.getComponent(cc.Button).interactable = false;
        cc.Tween.stopAllByTarget(cc.find('Canvas/SafeArea/GlueItems/GlueHint'));
        cc.find('Canvas/SafeArea/GlueItems/GlueHint').opacity = 0;
        let t = this.node.getComponent(cc.Animation).play('GlueAnim').duration;
        cc.tween(node)
            .delay(1)
            .call(() => {
                this.Sound('krem');
            })
            .delay(t)
            .call(() => {
                this.ScrollEntry(this.Panel.children[5]);
            })
            .start();
    }
    GetNodePos(SetNode: cc.Node, PosNode: cc.Node) {
        let Pos = SetNode.parent.convertToNodeSpaceAR(PosNode.parent.convertToWorldSpaceAR(PosNode.position));
        return Pos;
    }
    HintSet(Befor: cc.Node) {
        cc.Tween.stopAllByTarget(Befor);
        Befor.opacity = 0;
        cc.tween(Befor)
            .repeatForever(cc.tween(Befor).to(0.5, { opacity: 255 }).to(0.5, { opacity: 0 }))
            .start();
    }
    ScrollEntry(Scroll: cc.Node) {
        if (Scroll) {
            cc.tween(Scroll)
                .to(0.3, { position: cc.v3(0, 210, 0) })
                .call(() => {
                    this.Sound('Zvyk zaleta');
                })
                .start();
        }
    }
    ScrollExit(Scroll: cc.Node) {
        if (Scroll) {
            cc.tween(Scroll)
                .to(0.3, { position: cc.v3(0, 340, 0) })
                .start();
        }
    }
    async ViewDoneAction(event: cc.Event.EventCustom) {
        const node: cc.Node = event.target;
        node.getComponent(cc.Button).interactable = false;
        this.Sound('TestButtonClick');
        AdManager.getInstance().requestAds();
        await Delay(0.3);
        cc.find('Canvas/CompletePopUp').active = true;
    }
    Sound(name: string) {
        AudioManager.getInstance().play(name);
    }
    // update (dt) {}
}
