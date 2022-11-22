// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class StickerManager extends cc.Component {
  @property
  isEnable: boolean = true;

  @property(cc.Node)
  scalerNode: cc.Node = null;

  static Tag: number = 1000;
  MoveNode: cc.Node = null;

  @property
  Minscale: number = 0.5;

  @property
  Maxscale: number = 1.5;

  rotation: number = 0;
  canMove: boolean = false;

  Zoom: cc.Node = null;
  Delete: cc.Node = null;

  DestinationNode: cc.Node = null;
  onLoad() {
    this.Zoom = cc.find("Zoom", this.scalerNode);
    this.Delete = cc.find("Delete", this.scalerNode);
  }
  start() {
    this.OnEvent();
  }
  OffEvent() {
    cc.find("Canvas").off(cc.Node.EventType.TOUCH_START, this.TouchStart, this);
    cc.find("Canvas").off(cc.Node.EventType.TOUCH_MOVE, this.TouchMove, this);
    cc.find("Canvas").off(cc.Node.EventType.TOUCH_END, this.TouchEnd, this);
    cc.find("Canvas").off(cc.Node.EventType.TOUCH_CANCEL, this.TouchEnd, this);
  }
  OnEvent() {
    cc.find("Canvas").on(cc.Node.EventType.TOUCH_START, this.TouchStart, this);
    cc.find("Canvas").on(cc.Node.EventType.TOUCH_MOVE, this.TouchMove, this);
    cc.find("Canvas").on(cc.Node.EventType.TOUCH_END, this.TouchEnd, this);
    cc.find("Canvas").on(cc.Node.EventType.TOUCH_CANCEL, this.TouchEnd, this);
  }
  TouchStart(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
    let location = touch.getLocation();
    if (this.DestinationNode) {
      if (this.Zoom && this.Zoom.getBoundingBoxToWorld().contains(location)) {
        this.canMove = true;
        let position = this.DestinationNode.parent.convertToWorldSpaceAR(this.DestinationNode.position);
        let position2 = touch.getLocation();
        this.rotation = this.DestinationNode.angle - this.angle(position.x, position.y, position2.x, position2.y);
      } else if (this.Delete.getBoundingBoxToWorld().contains(location)) {
        this.DestinationNode.removeFromParent();
        this.hideFrame();
        this.DestinationNode = null;
      }
    }
    if (this.canMove == false) {
      for (let i = StickerManager.Tag; i >= 1000; i--) {
        const node = cc.find(i.toString(), this.node);
        if (node && node.getBoundingBoxToWorld().contains(touch.getLocation())) {
          this.MoveNode = node;
          {
            this.DestinationNode = this.MoveNode;
            this.MoveNode = node;
            this.MoveNode.zIndex = 1;
            this.MoveNode.parent = cc.find("Canvas/StickersMove");
            this.showFrame();
          }
          break;
        }
      }
    }
  }
  TouchMove(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
    let position2 = touch.getLocation();
    if (this.canMove && this.DestinationNode) {
      let position = this.DestinationNode.parent.convertToWorldSpaceAR(this.DestinationNode.position);
      this.DestinationNode.angle = this.rotation + this.angle(position.x, position.y, position2.x, position2.y);
      let dis = this.getDistance(position.x, position.y, position2.x, position2.y);
      let scale = dis / 100;
      if (scale > this.Minscale && scale < this.Maxscale) this.DestinationNode.scale = scale;
    } else if (this.MoveNode) {
      this.MoveNode.position = cc.v3(cc.find("Canvas/StickersMove").convertToNodeSpaceAR(position2));
    }
  }
  TouchEnd(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
    if (this.MoveNode === null && this.canMove == false) {
      this.hideFrame();
    }
    if (this.MoveNode) {
      this.MoveNode.zIndex = 0;
      this.MoveNode.name = StickerManager.Tag.toString();
      this.MoveNode.parent = this.node;
      this.MoveNode = null;
      StickerManager.Tag++;
    }
    this.canMove = false;
    this.MoveNode = null;
    if (cc.find("Canvas/StickersMove").childrenCount > 0) {
      cc.find("Canvas/StickersMove").children.forEach((element) => {
        element.parent = this.node;
      });
    }
  }
  updateIndex(node: cc.Node) {
    node.name = StickerManager.Tag.toString();
    StickerManager.Tag++;
    this.showFrame();
    this.DestinationNode = node;
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
    if (this.DestinationNode) this.scalerNode.position = this.DestinationNode.position;
    if (this.DestinationNode) {
      const scale =
        this.scalerNode.scale > 1
          ? 1 - (this.scalerNode.scale - 1)
          : this.DestinationNode.scale + (1 - this.scalerNode.scale);
      this.Delete.scale = scale;
      this.Zoom.scale = scale;
      this.scalerNode.scale = this.DestinationNode.scale;
      this.scalerNode.angle = this.DestinationNode.angle;
      this.Delete.angle = -this.scalerNode.angle;
    }
  }
  showFrame() {
    this.scalerNode.active = true;
  }
  hideFrame() {
    this.scalerNode.active = false;
    this.DestinationNode = null;
  }
  // update (dt) {}
}
