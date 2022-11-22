// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Scaler extends cc.Component {
    rotation: number = 0;
    canMove: boolean = false;

    @property(cc.Node)
    pickNode: cc.Node = null;

    @property(cc.Component.EventHandler)
    StartAction: cc.Component.EventHandler = null;

    @property(cc.Component.EventHandler)
    EndAction: cc.Component.EventHandler = null;

    onLoad() {}

    start() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.TouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.TouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.TouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.TouchEnd, this);
    }
    TouchStart(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
        let location = touch.getLocation();
        if (this.pickNode.getBoundingBoxToWorld().contains(location) && this.pickNode.opacity == 255) {
            this.canMove = true;
            let position = this.node.parent.convertToWorldSpaceAR(this.node.position);
            let position2 = touch.getLocation();
            this.rotation = this.node.parent.angle - this.angle(position.x, position.y, position2.x, position2.y);
            this.StartAction.emit([]);
        }
    }
    TouchMove(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
        if (this.canMove) {
            let location = touch.getLocation();
            let position = this.node.parent.convertToWorldSpaceAR(this.node.position);
            let position2 = touch.getLocation();
            this.node.angle = this.angle(position.x, position.y, position2.x, position2.y);
        }
    }
    TouchEnd(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
        if (this.canMove) {
            this.Rotationreturn();
            this.canMove = false;
        }
    }
    getDistance(x1, y1, x2, y2) {
        let y = x2 - x1;
        let x = y2 - y1;
        return Math.sqrt(x * x + y * y);
    }
    angle(cx, cy, ex, ey) {
        var dy = ey - cy;
        var dx = ex - cx;
        var theta = Math.atan2(dy, dx);
        theta *= 180 / Math.PI;
        if (theta < 0) theta = 360 + theta;
        return theta;
    }
    Rotationreturn() {
        let index = Math.abs(this.node.angle);
        if (this.EndAction) {
            this.EndAction.emit([index]);
        }
    }
}
