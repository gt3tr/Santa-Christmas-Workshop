/**
 * Global store data and share across between prefab globally
 * Add your custom property here
 */
export const GlobalData = {
  data: {
    flags: {
      PanulSprite: [],
      ItemName: [],
      ToyItems: [
        [1, 2, 3, 4, 5, 6],
        [1, 2, 3, 4, 5, 6],
        [1, 2, 3, 4, 5, 6],
      ],
      StickerPath: [],
      PatternData: [],
      TextureData: [],
    },
    isLevelCompleted: [false, false, false, false],
  },
};
export interface TextureKeyPair {
  name: string;
  nativeurl: string;
  img: HTMLImageElement;
}
export async function LoadSticker(src: string, imgele: HTMLImageElement) {
  if (src != null) {
    if (this.checkStickerExist(src, imgele)) return;
    let img = await LoadImage(src);
    UpdateSticker(src, img);
  }
}
export function UpdateSticker(src: string, img: HTMLImageElement) {
  for (let i = 0; i < GlobalData.data.flags.StickerPath.length; i++) {
    if (GlobalData.data.flags.StickerPath[i].nativeurl == src) {
      GlobalData.data.flags.StickerPath[i].img = img;
      break;
    }
  }
}
export function checkStickerExist(src: string, imgele: HTMLImageElement) {
  for (let i = 0; i < GlobalData.data.flags.StickerPath.length; i++) {
    if (GlobalData.data.flags.StickerPath[i].img != null && GlobalData.data.flags.StickerPath[i].nativeurl == src) {
      imgele = GlobalData.data.flags.StickerPath[i].img;
      return true;
    }
  }
  return false;
}

export function getImageElement(src: string) {
  for (let i = 0; i < GlobalData.data.flags.StickerPath.length; i++) {
    if (GlobalData.data.flags.StickerPath[i].img != null && GlobalData.data.flags.StickerPath[i].nativeurl == src) {
      return GlobalData.data.flags.StickerPath[i].img;
    }
  }
  for (let i = 0; i < GlobalData.data.flags.TextureData.length; i++) {
    if (GlobalData.data.flags.TextureData[i].img != null && GlobalData.data.flags.TextureData[i].nativeurl == src) {
      return GlobalData.data.flags.TextureData[i].img;
    }
  }
  return null;
}
export async function LoadTextures(node: cc.Node[]) {
  for (let i = 0; i < node.length; i++) {
    GlobalData.data.flags.TextureData.push({
      name: node[i].name,
      nativeurl: node[i].getComponent(cc.Sprite).spriteFrame.getTexture().nativeUrl,
      img: null,
    });
  }
  for (let i = 0; i < node.length; i++) {
    let img = await LoadImage(GlobalData.data.flags.TextureData[i].nativeurl);
    GlobalData.data.flags.TextureData[i].img = img;
  }
}
export function LoadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    let img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.src = src;
  });
}
