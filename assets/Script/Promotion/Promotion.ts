// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html

import AudioManager from "../Helper/AudioManager";
import { getRandomNumber } from "../Helper/CocosHelper";
import { GlobalData } from "../Helper/GlobalData";
import { DelayForScene } from "../Helper/HelperTools";
import SessionStorageHelper from "../Helper/SessionStorageHelper";
import AdManager from "./AdManager";

//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
const { ccclass, property } = cc._decorator;

@ccclass
export default class Promotion extends cc.Component {
  static self: Promotion = null;
  // relatedThumbNo: number = 1;
  // LIFE-CYCLE CALLBACKS:
  start() {
    Promotion.self = this;
    let self = this;

    let sceneNm = "game";
    if (cc.director.getScene().name == "MainScene") {
      sceneNm = "mainscreen";
    }
    this.node.on(cc.Node.EventType.TOUCH_END, function (event: cc.Event.EventTouch) {}, this);
  }

  async onReplayClick(event: cc.Event.EventCustom) {
    AudioManager.getInstance().play("button");
    let nds: cc.Node = event.target;
    nds.getComponent(cc.Button).interactable = false;
    SessionStorageHelper.getInstace().removeAllKeys();
    AdManager.getInstance().requestAds();
    await DelayForScene(0.3);
    cc.director.loadScene("MainScene");
  }
}
