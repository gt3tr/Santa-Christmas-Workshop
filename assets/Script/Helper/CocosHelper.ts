// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AdManager from '../Promotion/AdManager';

const { ccclass, property } = cc._decorator;
export interface TextureArray {
    key: string;
    value: cc.Texture2D;
}
export interface URLS {
    key: string;
    slotname: string;
    value: string;
}
@ccclass
export default class CocosHelper extends cc.Component {
    private static instance: CocosHelper;
    private prefab: cc.Prefab[] = [];
    isSwitchTab: boolean = false;
    ItemIndex: number[] = [];
    isLevelDone: boolean[] = [false, false, false, false, false];
    LoadedTexture: TextureArray[] = [];

    Canvas: any = null;
    Context: any = null;
    tempUserTexture: cc.Texture2D = null;
    static getInstance(): CocosHelper {
        if (!CocosHelper.instance) {
            CocosHelper.instance = new CocosHelper();
            CocosHelper.instance.registerEvent();
        }
        return CocosHelper.instance;
    }
    registerEvent() {
        // this.initSDK();
        // this.loadPromotion();

        cc.game.on(cc.game.EVENT_SHOW, CocosHelper.instance.gameResume, CocosHelper.instance);
        cc.game.on(cc.game.EVENT_HIDE, CocosHelper.instance.gamePause, CocosHelper.instance);
        this.Canvas = document.createElement('canvas');
        this.Context = this.Canvas.getContext('2d');
        this.tempUserTexture = new cc.Texture2D();
    }
    reShuffleArray() {
        shuffleArray(this.ItemIndex);
    }
    gameResume() {
        AdManager.getInstance().isSwitchTab = false;
        if (AdManager.getInstance().isAdRunningOrNot()) {
            cc.game.pause();
            AdManager.getInstance().MuteSound();
        } else {
            cc.game.resume();
            AdManager.getInstance().StartSound();
        }
    }
    gamePause() {
        cc.game.pause();
        AdManager.getInstance().isSwitchTab = true;
        AdManager.getInstance().MuteSound();
        console.log('Game Pause');
    }

