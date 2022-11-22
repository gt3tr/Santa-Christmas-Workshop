// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import CocosHelper, { getRegionDragon, getTextureSizeDragon, HideSlot, PrintAllSlot, ShowSlot, TextureArray, URLS } from './CocosHelper';
import { Delay } from './HelperTools';

const { ccclass, property } = cc._decorator;

@ccclass
export default class DragonHelper extends cc.Component {
    @property(cc.Node)
    DrawingTexture: cc.Node = null;

    nativeURL: URLS[] = [];

    CharacterObject: dragonBones.ArmatureDisplay = null;
    OriginalTextureSize: cc.Size = null;

    onLoad() {
        this.CharacterObject = this.node.getComponent(dragonBones.ArmatureDisplay);
        this.OriginalTextureSize = getTextureSizeDragon(this.CharacterObject);
        PrintAllSlot(this.CharacterObject);
        if (this.DrawingTexture) this.loadNativeURL(this.DrawingTexture);
        if (cc.director.getScene().name != 'DressUp') this.resetCharacter();

        // HideSlot(this.CharacterObject, "yankuangL");
        // HideSlot(this.CharacterObject, "yankuangR");
    }
    resetCharacter() {
        HideSlot(this.CharacterObject, 'hair');
        HideSlot(this.CharacterObject, 'glasses');
        HideSlot(this.CharacterObject, 'shoes01');
        HideSlot(this.CharacterObject, 'leg01');
        HideSlot(this.CharacterObject, 'leg02');
        HideSlot(this.CharacterObject, 'leg03');
        HideSlot(this.CharacterObject, 'shoes02');
        HideSlot(this.CharacterObject, 'shoes03');
        HideSlot(this.CharacterObject, 'shoes04');
        HideSlot(this.CharacterObject, 'hat');
        HideSlot(this.CharacterObject, 'dress');
    }
    async setTexture(slotName: string, spriteframeurl: string) {
        if (spriteframeurl == null) {
            await Delay(0.5);
            HideSlot(this.CharacterObject, slotName);
        } else {
            const Texture = CocosHelper.getInstance().getTexture(spriteframeurl);
            if (Texture == null) {
                await CocosHelper.getInstance().loadTexture(this.CharacterObject, this.OriginalTextureSize, this.getURLFromURL(spriteframeurl));
                await Delay(0.5);
                const Texture = CocosHelper.getInstance().getTexture(spriteframeurl);
                this.CharacterObject.armature().getSlot(slotName)._displayData.texture.spriteFrame.setTexture(Texture);
                ShowSlot(this.CharacterObject, slotName);
            } else {
                await Delay(0.5);
                this.CharacterObject.armature().getSlot(slotName)._displayData.texture.spriteFrame.setTexture(Texture);
                ShowSlot(this.CharacterObject, slotName);
            }
        }
    }
    async setTextureWithData(slotName: string, imageData: string) {
        const Texture = CocosHelper.getInstance().UpdateTexture(this.CharacterObject, this.OriginalTextureSize, slotName, imageData);
        this.CharacterObject.armature().getSlot(slotName)._displayData.texture.spriteFrame.setTexture(Texture);
        ShowSlot(this.CharacterObject, slotName);
    }

    start() {
        CocosHelper.getInstance().LoadTextureAsync(this.CharacterObject, this.OriginalTextureSize, this.nativeURL);
    }
    loadTextureWithURL(node: cc.Node) {
        node.children.forEach(async (element) => {
            await CocosHelper.getInstance().loadTexture(this.CharacterObject, this.OriginalTextureSize, this.getURLFromURL(this.getURL(element)));
        });
    }
    playanimation(name: string, times: number) {
        this.CharacterObject.playAnimation(name, times);
    }
    loadNativeURL(node: cc.Node) {
        node.children.forEach((element) => {
            if (element.childrenCount > 0) {
                this.loadNativeURL(element);
            } else {
                if (element.getComponent(cc.Sprite)) {
                    this.nativeURL.push({
                        key: element.parent.name + element.name,
                        slotname: element.parent.name,
                        value: element.getComponent(cc.Sprite).spriteFrame.getTexture().nativeUrl,
                    });
                }
            }
        });
    }
    getURL(node: cc.Node) {
        if (node == null) return null;
        for (let i = 0; i < this.nativeURL.length; i++) {
            if (this.nativeURL[i].key == node.parent.name + node.name) {
                return this.nativeURL[i].value;
            }
        }
        return null;
    }
    getURLFromURL(url: string) {
        for (let i = 0; i < this.nativeURL.length; i++) {
            if (this.nativeURL[i].value == url) {
                return this.nativeURL[i];
            }
        }
        return null;
    }
    // update (dt) {}
}
