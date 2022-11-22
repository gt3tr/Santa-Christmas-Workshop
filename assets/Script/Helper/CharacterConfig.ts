// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class CharacterConfig extends cc.Component {
    @property
    IdleAnimationName: string = '';

    @property
    HangAnimationName: string = '';

    @property
    SittingAnimationName: string = '';

    @property
    sittingY: number = 0;

    @property
    StandingY: number = 0;

    onLoad() {}

    start() {}

    // update (dt) {}
}
