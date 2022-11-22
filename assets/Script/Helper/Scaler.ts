// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Scaler extends cc.Component {
    @property(cc.Node)
    Zoom: cc.Node = null;

    @property(cc.Node)
    Delete: cc.Node = null;

    @property
    Minscale: number = 0.5;

    @property
    Maxscale: number = 1.5;

    rotation: number = 0;
    canMove: boolean = false;
    onLoad() {}

    start() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.TouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.TouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.TouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.TouchEnd, this);
    }
    TouchStart(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
        let location = touch.getLocation();
        if (this.Zoom.getBoundingBoxToWorld().contains(location)) {
            this.canMove = true;
            this.node.opacity = 254;
            let position = this.node.parent.convertToWorldSpaceAR(this.node.position);
            let position2 = touch.getLocation();
            this.rotation = this.node.parent.angle - this.angle(position.x, position.y, position2.x, position2.y);
        } else if (this.Delete.getBoundingBoxToWorld().contains(location)) {
            this.node.parent.removeFromParent();
        }
    }
    TouchMove(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
        if (this.canMove) {
            let location = touch.getLocation();
            let position = this.node.parent.convertToWorldSpaceAR(this.node.position);
            let position2 = touch.getLocation();
            this.node.parent.angle = this.rotation + this.angle(position.x, position.y, position2.x, position2.y);

            let dis = this.getDistance(position.x, position.y, location.x, location.y);
            let scale = dis / 100;
            if (scale > this.Minscale && scale < this.Maxscale) this.node.parent.scale = scale;
        }
    }
    TouchEnd(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
        this.canMove = false;
        this.node.opacity = 255;
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
    update(dt) {
        this.Delete.angle = -this.node.parent.angle;
        this.Delete.scale = this.node.scale > 1 ? 1 - this.node.scale : this.node.scale + (1 - this.node.scale);
        this.Zoom.scale = this.node.scale > 1 ? 1 - this.node.scale : this.node.scale + (1 - this.node.scale);
    }
    showFrame() {
        this.node.active = true;
    }
    hideFrame() {
        this.node.active = false;
    }
}
