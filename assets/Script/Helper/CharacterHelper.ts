// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from './AudioManager';
import CharacterConfig from './CharacterConfig';
import { setAnimation } from './HelperTools';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CharacterHelper extends cc.Component {
    @property
    isEnable: boolean = true;

    @property(cc.Node)
    RectNode: cc.Node = null;

    static Tag: number = 1000;
    MoveNode: cc.Node = null;
    DestinationNode: cc.Node = null;

    canMove: boolean = false;
    Rect: cc.Rect = null;

    onLoad() {
        this.Rect = this.RectNode.getBoundingBoxToWorld();
    }
    start() {
        this.OnEvent();
        // this.node.children.forEach((element) => {
        //     element.name = CharacterHelper.Tag.toString();
        //     CharacterHelper.Tag++;
        // });
    }
    OffEvent() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.TouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.TouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.TouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.TouchEnd, this);
    }
    OnEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.TouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.TouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.TouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.TouchEnd, this);
    }
    TouchStart(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
        let location = touch.getLocation();
        if (this.canMove == false) {
            const total = this.node.childrenCount;
            for (let i = total - 1; i >= 0; i--) {
                const node = this.node.children[i];
                if (node && node.active) {
                    let istap = false;
                    AudioManager.getInstance().play('sfx26001016');
                    if (node.childrenCount > 0) {
                        if (node.children[0].getBoundingBoxToWorld().contains(touch.getLocation())) {
                            istap = true;
                        }
                    } else {
                        if (node.getBoundingBoxToWorld().contains(touch.getLocation())) {
                            istap = true;
                        }
                    }
                    if (istap) {
                        this.MoveNode = node;
                        this.MoveNode.zIndex = 2;
                        cc.Tween.stopAllByTarget(this.MoveNode);
                        this.PlayHangingAnimation(this.MoveNode);
                        break;
                    }
                }
            }
        }
    }
    TouchMove(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
        let position2 = touch.getLocation();
        if (this.MoveNode) {
            this.MoveNode.position = cc.v3(this.MoveNode.parent.convertToNodeSpaceAR(position2));
        }
    }
    TouchEnd(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
        if (this.MoveNode) {
            const node = this.MoveNode;
            if (this.Rect.contains(touch.getLocation())) {
                const config = node.getComponent(CharacterConfig).sittingY;
                this.MoveNode.zIndex = 0;
                AudioManager.getInstance().play('sfx26001019');
                cc.tween(node)
                    .to(0.2, { position: cc.v3(this.MoveNode.x, config) })
                    .call(() => {
                        this.PlaySittingAnimation(node);
                        if (node.x < 300 && node.opacity == 255) {
                            cc.game.emit('CharacterEntry');
                            node.opacity = 254;
                        }
                    })
                    .start();
            } else {
                const config = node.getComponent(CharacterConfig).StandingY;
                this.MoveNode.zIndex = 1;
                AudioManager.getInstance().play('sfx26001019');
                cc.tween(node)
                    .to(0.2, { position: cc.v3(this.MoveNode.x, config) })
                    .call(() => {
                        this.StandingIdleAnimation(node);
                        if (node.x < 300) {
                            if (node.opacity == 255) {
                                cc.game.emit('CharacterEntry');
                                node.opacity = 254;
                            }
                        }
                    })
                    .start();
            }
            this.MoveNode = null;
        }
        this.canMove = false;
        this.MoveNode = null;
    }
    update(dt) {}

    PlayHangingAnimation(node: cc.Node) {
        setAnimation(node, node.getComponent(CharacterConfig).HangAnimationName, true);
    }
    StandingIdleAnimation(node: cc.Node) {
        setAnimation(node, node.getComponent(CharacterConfig).IdleAnimationName, true);
    }
    PlaySittingAnimation(node: cc.Node) {
        setAnimation(node, node.getComponent(CharacterConfig).SittingAnimationName, true);
    }
    // update (dt) {}
}
