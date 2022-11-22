// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Delay } from './HelperTools';

const { ccclass, property } = cc._decorator;

@ccclass
export default class AutoScroll extends cc.Component {
    @property()
    isAuto: boolean = true;
    @property()
    time: number = 3;

    onLoad() {}

    start() {
        const scroll = this.node.getComponent(cc.ScrollView);
        if (scroll) {
            if (scroll.vertical) {
                scroll.scrollToBottom(this.time, false);
                cc.tween(scroll)
                    .delay(this.time)
                    .call(() => {
                        scroll.scrollToTop(this.time, false);
                    })
                    .start();
            } else {
                scroll.scrollToRight(this.time, false);
                cc.tween(scroll)
                    .delay(this.time)
                    .call(() => {
                        scroll.scrollToLeft(this.time, false);
                    })
                    .start();
            }
        }
    }

    // update (dt) {}
}