    loadPromotion() {
        let me = this;
        return new Promise<boolean>((resolve, reject) => {
            if (this.prefab.length == 0) {
                cc.loader.loadResDir('/Prefab', function (error, res: cc.Prefab[], urls: string[]) {
                    if (error) {
                        reject(false);
                    } else {
                        if (me.prefab.length == 0) {
                            for (let prefab of res) {
                                me.prefab.push(prefab);
                            }
                        }
                        resolve(true);
                    }
                });
            } else resolve(true);
        });
    }
    async addLogo(parent: cc.Node, position: cc.Vec3) {
        let me = this;
        if (me.prefab.length == 0) {
            await this.loadPromotion();
        }
        for (let prefab of me.prefab) {
            if (prefab.name == 'logo') {
                let temp = cc.instantiate(prefab);
                parent.addChild(temp);
                temp.position = position;
                break;
            }
        }
    }
    async addMore(parent: cc.Node, position: cc.Vec3) {
        let me = this;
        if (me.prefab.length == 0) {
            await this.loadPromotion();
        }
        for (let prefab of me.prefab) {
            if (prefab.name == 'more') {
                let temp = cc.instantiate(prefab);
                parent.addChild(temp);
                temp.position = position;
                break;
            }
        }
    }
    async addPromotion(parent: cc.Node) {
        let me = this;
        if (me.prefab.length == 0) {
            await this.loadPromotion();
        }
        for (let prefab of me.prefab) {
            if (prefab.name == 'promotion') {
                let temp = cc.instantiate(prefab);
                parent.addChild(temp);
                temp.position = cc.v3(56565, 56565, 5656565);
                break;
            }
        }
    }
    ShowPromotion(node: cc.Node) {
        if (node.getChildByName('promotion')) {
            node.getChildByName('promotion').position = cc.Vec3.ZERO;
            if (node.getChildByName('more')) {
                node.getChildByName('more').active = false;
                console.log('more hide');
            }
            if (node.getChildByName('logo')) node.getChildByName('logo').active = false;
        }
    }
    ShowRewardFailedPopup() {
        if (cc.find('Canvas/RewardFailPopup')) {
            cc.game.emit('RewarFailed.Open');
            return;
        }
        for (let prefab of this.prefab) {
            if (prefab.name == 'RewardFailPopup') {
                let temp = cc.instantiate(prefab);
                cc.find('Canvas').addChild(temp);
                temp.position = cc.Vec3.ZERO;
                temp.active = true;
                break;
            }
        }
    }
    async LoadTexture(CharacterObject: dragonBones.ArmatureDisplay, OriginalTextureSize: cc.Size, slotName: string, spriteframeurl: string) {
        // return new Promise<boolean>((resolve, reject) => {
        if (spriteframeurl) {
            this.Canvas.width = OriginalTextureSize.width;
            this.Canvas.height = OriginalTextureSize.height;
            let img = new Image();
            let region = getRegionDragon(CharacterObject, slotName);
            img.onload = async () => {
                this.Context.clearRect(0, 0, OriginalTextureSize.width, OriginalTextureSize.height);
                this.Context.drawImage(img, region.x, region.y);
                this.tempUserTexture = new cc.Texture2D();
                // console.log(this.Canvas.toDataURL("image/png"));
                this.tempUserTexture.initWithElement(this.Canvas);
                this.LoadedTexture.push({ key: spriteframeurl, value: this.tempUserTexture });
            };
            // resolve(true);
            img.src = spriteframeurl;
        }
        // else resolve(true);
        // });
    }
    UpdateTexture(CharacterObject: dragonBones.ArmatureDisplay, OriginalTextureSize: cc.Size, slotName: string, imgData: any) {
        this.Canvas.width = OriginalTextureSize.width;
        this.Canvas.height = OriginalTextureSize.height;
        let region = getRegionDragon(CharacterObject, slotName);
        this.Context.clearRect(0, 0, OriginalTextureSize.width, OriginalTextureSize.height);
        this.Context.putImageData(imgData, region.x, region.y);
        this.tempUserTexture = new cc.Texture2D();
        this.tempUserTexture.initWithElement(this.Canvas);
        return this.tempUserTexture;
    }
    async LoadTextureAsync(CharacterObject: dragonBones.ArmatureDisplay, OriginalTextureSize: cc.Size, url: URLS[]) {
        console.time('start');
        for (let i = 0; i < url.length; i++) {
            if (this.getTexture(url[i].value) == null) {
                await this.LoadTexture(CharacterObject, OriginalTextureSize, url[i].slotname, url[i].value);
            }
        }
        console.timeEnd('start');

        console.log('Load All');
    }
    getTexture(spriteframeurl: string) {
        for (let i = 0; i < this.LoadedTexture.length; i++) {
            if (this.LoadedTexture[i].key == spriteframeurl) return this.LoadedTexture[i].value;
        }
        return null;
    }
    async loadTexture(CharacterObject: dragonBones.ArmatureDisplay, OriginalTextureSize: cc.Size, url: URLS) {
        if (this.getTexture(url.value) == null) await this.LoadTexture(CharacterObject, OriginalTextureSize, url.slotname, url.value);
    }
    // update (dt) {}
}

export function Padding(name: string, padding: number) {
    while (name.length != padding) {
        name = '0' + name;
    }
    return name;
}
export function getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function getRandomFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
}
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
export function HideSlot(CharacterObject: dragonBones.ArmatureDisplay, name: string) {
    let arm = CharacterObject.armature();
    arm.getSlots().forEach((element) => {
        if (element.name == name) {
            arm.getSlot(name).offset.scaleX = 0;
            // arm.getSlot(name).origin.scaleX = 0;
            // arm.getSlot(name).origin.scaleY = 0;
            // console.log(arm.getSlot(name));

            arm.getSlot(name).invalidUpdate();
        }
    });
}

