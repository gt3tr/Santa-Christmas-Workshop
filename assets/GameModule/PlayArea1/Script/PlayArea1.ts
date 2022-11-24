// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from "../../../Script/Helper/AudioManager";
import { Delay } from "../../../Script/Helper/HelperTools";
import PixelIntersect from "../../../Script/Helper/PixelIntersect";
import AdManager from "../../../Script/Promotion/AdManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayArea1 extends cc.Component {
  @property(cc.Node)
  Tools: cc.Node[] = [];

  @property(cc.Node)
  IntersectNode: cc.Node = null;

  @property(cc.Node)
  Hint: cc.Node = null;

  IsConfirm: boolean[] = [true, false, false, false, false, false];
  SetColor = 0;
  HintOn = true;
  Bursh: cc.Node = null;
  Loder: cc.Node = null;
  // onLoad () {}

  start() {
    this.node.on(cc.Node.EventType.TOUCH_START, this.TouchStart, this);
    this.getTextur();
  }
  getTextur() {
    this.Bursh = cc.find("Canvas/SafeArya/Tools/Brush/sprite");
    this.Loder = cc.find("Canvas/SafeArya/Loder");
    this.HintSet(this.Hint.children[0]);
  }
  TouchStart(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
    let Location = touch.getLocation();
    if (this.IsConfirm[0] && this.Tools[0].getBoundingBoxToWorld().contains(touch.getLocation())) {
      this.StopHintSet(this.Hint.children[0]);
      this.IsConfirm[0] = false;
      this.IsConfirm[2] = false;
      this.IsConfirm[3] = false;
      this.IsConfirm[4] = false;
      AudioManager.getInstance().play("ClickBtn");
      cc.Tween.stopAllByTarget(this.Tools[4]);
      this.Tools[4].scale = 0.3;
      this.StopHintSet(this.Hint.children[5]);
      cc.find("Canvas/SafeArya/Tools/ShadowB").active = true;
      for (let i = 1; i <= 3; i++) {
        const element = this.Tools[i];
        if (element.children[0].opacity == 0) {
          cc.tween(element.children[0])
            .set({ opacity: 255 })
            .to(0.2, { position: cc.v3(0, 0, 0), angle: 0 })
            .call(() => {
              cc.find("SafeArya/Tools/Shadow" + element.name.charAt(element.name.length - 1), this.node).active = true;
            })
            .start();
        }
      }
      let t = this.node.getComponent(cc.Animation).play("GlueDrop").duration;
      cc.tween(this.Tools[0])
        .delay(t)
        .call(() => {
          AudioManager.getInstance().play("veshi");
          this.IsConfirm[1] = true;
          if (this.HintOn) {
            this.HintSet(this.Hint.children[1]);
            this.HintSet(this.Hint.children[2]);
            this.HintSet(this.Hint.children[3]);
          }
        })
        .start();
    } else if (this.IsConfirm[1]) {
      for (let i = 1; i <= 3; i++) {
        const element = this.Tools[i];
        if (element.getBoundingBoxToWorld().contains(touch.getLocation())) {
          this.StopHintSet(this.Hint.children[1]);
          this.StopHintSet(this.Hint.children[2]);
          this.StopHintSet(this.Hint.children[3]);
          AudioManager.getInstance().play("ClickBtn");
          this.IsConfirm[1] = false;
          let t = this.node.getComponent(cc.Animation).play(element.name).duration;
          cc.tween(element)
            .delay(t)
            .call(() => {
              AudioManager.getInstance().play("veshi");
              this.IsConfirm[0] = true;
              this.IsConfirm[2] = true;
              if (this.HintOn) {
                this.HintSet(this.Hint.children[4]);

                // this.HintOn = false;
              }
            })
            .start();
          break;
        }
      }
    } else if (this.IsConfirm[2] && this.Tools[4].getBoundingBoxToWorld().contains(touch.getLocation())) {
      this.StopHintSet(this.Hint.children[4]);
      if (this.Tools[4].getNumberOfRunningActions() == 0) AudioManager.getInstance().play("ClickBtn");
      cc.find("Canvas/SafeArya/Tools/ShadowB").active = false;

      if (this.HintOn) {
        this.HintSet(this.Hint.children[5]);
        cc.tween(this.Tools[4])
          .repeatForever(cc.tween(this.Tools[4]).to(0.3, { scale: 0.32 }).to(0.3, { scale: 0.3 }))
          .start();
      } else {
        this.Tools[4].scale = 0.34;
      }
      if (this.SetColor != 0) this.IsConfirm[4] = true;
      this.IsConfirm[3] = true;
    } else if (this.IsConfirm[3]) {
      for (let i = 1; i <= 6; i++) {
        const element = this.Tools[5].getChildByName("" + i);
        if (element.getBoundingBoxToWorld().contains(touch.getLocation())) {
          if (this.HintOn) {
            cc.Tween.stopAllByTarget(this.Tools[4]);
            this.Tools[4].scale = 0.34;
            this.StopHintSet(this.Hint.children[5]);
            this.HintOn = false;
          }
          if (this.Tools[4].getNumberOfRunningActions() == 0) {
            AudioManager.getInstance().play("ClickBtn");
            let PickPos = this.Tools[4].position;
            let pos = this.Tools[4].parent.convertToNodeSpaceAR(element.parent.convertToWorldSpaceAR(element.position));

            cc.tween(this.Tools[4])
              .to(0.5, { position: pos })
              .call(() => {
                AudioManager.getInstance().play("veshi");
                this.SetColor = i;
                this.IsConfirm[4] = true;
                console.log(i);
                this.ParticaResetSystem(element);
                this.Bursh.getComponent(cc.Sprite).spriteFrame = cc
                  .find("Canvas/SafeArya/Loder/Color")
                  .getChildByName("" + i)
                  .getComponent(cc.Sprite).spriteFrame;
              })
              .to(0.5, { position: PickPos })
              .start();
          }
        }
      }
    }
    if (this.IsConfirm[4] && this.SetColor != 0) {
      console.log(this.IsConfirm[4]);
      for (let i = 0; i < this.IntersectNode.children.length; i++) {
        const element = this.IntersectNode.children[i];
        if (element.getBoundingBoxToWorld().contains(touch.getLocation())) {
          if (this.HintOn) {
            cc.Tween.stopAllByTarget(this.Tools[4]);
            this.Tools[4].scale = 0.34;
            this.HintOn = false;
          }
          let pos = element.convertToNodeSpaceAR(touch.getLocation());
          let isblink = element.getComponent(PixelIntersect).isIntersect(pos.x, pos.y);
          if (isblink && this.Tools[4].getNumberOfRunningActions() == 0) {
            AudioManager.getInstance().play("ClickBtn");
            let PickPos = this.Tools[4].position;
            let pos = this.Tools[4].parent.convertToNodeSpaceAR(element.parent.convertToWorldSpaceAR(element.position));
            cc.tween(this.Tools[4])
              .to(0.5, { position: pos })
              .call(() => {
                AudioManager.getInstance().play("PickItem_02");
                this.ParticaResetSystem(element);
                element.getComponent(cc.Sprite).spriteFrame = this.Loder.getChildByName(this.SetColor + "")
                  .getChildByName(element.name)
                  .getComponent(cc.Sprite).spriteFrame;
                element.color = cc.Color.WHITE;
                if (!cc.find("Canvas/SafeArya/Done").active) {
                  cc.find("Canvas/SafeArya/Done").active = true;
                }
              })
              .to(0.5, { position: PickPos })
              .start();
          }
        }
      }
    }
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
  ParticaResetSystem(PosNode: cc.Node) {
    const node = cc.find("Canvas/SafeArya/chouchou");
    node.setPosition(node.parent.convertToNodeSpaceAR(PosNode.parent.convertToWorldSpaceAR(PosNode.position)));
    cc.find("Canvas/SafeArya/chouchou").getComponent(cc.ParticleSystem).resetSystem();
  }
  async ViewDoneAction(event: cc.Event.EventCustom) {
    const node: cc.Node = event.target;
    node.getComponent(cc.Button).interactable = false;
    AudioManager.getInstance().play("ClickBtn");
    AdManager.getInstance().requestAds();
    await Delay(0.3);
    cc.find("Canvas/CompletePopUp").active = true;
  }

  // update (dt) {}
}
