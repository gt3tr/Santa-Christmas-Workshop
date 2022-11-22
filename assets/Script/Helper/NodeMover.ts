// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from "./AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NodeMover extends cc.Component {
  @property(cc.Node)
  intersect: cc.Node = null;

  @property(cc.Sprite)
  progress: cc.Sprite = null;

  onLoad() {}

  start() {}
  RegisterEvents() {
    this.node.on(
      cc.Node.EventType.TOUCH_START,
      () => {
        AudioManager.getInstance().play("sfx26009004");
        const hand = cc.find("Canvas/SafeArea/Page4/Page1/Tab/finger_1");
        if (hand) {
          hand.active = false;
        }
      },
      this
    );
    this.node.on(
      cc.Node.EventType.TOUCH_MOVE,
      (touch: cc.Event.EventTouch) => {
        const pos = touch.getLocation();
        if (pos.x < 514 && pos.x > 284)
          this.node.position = cc.v3(
            this.node.parent.convertToNodeSpaceAR(touch.getLocation()).x,
            this.node.position.y
          );
        if (pos.y < 229 && pos.y > 130)
          this.node.position = cc.v3(
            this.node.position.x,
            this.node.parent.convertToNodeSpaceAR(touch.getLocation()).y
          );

        if (this.node.children[0].opacity < 255) {
          this.node.children[0].opacity += 1;
          this.progress.fillRange = this.node.children[0].opacity / 255;
        } else {
          this.deRegisterEvents();
        }
      },
      this
    );
  }
  deRegisterEvents() {
    cc.tween(this.progress.node.parent)
      .by(0.5, { position: cc.v3(0, 400) }, { easing: cc.easing.backIn })
      .start();
    cc.game.emit("PhotoWaterCleaningDone");
    this.node.removeComponent(NodeMover);
  }
  // update (dt) {}
}
