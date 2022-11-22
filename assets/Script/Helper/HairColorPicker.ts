// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class HairColorPicker extends cc.Component {
    @property(cc.Node)
    wheel: cc.Node = null;

    @property(cc.Component.EventHandler)
    event: cc.Component.EventHandler = null;

    //   prevXY: cc.Vec2 = cc.Vec2.ZERO;

    ang: number = 0; // All angles are expressed in radians
    angStart: number = 0;
    isStart: boolean = false;
    canvasSize: cc.Size = cc.size(800, 504);
    offset: cc.Vec2 = null;
    onLoad() {}

    start() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }
    angXY = (ev: cc.Vec2) => {
        const bcr = this.wheel.getContentSize();
        ev = cc.v2(ev.x + this.canvasSize.width / 2, ev.y + this.canvasSize.height / 2);
        const radius = bcr.width / 2;
        const y = ev.y + this.offset.y - this.node.getBoundingBoxToWorld().yMax + radius * 0.7; // y from center
        const x = ev.x - this.offset.x - this.node.getBoundingBoxToWorld().xMin + radius * 0.7; // x from center
        const angle = Math.atan2(y, x);
        if (x <= 10 && x >= -10 && y >= -10 && y <= 10) {
            return null;
        }
        return angle;
    };
    touchStart(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
        this.offset = cc.v2(this.node.position);
        let mouseXY = cc.find('Canvas').convertToNodeSpaceAR(touch.getLocation());
        this.isStart = true;
        this.angStart = this.angXY(mouseXY) - this.ang;
    }
    touchMove(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
        let mouseXY = cc.find('Canvas').convertToNodeSpaceAR(touch.getLocation());
        if (!this.isStart) return;
        const val = this.angXY(mouseXY);
        if (val) {
            this.ang = val - this.angStart;
            this.wheel.angle = this.get360Angle(cc.misc.radiansToDegrees(this.ang));
        }
    }
    touchEnd(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
        this.isStart = false;
        let angle = Math.floor(this.get360Angle(cc.misc.radiansToDegrees(this.ang)));
        let offset = angle % 30;
        // if (Math.abs(offset) > 15) {
        //   this.wheel.angle = this.wheel.angle + (30 - Math.abs(offset));
        // } else this.wheel.angle = this.wheel.angle - offset;
        if (offset < 15) {
            this.wheel.angle = angle - offset;
        } else {
            this.wheel.angle = angle + (30 - offset);
        }
        // this.ang = this.wheel.angle;
        this.UpdateBrush();
    }
    get360Angle(angle) {
        return this.to_positive_angle(angle);
    }
    to_positive_angle(angle) {
        angle = angle % 360;
        while (angle < 0) {
            angle += 360.0;
        }
        return angle;
    }
    UpdateBrush() {
        let index = Math.abs(this.wheel.angle);
        if (this.event) {
            this.event.emit([index]);
        }
    }
    // update (dt) {}
}
