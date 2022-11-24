// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Delay, getWorldPosition } from '../../../Script/Helper/HelperTools';
import AdManager from '../../../Script/Promotion/AdManager';
import ColliderCollision from './ColliderCollision';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Playarea5 extends cc.Component {
    @property([cc.Node])
    Panels: cc.Node[] = [];

    @property(cc.Node)
    Brush: cc.Node = null;

    @property(cc.Node)
    ActionNode: cc.Node = null;

    @property(cc.Node)
    Hand: cc.Node = null;

    selectedFlower: number = -1;
    selectedColor: cc.Color = cc.Color.WHITE;

    onLoad() {
        cc.director.getCollisionManager().enabled = true;
    }

    async start() {
        const obj = cc.find('Canvas/SafeArea/ClickItems').getComponent(ColliderCollision);
        cc.find('Canvas/SafeArea/ClickItems').children.forEach((element) => {
            obj.addItem(element);
        });
        this.Hand.active = false;
        await Delay(1);
        this.PanelEntry(0);
    }

    RoundClicked(event: cc.Event.EventCustom) {
        const node: cc.Node = event.target;
        node.parent.children.forEach((element) => {
            element.getComponent(cc.Button).interactable = true;
        });
        node.getComponent(cc.Button).interactable = false;
        this.selectedFlower = Number(node.name);
        this.ToAction(
            node,
            this.ActionNode.convertToNodeSpaceAR(getWorldPosition(node)),
            this.ActionNode.convertToNodeSpaceAR(getWorldPosition(cc.find('Canvas/SafeArea/SetItems/1/' + node.name))),
            0.3,
            1,
            cc.find('Canvas/SafeArea/SetItems/1/' + node.name)
        );
        const obj = cc.find('Canvas/SafeArea/ClickItems').getComponent(ColliderCollision);
        obj.colliderindex = this.selectedFlower - 1;

        this.Hand.position = cc.v3(-261, -9);
        this.Hand.active = true;
    }
    ToAction(node: cc.Node, start: cc.Vec3, end: cc.Vec3, startscale: number, endscale: number, detsnode: cc.Node, isHide: boolean = true) {
        let temp = cc.instantiate(node);
        temp.position = start;
        temp.scale = startscale;
        this.ActionNode.addChild(temp);
        cc.tween(temp)
            .to(0.5, { position: end, scale: endscale })
            .call(() => {
                if (isHide) {
                    detsnode.parent.children.forEach((element) => {
                        element.active = false;
                    });
                }
                detsnode.active = true;
            })
            .removeSelf()
            .start();
    }
    ColorClicked(event: cc.Event.EventCustom) {
        const node: cc.Node = event.target;
        node.parent.children.forEach((element) => {
            element.getComponent(cc.Button).interactable = true;
        });
        node.getComponent(cc.Button).interactable = false;
        console.log('ColorClicked');
        const item = cc.find('Canvas/SafeArea/SetItems/1/' + this.selectedFlower + '/Set');
        item.children.forEach((element) => {
            element.color = node.children[0].color;
        });
        cc.find('Canvas/SafeArea/OtherItems/8').getComponent(cc.Button).interactable = true;

        this.Hand.position = cc.v3(248, 76);
        this.Hand.active = true;
    }
    async DecorationClicked(event: cc.Event.EventCustom) {
        const node: cc.Node = event.target;
        node.parent.children.forEach((element) => {
            element.getComponent(cc.Button).interactable = true;
        });
        this.Hand.active = false;

        node.getComponent(cc.Button).interactable = false;
        // cc.find('Canvas/SafeArea/SetItems/3').children.forEach((element) => {
        //     element.active = false;
        // });
        // cc.find('Canvas/SafeArea/SetItems/3/' + node.name).active = true;
        cc.find('Canvas/SafeArea/SetItems/3/' + node.name + '/1').color = cc.Color.WHITE;
        const node1 = cc.find('Canvas/SafeArea/SetItems/3/' + node.name);
        node1.opacity = 254;

        const temp = cc.instantiate(node1);
        cc.find('Canvas/SafeArea/ClickItems').addChild(temp);
        temp.active = false;
        temp.position = cc.find('Canvas/SafeArea/ClickItems').convertToNodeSpaceAR(getWorldPosition(node1));
        temp.zIndex = 1;
        this.ToAction(
            node,
            this.ActionNode.convertToNodeSpaceAR(getWorldPosition(node)),
            this.ActionNode.convertToNodeSpaceAR(getWorldPosition(temp)),
            0.3,
            1,
            temp,
            false
        );

        const obj = cc.find('Canvas/SafeArea/ClickItems').getComponent(ColliderCollision);
        obj.addItem(temp);
        obj.setActive(true);
        await Delay(0.5);
        this.HidePanel();

        cc.find('Canvas/SafeArea/Done').active = true;

        this.Hand.active = false;
        this.Hand.position = cc.v3(-187, 133);
        this.Hand.active = true;
    }
    ColorSelectionClicked(event: cc.Event.EventCustom) {
        const node: cc.Node = event.target;
        if (this.Brush.opacity != 255) return;
        const pos = node.parent.parent.convertToNodeSpaceAR(getWorldPosition(node)).add(cc.v3(-10, 10));
        cc.tween(this.Brush)
            .to(0.5, { position: pos })
            .to(0.2, { scaleX: -0.8, scaleY: 0.8 })
            .to(0.1, { scaleX: -1, scaleY: 1 })
            .call(() => {
                this.Brush.children[0].color = node.color;
            })
            .to(0.2, { position: cc.v3(-195, 151) })
            .start();
    }

    ShowPanel(event: cc.Event.EventCustom) {
        const node: cc.Node = event.target;
        if (node.name == '4' || this.selectedFlower == -1) {
            this.PanelEntry(0);
        } else if (node.name == '5') {
            this.PanelEntry(1);
            let temp = this.ActionNode.getChildByName('5');
            temp.position = cc.v3(-253, 0);
            temp.active = true;
            const nde = cc.find('Canvas/SafeArea/SetItems/1/' + this.selectedFlower);
            const pos = nde.parent.convertToNodeSpaceAR(getWorldPosition(nde));
            this.Hand.active = false;
            cc.tween(temp)
                .to(0.5, { position: pos })
                .call(() => {
                    this.addEffectToRound();
                })
                .set({ active: false })
                .start();
        } else if (node.name == '8') {
            this.PanelEntry(2);
            this.Hand.active = false;
        }
    }
    addEffectToRound() {
        const hint = cc.find('Canvas/SafeArea/SetItems/1/' + this.selectedFlower + '/Hint');
        const item = cc.find('Canvas/SafeArea/SetItems/1/' + this.selectedFlower + '/Set');
        item.children.forEach((element) => {
            const pos = element.position;
            const angle = element.angle;
            element.position = cc.Vec3.ZERO;
            element.angle = -8;
            element.color = cc.Color.WHITE;
            element.active = true;
            cc.tween(element).to(0.5, { position: pos, angle: angle }).start();
        });
    }
    PanelEntry(index: number) {
        this.Panels.forEach((element) => {
            if (element.opacity == 254) {
                cc.tween(element).to(0.5, { y: 360 }).start();
                element.opacity = 254;
            }
        });
        cc.tween(this.Panels[index]).to(0.5, { y: 218 }).start();
        this.Panels[index].opacity = 254;
    }
    HidePanel() {
        this.Panels.forEach((element) => {
            if (element.opacity == 254) {
                cc.tween(element).to(0.5, { y: 360 }).start();
                element.opacity = 254;
            }
        });
    }
    async ViewDoneAction(event: cc.Event.EventCustom) {
        const node: cc.Node = event.target;
        node.getComponent(cc.Button).interactable = false;
        AdManager.getInstance().requestAds();
        await Delay(0.3);
        cc.director.loadScene('LevelScene');
    }
    // update (dt) {}
}
