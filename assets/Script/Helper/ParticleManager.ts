// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ParticleManager extends cc.Component {
  @property(cc.ParticleSystem)
  Particle: cc.ParticleSystem = null;

  @property
  time: number = 0.1;

  @property()
  Times: number = 2;
  onLoad() {}

  start() {
    const tween = cc
      .tween(this.node)
      .delay(this.time)
      .call(() => {
        this.Particle.resetSystem();
      });
    cc.tween(this.node).repeat(this.Times, tween).start();
  }

  // update (dt) {}
}
