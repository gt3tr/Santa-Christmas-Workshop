// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { getRegion, getSlot, getTextureSize, HideSlotSpine, PrintAllRegion } from './CocosHelper';

const { ccclass, property } = cc._decorator;

@ccclass
export default class SpineHelper extends cc.Component {
    @property(cc.SpriteFrame)
    Texture: cc.SpriteFrame = null;

    Skeleton: sp.Skeleton = null;
    OriginalTextureSize: cc.Size = null;

    Canvas: any = null;
    Context: any = null;

    onLoad() {
        this.Skeleton = this.node.getComponent(sp.Skeleton);
        this.OriginalTextureSize = getTextureSize(this.Skeleton);

        this.Canvas = document.createElement('canvas');
        this.Context = this.Canvas.getContext('2d');
        this.Canvas.width = this.OriginalTextureSize.width;
        this.Canvas.height = this.OriginalTextureSize.height;
        let tempUserTexture = new cc.Texture2D();
        let tempUserSpriteFrame = new cc.SpriteFrame();

        let img = new Image();
        let me = this;
        console.log(this.Skeleton);
        PrintAllRegion(this.Skeleton);
        let attachment = this.Skeleton.getAttachment('glasses', 'colthes/glasses/cloth000');
        console.log(attachment.region.renderObject);

        img.onload = function () {
            me.Context.drawImage(img, 0, 0);
            tempUserTexture.initWithData(
                me.Context.getImageData(0, 0, me.OriginalTextureSize.width, me.OriginalTextureSize.height),
                cc.Texture2D.PixelFormat.RGBA8888,
                me.OriginalTextureSize.width,
                me.OriginalTextureSize.height
            );
            tempUserSpriteFrame.setTexture(tempUserTexture);

            // attachment.region.renderObject.texture = new sp.SkeletonTexture(tempUserTexture);
            //   let data = me.Skeleton.skeletonData;
            //   console.log(data, data.textures[0]);
            //   console.log(me.Skeleton.skeletonData._atlasCache.pages[0].texture._texture);

            //   me.Texture.setTexture(tempUserTexture);
            //   me.Skeleton.skeletonData._atlasCache.pages[0].texture._texture = tempUserTexture;
            //   me.Skeleton.skeletonData._atlasCache.pages[0].texture.nativeUrl = tempUserTexture.nativeUrl;
            //   console.log(tempUserSpriteFrame.getTexture());

            //   me.Skeleton.setSkeletonData(data);
            //   me.Skeleton.updateWorldTransform();
            //   console.log(me.Canvas.toDataURL("image/png"));
            me.Skeleton.skeletonData.textures[0].nativeUrl = me.Canvas.toDataURL('image/png');
            // console.log(me.Skeleton.skeletonData.textures[0].nativeUrl);
        };
        img.src = this.Skeleton.skeletonData.textures[0].nativeUrl;
        // img.src = this.Texture.getTexture().nativeUrl;
    }

    start() {}

    ChangeTexture(name: string, textureurl: string) {
        let texturerect = getRegion(this.Skeleton, name);
        const texturesize = getTextureSize(this.Skeleton);
        let img = new Image();
        let me = this;
        let tempUserTexture = new cc.Texture2D();
        img.onload = function () {
            me.Context.drawImage(img, texturerect.x, texturerect.y);
            tempUserTexture.initWithData(
                me.Context.getImageData(0, 0, me.OriginalTextureSize.width, me.OriginalTextureSize.height),
                cc.Texture2D.PixelFormat.RGBA8888,
                me.OriginalTextureSize.width,
                me.OriginalTextureSize.height
            );
            me.Skeleton.skeletonData.textures[0] = tempUserTexture;
            console.log(me.Canvas.toDataURL());
        };
        img.src = textureurl;
    }
    // update (dt) {}
}
export function ChangeAttchment(Character: sp.Skeleton, slotname: string, destslotname: string, attachmentname: string) {
    const val = Character.getAttachment(destslotname, attachmentname);
    // HideSlotSpine(Character, slotname);
    // HideSlotSpine(Character, destslotname);
    const slot = Character.findSlot(slotname);
    // const slot2 = Character.findSlot(destslotname);

    // console.log(val, slot, slot2);
    if (slot && val) slot.setAttachment(val);
}
export function removeAttchment(Character: sp.Skeleton, slotname: string) {
    const slot = Character.findSlot(slotname);
    if (slot) {
        slot.setAttachment(null);
    }
}
