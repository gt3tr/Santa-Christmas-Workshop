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
export default class PlayArea6 extends cc.Component {
    @property(cc.Node)
    Panel: cc.Node = null;

    @property(cc.Node)
    SetItem: cc.Node[] = [];

    @property(cc.Node)
    HintItem: cc.Node[] = [];

    @property(cc.Node)
    Loder: cc.Node = null;
    Particle: cc.Node = null;
    Count: number = 0;
    Sprite: string[] = [];

    onLoad() {
        AudioManager.getInstance();
    }

    start() {
        this.Particle = cc.find('Canvas/SafeArea/StarClick');
        this.Panel.children.forEach((element) => {
            cc.find('view/' + element.name, element).children.forEach((Btn) => {
                addButtonEvent(Btn, this.node, 'PlayArea6', 'ButtonClick', false, NaN);
            });
        });
        this.ScrollEntry(this.Panel.children[0]);
    }

    async ButtonClick(event: cc.Event.EventCustom) {
        const node: cc.Node = event.target;
        this.Sound('ClickBtn');
        if (node.getChildByName('Ads')) {
            const val = await AdManager.getInstance().requestRewardAds(node.getChildByName('Ads'));
            if (!val) return;
        }

        if (node && node.parent && node.parent.name == '1') {
            node.parent.children.forEach((element) => {
                element.getComponent(cc.Button).interactable = false;
            });
            let Index = this.Count;
            this.Count++;
            this.SetItem[0].children[Index].active = false;
            this.ScaleItem(this.SetItem[1].children[Index]);
            let Items = this.SetItem[2].children[Index];
            this.ChangeFrame(this.SetItem[2].children[Index], node);
            let Pos = this.GetNodePos(Items, node);
            this.Particle.setPosition(this.Particle.parent.convertToNodeSpaceAR(Items.parent.convertToWorldSpaceAR(Items.position)));
            let picPos = Items.position;
            node.active = false;
            cc.tween(Items)
                .set({ position: Pos, scale: node.scale, active: true })
                .to(0.3, { position: picPos, scale: 1 })
                .call(() => {
                    let Frame = this.SetItem[3].children[Index];
                    Frame.opacity = 0;
                    this.Sprite.push(node.name);
                    this.ChangeFrame(Frame, this.Loder.children[1].getChildByName(node.name));
                    cc.tween(Frame)
                        .call(() => {
                            this.Sound('vudavlivaet');
                        })
                        .to(0.2, { opacity: 255 })
                        .call(() => {
                            this.Particle.getComponent(cc.ParticleSystem).resetSystem();
                        })
                        .start();
                })
                .delay(0.5)
                .to(0.3, { position: Pos, scale: node.scale })
                .call(() => {
                    Items.active = false;
                    node.active = true;
                    if (this.Count == 6) {
                        this.Count = 0;
                        this.ScrollExit(this.Panel.children[0]);
                        this.HintSet(this.HintItem[0]);
                        cc.find('Canvas/SafeArea/MoveTool/Stick').getComponent(cc.Button).interactable = true;
                    } else {
                        node.parent.children.forEach((element) => {
                            element.getComponent(cc.Button).interactable = true;
                        });
                    }
                })
                .start();
        } else if (node.name == 'Stick') {
            node.getComponent(cc.Button).interactable = false;
            this.StopHintSet(this.HintItem[0]);
            let Index = this.Count;
            this.Count++;
            let Frame = this.SetItem[3].children[Index];
            let Pos = this.GetNodePos(node, Frame);
            if (this.Particle && Frame && Frame.parent)
                this.Particle.setPosition(this.Particle.parent.convertToNodeSpaceAR(Frame.parent.convertToWorldSpaceAR(Frame.position)));
            let picPos = node.position;
            cc.tween(node)
                .to(0.5, { position: Pos, angle: -60 })
                .call(() => {
                    this.Sound('PickItem_02');
                    this.ChangeFrame(Frame, this.Loder.children[0].getChildByName(this.Sprite[Index]));
                    //   Frame.getComponent(cc.Sprite).spriteFrame = this.Sprite[Index];
                    this.Particle.getComponent(cc.ParticleSystem).resetSystem();
                    this.Sound('Star');
                })
                .delay(0.3)
                .to(0.5, { position: picPos, angle: -13 })
                .call(() => {
                    if (this.Count == 6) {
                        this.Count = 0;
                        cc.find('Canvas/SafeArea/MoveTool/2').getComponent(cc.Button).interactable = true;
                        this.HintSet(this.HintItem[1]);
                    } else {
                        node.getComponent(cc.Button).interactable = true;
                    }
                })
                .start();
        } else if (node && node.parent && node.parent.name == '3') {
            node.parent.children.forEach((element) => {
                element.getComponent(cc.Button).interactable = false;
            });
            let Index = this.Count;
            this.Count++;
            let Items = this.SetItem[5].children[Index];
            let Pos = this.GetNodePos(Items, node);
            this.ChangeFrame(Items, node);
            let picPos = Items.position;
            cc.tween(Items)
                .set({ position: Pos, scale: node.scale, active: true })
                .to(0.3, { position: picPos, scale: 1 })
                .call(() => {
                    this.Sound('Star');
                    if (this.Count == 6) {
                        this.Count = 0;
                        this.ScrollExit(this.Panel.children[1]);
                        cc.find('Canvas/SafeArea/Done').active = true;
                    } else {
                        node.parent.children.forEach((element) => {
                            element.getComponent(cc.Button).interactable = true;
                        });
                    }
                })
                .start();
        } else if (node.name == '2') {
            node.getComponent(cc.Button).interactable = false;
            this.StopHintSet(this.HintItem[1]);
            let Index = this.Count;
            this.Count++;
            let Frame = this.SetItem[4].children[Index];
            let Pos = this.GetNodePos(node, Frame);
            let picPos = node.position;
            cc.tween(node)
                .to(0.5, { position: Pos, angle: 30 })
                .call(() => {
                    this.node.getComponent(cc.Animation).play('AddCrimAnim');
                    this.Sound('krem');
                })
                .delay(0.5)
                .call(() => {
                    this.Sound('Star');
                    this.ChangeFrame(Frame, this.Loder.children[2].getChildByName(this.Sprite[Index]));
                })
                .to(0.5, { position: picPos, angle: -35 })
                .call(() => {
                    if (this.Count == 6) {
                        this.Count = 0;
                        this.HintSet(this.HintItem[2]);
                        cc.find('Canvas/SafeArea/OhterItems/Ribin').getComponent(cc.Button).interactable = true;
                    } else {
                        node.getComponent(cc.Button).interactable = true;
                    }
                })
                .start();
        } else if (node.name == 'Ribin') {
            node.getComponent(cc.Button).interactable = false;
            this.StopHintSet(this.HintItem[2]);
            this.ScrollEntry(this.Panel.children[1]);
        }
    }

    GetNodePos(SetNode: cc.Node, PosNode: cc.Node) {
        if (SetNode && PosNode.parent) {
            let Pos = SetNode.parent.convertToNodeSpaceAR(PosNode.parent.convertToWorldSpaceAR(PosNode.position));
            return Pos;
        } else return cc.Vec3.ZERO;
    }
    HintSet(Befor: cc.Node) {
        cc.Tween.stopAllByTarget(Befor);
        Befor.opacity = 0;
        cc.tween(Befor)
            .repeatForever(cc.tween(Befor).to(0.5, { opacity: 255 }).to(0.5, { opacity: 0 }))
            .start();
    }
    StopHintSet(After: cc.Node) {
        cc.Tween.stopAllByTarget(After);
        After.opacity = 0;
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
    ChangeFrame(SetNode: cc.Node, PosNode: cc.Node) {
        SetNode.getComponent(cc.Sprite).spriteFrame = PosNode.getComponent(cc.Sprite).spriteFrame;
        return PosNode.getComponent(cc.Sprite).spriteFrame;
    }
    ScaleItem(Scroll: cc.Node) {
        if (Scroll) {
            cc.tween(Scroll).to(0.2, { scale: 0 }).start();
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
