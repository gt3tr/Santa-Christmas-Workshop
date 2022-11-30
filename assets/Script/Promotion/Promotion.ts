// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html

import { getRandomNumber } from '../Helper/CocosHelper';
import { Delay } from '../Helper/HelperTools';
import AdManager from './AdManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Promotion extends cc.Component {
    static self: Promotion = null;
    start() {
        Promotion.self = this;
        let self = this;
        if (self.node.name == 'promoBack') this.setPromoThumb();

        let sceneNm = 'game';
        if (cc.director.getScene().name == 'MainScene') {
            sceneNm = 'mainscreen';
        }
        this.node.on(
            cc.Node.EventType.TOUCH_END,
            (event: cc.Event.EventTouch) => {
                // @ts-ignore
                if (YYGGames) {
                    {
                        if (self.node.name == 'promoBack') {
                            if (self.node.parent.opacity == 255)
                                // @ts-ignore
                                YYGGames.navigate(
                                    'gameoverscene',
                                    'relatedgames',
                                    // @ts-ignore
                                    YYGGames.forgames[window.relatedThumbNo].id
                                );
                        } else {
                            if (self.node.parent && self.node.parent.name == 'promotion') {
                                // @ts-ignore
                                YYGGames.navigate('gameover', self.node.name);
                            } else {
                                // @ts-ignore
                                YYGGames.navigate(sceneNm, self.node.name);
                            }
                        }
                    }
                }
            },
            this
        );
    }

    setPromoThumb() {
        // @ts-ignore
        if (typeof YYGGames !== 'undefined' && YYGGames.forgames.length > 0) {
            // @ts-ignore
            window.relatedThumbNo = getRandomNumber(
                0,
                // @ts-ignore
                YYGGames.forgames.length - 1
            );
            let me = this;

            // @ts-ignore
            let link = YYGGames.forgames[window.relatedThumbNo].thumb;
            cc.assetManager.loadRemote(link, (err, tex: cc.Texture2D) => {
                if (me.node.parent) {
                    me.node.parent.opacity = 255;
                }
                if (cc.find('tex', this.node)) {
                    cc.find('tex', this.node).getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tex);
                }
            });
        }
    }

    async onReplayClick(event: cc.Event.EventCustom) {
        let nds: cc.Node = event.target;
        nds.getComponent(cc.Button).interactable = false;
        AdManager.getInstance().requestAds();
        await Delay(0.3);
        cc.director.loadScene('LevelScene');
    }
}
