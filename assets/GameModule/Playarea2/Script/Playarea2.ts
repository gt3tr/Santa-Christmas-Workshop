// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { addButtonEvent } from "../../../Script/Helper/HelperTools";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Playarea2 extends cc.Component {
  @property(cc.Node)
  Panel: cc.Node = null;

  @property(cc.Node)
  SetItem: cc.Node = null;

  SelectItem: cc.Node = null;

  onLoad() {}

  start() {
    this.Panel.children.forEach((element) => {
      cc.find("view/" + element.name, element).children.forEach((Btn) => {
        addButtonEvent(Btn, this.node, "Playarea2", "ButtonClick", false, NaN);
      });
    });
    this.ScrollEntry(this.Panel.children[0]);
  }

  ButtonClick(event: cc.Event.EventCustom) {
    const node: cc.Node = event.target;
    console.log("click");

    node.parent.children.forEach((element) => {
      element.getComponent(cc.Button).interactable = false;
    });
    if (node.parent.name == "1") {
      this.SelectItem = this.SetItem.getChildByName("Item" + node.name);
      this.SetItem.getChildByName("Item" + node.name).active = true;
      let Items = this.SelectItem.getChildByName("1");
      let Pos = this.GetNodePos(Items, node);
      let picPos = Items.position;
      cc.tween(Items)
        .set({ position: Pos, scale: node.scale, active: true })
        .to(0.3, { position: picPos, scale: 1 })
        .call(() => {
          this.ScrollExit(this.Panel.children[0]);
          this.ScrollEntry(this.Panel.children[1]);
        })
        .start();
    } else if (node.parent.name == "2") {
      let Items = this.SelectItem.getChildByName(node.parent.name).getChildByName(node.name);
      let Pos = this.GetNodePos(Items, node);
      let picPos = Items.position;
      cc.tween(Items)
        .set({ position: Pos, scale: node.scale, active: true })
        .to(0.3, { position: picPos, scale: 1 })
        .call(() => {
          this.ScrollExit(this.Panel.children[1]);
          this.ScrollEntry(this.Panel.children[2]);
        })
        .start();
    } else if (node.parent.name == "3") {
      let Items = this.SelectItem.getChildByName(node.parent.name).getChildByName(node.name);
      let Pos = this.GetNodePos(Items, node);
      let picPos = Items.position;
      cc.tween(Items)
        .set({ position: Pos, scale: node.scale, active: true })
        .to(0.3, { position: picPos, scale: 1 })
        .call(() => {
          this.ScrollExit(this.Panel.children[2]);
          this.ScrollEntry(this.Panel.children[3]);
        })
        .start();
    } else if (node.parent.name == "4") {
      let Items = this.SelectItem.getChildByName(node.parent.name).getChildByName(node.name);
      let Pos = this.GetNodePos(Items, node);
      let picPos = Items.position;
      cc.tween(Items)
        .set({ position: Pos, scale: node.scale, active: true })
        .to(0.3, { position: picPos, scale: 1 })
        .call(() => {
          this.ScrollExit(this.Panel.children[3]);
          cc.find("Canvas/SafeArea/Buttons/PinItems/Pin").getComponent(cc.Button).interactable = true;
          this.HintSet(cc.find("Canvas/SafeArea/Buttons/PinItems/PinShadow"));
        })
        .start();
    }
  }
  PinButtons(event: cc.Event.EventCustom) {
    const node: cc.Node = event.target;
    node.getComponent(cc.Button).interactable = false;
    if (node.name == "Pin") {
      this.StopHintSet(cc.find("Canvas/SafeArea/Buttons/PinItems/PinShadow"));
      let t = this.node.getComponent(cc.Animation).play("PinAnimation").duration;
      cc.tween(node)
        .delay(t)
        .call(() => {
          cc.find("Canvas/SafeArea/Buttons/13").getComponent(cc.Button).interactable = true;
          this.HintSet(cc.find("Canvas/SafeArea/Buttons/scene"));
        })
        .start();
    } else if (node.name == "13") {
      this.StopHintSet(cc.find("Canvas/SafeArea/Buttons/scene"));
      let t = this.node.getComponent(cc.Animation).play("SetItemAnim").duration;
      cc.tween(node)
        .delay(t)
        .call(() => {
          this.SelectItem.getChildByName("5").active = true;
          cc.find("Canvas/SafeArea/Buttons/13").getComponent(cc.Button).interactable = true;
          cc.find("Canvas/SafeArea/Done").active = true;
        })
        .start();
    }
  }
  GetNodePos(SetNode: cc.Node, PosNode: cc.Node) {
    let Pos = SetNode.parent.convertToNodeSpaceAR(PosNode.parent.convertToWorldSpaceAR(PosNode.position));
    return Pos;
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
  ScrollEntry(Scroll: cc.Node) {
    if (Scroll) {
      cc.tween(Scroll)
        .to(0.3, { position: cc.v3(0, 205, 0) })
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
  // update (dt) {}
}
