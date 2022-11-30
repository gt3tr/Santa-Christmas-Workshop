// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from '../../../Script/Helper/AudioManager';
import { getRandomNumber } from '../../../Script/Helper/CocosHelper';
import { addButtonEvent, Delay } from '../../../Script/Helper/HelperTools';
import AdManager from '../../../Script/Promotion/AdManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayArea7 extends cc.Component {
    @property(cc.Node)
    Panel: cc.Node = null;

    @property(cc.Node)
    SetItem: cc.Node[] = [];

    @property(cc.Node)
    BtnArr: cc.Node[] = [];

    IsComplet: boolean[] = [false, false, false];
    ColorSetNode: cc.Node = null;
    SelectItem: cc.Node = null;

    onLoad() {
        AudioManager.getInstance();
    }

    start() {
        this.Panel.children.forEach((element) => {
            cc.find('view/' + element.name, element).children.forEach((Btn) => {
                addButtonEvent(Btn, this.node, 'PlayArea7', 'ButtonClick', false, NaN);
            });
        });
        this.ScrollEntry(this.Panel.children[0]);
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
        if (node.parent.name == '1') {
            this.SelectItem = this.SetItem[0].getChildByName(node.name);
            let Pos = this.GetNodePos(this.SelectItem, node);
            let picPos = this.SelectItem.position;
            cc.tween(this.SelectItem)
                .set({ position: Pos, scale: node.scale, active: true })
                .to(0.3, { position: picPos, scale: 1 })
                .call(() => {
                    this.Sound('veshi');
                    this.ScrollExit(this.Panel.children[0]);
                    this.ScrollEntry(this.Panel.children[1]);
                })
                .start();
        } else if (node.parent.name == '2') {
            this.SelectItem.getChildByName('1').color = node.children[0].color;
            this.ScrollExit(this.Panel.children[1]);
            this.ScrollEntry(this.Panel.children[2]);
        } else if (node.parent.name == '3') {
            this.SelectItem = this.SetItem[1].getChildByName(node.name);
            let Pos = this.GetNodePos(this.SelectItem, node);
            let picPos = this.SelectItem.position;
            cc.tween(this.SelectItem)
                .set({ position: Pos, scale: node.scale, active: true })
                .to(0.3, { position: picPos, scale: 1 })
                .call(() => {
                    this.Sound('Star');
                    this.ScrollExit(this.Panel.children[2]);
                    this.BtnArr[this.BtnArr.length - 1].getChildByName('Btn').getComponent(cc.Button).interactable = true;
                    this.HintSet(this.BtnArr[this.BtnArr.length - 1]);
                })
                .start();
        } else if (node.parent.name == '4') {
            let item: cc.Node = cc.instantiate(node);
            // item.removeComponent(cc.Button);
            this.SetItem[2].addChild(item);
            item.getComponent(cc.Button).clickEvents.splice(0, item.getComponent(cc.Button).clickEvents.length);
            addButtonEvent(item, this.node, 'PlayArea7', 'ItemClick', false, NaN, false);
            item.getComponent(cc.Button).interactable = true;
            item.setPosition(item.parent.convertToNodeSpaceAR(node.parent.convertToWorldSpaceAR(node.position)));
            this.SetRendomPositon(item, 0.5);
            item.getComponent(cc.Button).interactable = true;
            this.ScrollExit(this.Panel.children[3]);
            node.parent.children.forEach((element) => {
                element.getComponent(cc.Button).interactable = true;
            });
        } else if (node.parent.name == '5') {
            let item = cc.instantiate(node);
            // item.removeComponent(cc.Button);
            this.SetItem[2].addChild(item);
            item.getComponent(cc.Button).clickEvents.splice(0, item.getComponent(cc.Button).clickEvents.length);
            addButtonEvent(item, this.node, 'PlayArea7', 'ItemClick', false, NaN, false);
            item.setPosition(item.parent.convertToNodeSpaceAR(node.parent.convertToWorldSpaceAR(node.position)));
            this.SetRendomPositon(item, 0.5);
            item.getComponent(cc.Button).interactable = true;
            this.ScrollExit(this.Panel.children[4]);
            node.parent.children.forEach((element) => {
                element.getComponent(cc.Button).interactable = true;
            });
        } else if (node.parent.name == '6') {
            let item = cc.instantiate(node);
            // item.removeComponent(cc.Button);
            this.SetItem[2].addChild(item);
            item.getComponent(cc.Button).clickEvents.splice(0, item.getComponent(cc.Button).clickEvents.length);
            addButtonEvent(item, this.node, 'PlayArea7', 'ItemClick', false, NaN, false);
            item.setPosition(item.parent.convertToNodeSpaceAR(node.parent.convertToWorldSpaceAR(node.position)));
            this.SetRendomPositon(item, 0.5);
            this.ScrollExit(this.Panel.children[5]);
            item.getComponent(cc.Button).interactable = true;
            node.parent.children.forEach((element) => {
                element.getComponent(cc.Button).interactable = true;
            });
        } else if (node.parent.name == '7') {
            if (this.ColorSetNode) {
                this.ColorSetNode.color = node.children[0].color;
            }
            this.ScrollExit(this.Panel.children[6]);
            node.parent.children.forEach((element) => {
                element.getComponent(cc.Button).interactable = true;
            });
        }
    }

    ItemClick(event: cc.Event.EventCustom) {
        const node: cc.Node = event.target;
        this.Sound('ClickBtn');
        if (node.parent.name == 'E4') {
            this.IsComplet[2] = true;
            this.Complete();
            for (let i = 0; i < this.BtnArr.length - 1; i++) {
                this.StopHintSet(this.BtnArr[i]);
            }
            this.SetAllExit(this.Panel, this.Panel.children[3]);
        } else if (node.parent.name == 'E5') {
            this.IsComplet[0] = true;
            this.Complete();
            for (let i = 0; i < this.BtnArr.length - 1; i++) {
                this.StopHintSet(this.BtnArr[i]);
            }
            this.SetAllExit(this.Panel, this.Panel.children[4]);
        } else if (node.parent.name == 'E6') {
            this.IsComplet[1] = true;
            this.Complete();
            for (let i = 0; i < this.BtnArr.length - 1; i++) {
                this.StopHintSet(this.BtnArr[i]);
            }
            this.SetAllExit(this.Panel, this.Panel.children[5]);
        } else if (node.parent.name == 'Pin') {
            node.getComponent(cc.Button).interactable = false;
            this.StopHintSet(this.BtnArr[this.BtnArr.length - 1]);
            let t = this.node.getComponent(cc.Animation).play('PinAnim').duration;
            cc.tween(node)
                .delay(t)
                .call(() => {
                    for (let i = 0; i < this.BtnArr.length - 1; i++) {
                        this.BtnArr[i].getChildByName('Btn').getComponent(cc.Button).interactable = true;
                        this.HintSet(this.BtnArr[i]);
                    }
                })
                .start();
        } else if (node.parent.name == 'SetInstent') {
            console.log('Click node');
            node.getComponent(cc.Button).interactable = true;

            if (node.getChildByName('Color')) {
                this.ColorSetNode = node;
                this.SetAllExit(this.Panel, this.Panel.children[6]);
            } else {
                this.ScrollExit(this.Panel.children[6]);
            }
            node.parent.children.forEach((element) => {
                element.zIndex = 0;
            });
            node.zIndex = 1;
            this.SetRendomPositon(node, 0.3);
        }
    }

    Complete() {
        let Count = 0;
        this.IsComplet.forEach((element) => {
            if (element == true) {
                Count++;
            }
        });
        if (Count >= 2) {
            cc.find('Canvas/SafeArea/Done').active = true;
        }
    }
    GetNodePos(SetNode: cc.Node, PosNode: cc.Node) {
        let Pos = SetNode.parent.convertToNodeSpaceAR(PosNode.parent.convertToWorldSpaceAR(PosNode.position));
        return Pos;
    }
    SetRendomPositon(IntNode: cc.Node, Time: number) {
        IntNode.zIndex = 1;
        let posX = getRandomNumber(-40, 40);
        let posY = getRandomNumber(-40, 40);
        cc.tween(IntNode)
            .to(Time, { position: cc.v3(posX, posY, 0), scale: 0.8 })
            .call(() => {
                // this.Sound("Star");
            })
            .start();
    }
    SetAllExit(Exit, Entry) {
        Exit.children.forEach((element) => {
            if (element) {
                cc.tween(element)
                    .to(0.3, { position: cc.v3(0, 340, 0) })
                    .start();
            }
        });
        if (Entry) {
            cc.tween(Entry)
                .delay(0.3)
                .to(0.3, { position: cc.v3(0, 210, 0) })
                .call(() => {
                    this.Sound('Zvyk zaleta');
                })
                .start();
        }
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
    HintSet(Befor: cc.Node) {
        cc.Tween.stopAllByTarget(Befor);
        Befor.scale = 1;
        cc.tween(Befor)
            .repeatForever(cc.tween(Befor).to(0.5, { scale: 0.8 }).to(0.5, { scale: 1 }))
            .start();
    }
    StopHintSet(After: cc.Node) {
        cc.Tween.stopAllByTarget(After);
        After.scale = 1;
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
