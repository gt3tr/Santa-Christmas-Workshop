// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from "../../../Script/Helper/AudioManager";
import { Delay } from "../../../Script/Helper/HelperTools";
import AdManager from "../../../Script/Promotion/AdManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CompletePopUp extends cc.Component {
  // onLoad () {}

  start() {}

  async ButtonClick(event: cc.Event.EventCustom) {
    const node: cc.Node = event.target;
    AudioManager.getInstance().play("TestButtonClick");
    AdManager.getInstance().requestAds();
    node.getComponent(cc.Button).interactable = false;
    await Delay(0.3);
    switch (node.name) {
      case "Done":
        cc.director.loadScene("LevelScene");
        break;
    }
  }
  // update (dt) {}
}
