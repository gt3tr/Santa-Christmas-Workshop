// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { getWorldPosition } from '../../../Script/Helper/HelperTools';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ColliderCollision extends cc.Component {
    @property([cc.PolygonCollider])
    collider: cc.PolygonCollider[] = [];

    @property(cc.Node)
    Brush: cc.Node = null;

    @property(cc.Node)
    Hand: cc.Node = null;

    MoveObjects: cc.Node[] = [];
    MoveObjectsScale: number[] = [];
    selectedObjects: cc.Node = null;

    colliderindex: number = 0;
    isselectbrush: boolean = false;
    BrushPosition: cc.Vec3 = null;
    selectedObjectsForHint: cc.Node = null;
    onLoad() {
        this.BrushPosition = this.Brush.position;
    }

    start() {
        cc.game.emit('BrushColorAction', this.BrushColorAction, this);
    }

    setActive(state: boolean) {
        if (state) {
            this.node.on(cc.Node.EventType.TOUCH_START, this.TouchBegan, this);
            this.Brush.getComponent(cc.Button).interactable = true;
        } else {
            this.Brush.getComponent(cc.Button).interactable = false;
            this.node.off(cc.Node.EventType.TOUCH_START, this.TouchBegan, this);
        }
    }
    addItem(node: cc.Node) {
        this.MoveObjects.push(node);
        this.MoveObjectsScale.push(node.scale);
        this.selectedObjectsForHint = node;
    }
    TouchBegan(touch: cc.Event.EventTouch) {
        if (this.isselectbrush == false && this.selectedObjects) {
            if (cc.Intersection.pointInPolygon(touch.getLocation(), this.collider[this.colliderindex].world.points)) {
                console.log('intersect');
                this.stopAll();
                cc.tween(this.selectedObjects)
                    .to(0.3, { position: this.selectedObjects.parent.convertToNodeSpaceAR(cc.v3(touch.getLocation())) })
                    .start();
                this.selectedObjects.opacity = 254;
                this.selectedObjects = null;
                this.isselectbrush = false;
                if (this.Brush.opacity == 255) {
                    cc.Tween.stopAllByTarget(this.Brush);
                    this.Brush.scaleX = -0.9;
                    this.Brush.scaleY = 0.9;
                }
                return;
            } else {
                console.log('not intersect');
            }
        }
        for (let i = this.MoveObjects.length - 1; i >= 0; i--) {
            if (this.MoveObjects[i].getBoundingBoxToWorld().contains(touch.getLocation())) {
                if (this.Brush.opacity == 255 && this.isselectbrush && this.MoveObjects[i].opacity == 254) {
                    const pos = this.Brush.parent.convertToNodeSpaceAR(getWorldPosition(this.MoveObjects[i]));
                    this.Brush.opacity = 254;
                    this.Hand.opacity = 0;
                    this.Hand.scale = 0;
                    cc.tween(this.Brush)
                        .to(0.5, { position: pos })
                        .delay(0.3)
                        .call(() => {
                            if (this.MoveObjects[i].childrenCount == 0) {
                                this.MoveObjects[i].color = this.Brush.children[0].color;
                            } else {
                                this.MoveObjects[i].children[0].color = this.Brush.children[0].color;
                            }
                        })
                        .to(0.5, { position: this.BrushPosition })
                        .call(() => {
                            this.Brush.opacity = 255;
                        })
                        .start();

                    return;
                } else {
                    this.stopAll();
                    const val1 = this.MoveObjectsScale[i];
                    this.isselectbrush = false;
                    if (this.Brush.opacity == 255) {
                        cc.Tween.stopAllByTarget(this.Brush);
                        this.Brush.scaleX = -0.9;
                        this.Brush.scaleY = 0.9;
                    }
                    const tween = cc
                        .tween(this.MoveObjects[i])
                        .to(0.3, { scale: val1 * 0.9 })
                        .to(0.2, { scale: val1 });

                    cc.tween(this.MoveObjects[i]).repeatForever(tween).start();
                    this.selectedObjects = this.MoveObjects[i];
                    this.MoveObjects[i].zIndex = 1;
                    const val = this.MoveObjects[i];
                    this.MoveObjects.splice(i, 1);
                    this.MoveObjects.push(val);

                    this.MoveObjectsScale.splice(i, 1);
                    this.MoveObjectsScale.push(val1);
                    return;
                }
            }
        }
        this.stopAll();
        this.isselectbrush = false;
    }
    stopAll() {
        for (let i = this.MoveObjects.length - 1; i >= 0; i--) {
            if (this.MoveObjects[i].getNumberOfRunningActions() > 0) {
                cc.Tween.stopAllByTarget(this.MoveObjects[i]);
                this.MoveObjects[i].scale = this.MoveObjectsScale[i];
            }
        }
    }
    BrushColorAction(node: cc.Node) {
        console.log(node);
    }
    selectBrushAction(event: cc.Event.EventCustom) {
        const node: cc.Node = event.target;
        if (this.isselectbrush) {
            this.isselectbrush = false;
            cc.Tween.stopAllByTarget(this.Brush);
            this.Brush.scaleX = -0.9;
            this.Brush.scaleY = 0.9;
            console.log('off');
        } else {
            this.stopAll();
            console.log('on');
            this.isselectbrush = true;
            const tween = cc.tween(this.Brush).to(0.3, { scaleX: -0.9, scaleY: 0.9 }).to(0.2, { scaleX: -1, scaleY: 1 });
            cc.tween(this.Brush).repeatForever(tween).start();
            if (this.selectedObjectsForHint) {
                this.Hand.position = this.Hand.parent.convertToNodeSpaceAR(getWorldPosition(this.selectedObjectsForHint));
                this.Hand.active = true;
            }
        }
        // this.isselectbrush = true;
    }
    // update (dt) {}
}