export function ShowSlot(CharacterObject: dragonBones.ArmatureDisplay, name: string) {
    let arm = CharacterObject.armature();
    arm.getSlots().forEach((element) => {
        if (element.name == name) {
            arm.getSlot(name).offset.scaleX = 1;
            // arm.getSlot(name).offset.scaleY = 1;
            arm.getSlot(name).invalidUpdate();
        }
    });
}
export function PrintAllSlot(CharacterObject: dragonBones.ArmatureDisplay) {
    let arm = CharacterObject.armature();
    arm.getSlots().forEach((element) => {
        console.log(element.name);
    });
}
export function getSlot(CharacterObject: dragonBones.ArmatureDisplay): dragonBones.Slot {
    let arm = CharacterObject.armature();
    return arm.getSlot(name);
}
export function getAnimationList(CharacterObject: dragonBones.ArmatureDisplay): string[] {
    let AnimList: string[] = [];
    let names = CharacterObject.getAnimationNames(CharacterObject.armatureName);
    for (let i = 0; i < names.length; i++) AnimList.push(names[i]);
    return AnimList;
}
export function getAnimationDuration(CharacterObject: dragonBones.ArmatureDisplay, animationname: string) {
    let time = 0;
    if (CharacterObject.armature().animation.animations[animationname])
        time = CharacterObject.armature().animation.animations[animationname].duration;
    if (time) return time;
    else 0;
}
//SPINE
export function PrintAllSlotSpine(CharacterObject: sp.Skeleton) {
    CharacterObject.skeletonData.skeletonJson.slots.forEach((element) => {
        console.log(element.name);
    });
}
export function HideSlotSpine(CharacterObject: sp.Skeleton, name: string) {
    const slot = CharacterObject.findSlot(name);
    if (slot) {
        slot.color = cc.color(slot.color.r, slot.color.g, slot.color.b, 0);
    }
}
export function ShowSlotSpine(CharacterObject: sp.Skeleton, name: string) {
    const slot = CharacterObject.findSlot(name);
    if (slot) {
        slot.color = cc.color(slot.color.r, slot.color.g, slot.color.b, 1);
    }
}
export function PrintAllAnimationNames(CharacterObject: sp.Skeleton) {
    //@ts-ignore
    CharacterObject.skeletonData._skeletonCache.animations.forEach((element) => {
        console.log(element.name);
    });
}
export function getSpineAnimationDuration(CharacterObject: sp.Skeleton, name: string) {
    //@ts-ignore
    let val = CharacterObject.skeletonData._skeletonCache.animations;
    for (let i = 0; i < val.length; i++) {
        let element = val[i];
        if (name === element.name) {
            return element['duration'];
        }
    }
    return 0;
}
export function PrintAllRegion(CharacterObject: sp.Skeleton) {
    //@ts-ignore
    CharacterObject.skeletonData._atlasCache.regions.forEach((element) => {
        console.log(element.name);
    });
}
export function getRegion(CharacterObject: sp.Skeleton, slotname: string) {
    let texturerect: cc.Rect = null;
    //@ts-ignore
    CharacterObject.skeletonData._atlasCache.regions.forEach((element) => {
        if (element.name == slotname) {
            texturerect = cc.rect(element.x, element.y, element.width, element.height);
        }
    });
    return texturerect;
}
export function getTextureSize(CharacterObject: sp.Skeleton) {
    return cc.size(CharacterObject.skeletonData.textures[0].width, CharacterObject.skeletonData.textures[0].height);
}
export function getTextureSizeDragon(CharacterObject: dragonBones.ArmatureDisplay) {
    return cc.size(getTextureWidthDragon(CharacterObject), getTextureHeightDragon(CharacterObject));
}
export function getTextureWidthDragon(CharacterObject: dragonBones.ArmatureDisplay) {
    return CharacterObject.dragonAtlasAsset.texture.width;
}
export function getTextureHeightDragon(CharacterObject: dragonBones.ArmatureDisplay) {
    return CharacterObject.dragonAtlasAsset.texture.height;
}
export function getRegionDragon(CharacterObject: dragonBones.ArmatureDisplay, slotName: string) {
    return CharacterObject.armature().getSlot(slotName)._displayData.texture.region;
}
