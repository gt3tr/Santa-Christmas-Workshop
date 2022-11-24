// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from "../../../Script/Helper/AudioManager";
import { addButtonEvent, Delay } from "../../../Script/Helper/HelperTools";
import AdManager from "../../../Script/Promotion/AdManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayArea4 extends cc.Component {
  @property(cc.Node)
  PanulItem: cc.Node = null;

  @property(cc.Node)
  Items: cc.Node[] = [];

  Count = 3;

  onLoad() {
    AudioManager.getInstance();
  }

  start() {
    this.PanulItem.children.forEach((element) => {
      cc.find("view/" + element.name, element).children.forEach((Btn) => {
        addButtonEvent(Btn, this.node, "PlayArea4", "ButtonClick", false, NaN);
      });
    });
    this.ScrollEntry(this.PanulItem.children[0]);
  }
  async ButtonClick(event: cc.Event.EventCustom) {
    const node: cc.Node = event.target;
    console.log(node.name);
    this.Sound("ClickBtn");
    if (node.getChildByName("Ads")) {
      const val = await AdManager.getInstance().requestRewardAds(node.getChildByName("Ads"));
      if (!val) return;
    }
    node.parent.children.forEach((element) => {
      element.getComponent(cc.Button).interactable = false;
    });
    if (node.parent.name == "Paper") {
      let Pos = this.GetNodePos(this.Items[0], node);
      let picPos = this.Items[0].position;
      cc.tween(this.Items[0])
        .set({ position: Pos, scale: node.scale, active: true })
        .to(0.3, { position: picPos, scale: 1 })
        .call(() => {
          this.Sound("veshi");
          this.ScrollEntry(this.PanulItem.children[1]);
          this.ScrollExit(this.PanulItem.children[0]);
        })
        .start();
    } else if (node.parent.name == "Color") {
      this.Items[0].color = node.getChildByName("1").color;
      this.ScrollEntry(this.PanulItem.children[2]);
      this.ScrollExit(this.PanulItem.children[1]);
    } else if (node.parent.name == "Tree") {
      let Pos = this.GetNodePos(this.Items[1], node);
      let picPos = this.Items[1].position;
      cc.tween(this.Items[1])
        .set({ position: Pos, scale: node.scale, active: true })
        .to(0.3, { position: picPos, scale: 1 })
        .call(() => {
          this.Sound("veshi");
          this.ScrollEntry(this.PanulItem.children[3]);
          this.ScrollExit(this.PanulItem.children[2]);
        })
        .start();
    } else if (node.parent.name == "Frame") {
      let Pos = this.GetNodePos(this.Items[2], node);
      let picPos = this.Items[2].position;
      cc.tween(this.Items[2])
        .set({ position: Pos, scale: node.scale, active: true })
        .to(0.3, { position: picPos, scale: 1 })
        .call(() => {
          this.Sound("veshi");
          this.ScrollEntry(this.PanulItem.children[4]);
          this.ScrollExit(this.PanulItem.children[3]);
        })
        .start();
    } else if (node.parent.name == "Toy") {
      let Pos = this.GetNodePos(this.Items[this.Count], node);
      this.ScrollExit(this.PanulItem.children[4]);
      let picPos = this.Items[this.Count].position;
      cc.tween(this.Items[this.Count])
        .set({ position: Pos, scale: node.scale, active: true })
        .to(0.3, { position: picPos, scale: 1 })
        .call(() => {
          this.Sound("Star");
          this.Count++;
          if (this.Items[this.Count]) {
            node.parent.children.forEach((element) => {
              element.getComponent(cc.Button).interactable = true;
            });
            this.ScrollEntry(this.PanulItem.children[4]);
          } else {
            cc.find("Canvas/SafeArea/Done").active = true;
          }
        })
        .start();
    }
  }
  GetNodePos(SetNode: cc.Node, PosNode: cc.Node) {
    SetNode.getComponent(cc.Sprite).spriteFrame = PosNode.getComponent(cc.Sprite).spriteFrame;
    let Pos = SetNode.parent.convertToNodeSpaceAR(PosNode.parent.convertToWorldSpaceAR(PosNode.position));
    return Pos;
  }
  ScrollEntry(Scroll: cc.Node) {
    if (Scroll) {
      cc.tween(Scroll)
        .to(0.3, { position: cc.v3(0, 210, 0) })
        .call(() => {
          this.Sound("Zvyk zaleta");
        })
        .start();
    }
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
    this.Sound("TestButtonClick");
    AdManager.getInstance().requestAds();
    await Delay(0.3);
    cc.find("Canvas/CompletePopUp").active = true;
  }
  Sound(name: string) {
    AudioManager.getInstance().play(name);
  }
  // update (dt) {}
}
