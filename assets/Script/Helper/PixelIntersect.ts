// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
export interface TextureData {
  url: string;
  spriteframe: cc.SpriteFrame;
  ImageData: any;
  HueValue: number;
}
@ccclass
export default class PixelIntersect extends cc.Component {
  nativeUrl: string = null;

  OrigionalTexture: cc.Texture2D = null;
  OrigionalCanvas: any = null;
  OrigionalSpriteFrame: cc.SpriteFrame = null;
  OrigionalContext: any = null;
  OrigionalImgData: any = null;
  image: HTMLImageElement = null;
  imageData: any = null;
  content: cc.Size;
  Stack: TextureData[] = [];
  HueValue: number = 0;
  isGradient: boolean = false;
  color: cc.Color[] = [];
  OriginalImageData: any = null;
  onLoad() {
    this.nativeUrl = this.node.getComponent(cc.Sprite).spriteFrame.getTexture().nativeUrl;
    this.content = this.node.getContentSize();

    this.image = new Image();
    this.OrigionalSpriteFrame = new cc.SpriteFrame();
    this.OrigionalTexture = new cc.Texture2D();
    this.OrigionalCanvas = document.createElement("canvas");
    this.OrigionalContext = this.OrigionalCanvas.getContext("2d");
    this.image.onload = () => {
      this.OrigionalCanvas.width = this.image.width;
      this.OrigionalCanvas.height = this.image.height;
      this.OrigionalContext.drawImage(this.image, 0, 0);
      this.imageData = this.OrigionalContext.getImageData(0, 0, this.image.width, this.image.height);
      this.OriginalImageData = this.OrigionalContext.getImageData(0, 0, this.image.width, this.image.height);
    };
    this.image.src = this.nativeUrl;
  }

  start() {}

  resetHair() {
    if (this.OrigionalContext == null) return;
    if (this.OriginalImageData == null) return;
    this.OrigionalContext.clearRect(0, 0, this.OrigionalCanvas.width, this.OrigionalCanvas.height);
    this.OrigionalContext.putImageData(this.OriginalImageData, 0, 0);
    let imgd1 = this.OrigionalContext.getImageData(0, 0, this.OrigionalCanvas.width, this.OrigionalCanvas.height);
    return this.getFrame(imgd1);
  }
  isIntersect(worldx: number, worldy: number) {
    const pos = cc.v2(worldx + this.content.width / 2, this.content.height - (worldy + this.content.height / 2));
    worldx = parseInt(pos.x.toFixed(0));
    worldy = parseInt(pos.y.toFixed(0));
    if (this.imageData == null) return false;
    const { width, height, data } = this.imageData;
    const startPos = 4 * (worldy * width + worldx);
    if (data.length <= startPos) {
      return false;
    }
    if (data[startPos + 3] && data[startPos + 3] > 0) {
      return true;
    }
    return false;
  }
  private UpdateCanvas(img: HTMLImageElement, val: number) {
    this.OrigionalContext.clearRect(0, 0, this.OrigionalCanvas.width, this.OrigionalCanvas.height);
    this.isGradient = false;

    this.HueValue = val;
    this.OrigionalContext.globalCompositeOperation = "source-over";
    this.OrigionalContext.drawImage(img, 0, 0);

    this.OrigionalContext.globalCompositeOperation = "hue";
    this.OrigionalContext.fillStyle = "hsl(" + val + ",100%, 50%)"; // sat must be > 0, otherwise won't matter
    this.OrigionalContext.fillRect(0, 0, this.OrigionalCanvas.width, this.OrigionalCanvas.height);

    this.OrigionalContext.globalCompositeOperation = "destination-in";
    this.OrigionalContext.drawImage(img, 0, 0);

    this.OrigionalContext.globalCompositeOperation = "source-over";

    let imgd1 = this.OrigionalContext.getImageData(0, 0, img.width, img.height);
    return this.getFrame(imgd1);
  }
  private UpdateGradientCanvas(img: HTMLImageElement, color: cc.Color[]) {
    this.OrigionalContext.clearRect(0, 0, this.OrigionalCanvas.width, this.OrigionalCanvas.height);
    this.isGradient = true;
    this.color = color;
    this.OrigionalContext.globalCompositeOperation = "source-over";
    this.OrigionalContext.drawImage(img, 0, 0);

    this.OrigionalContext.globalCompositeOperation = "hue";
    var gradient = this.OrigionalContext.createLinearGradient(0, 0, img.width, 150);
    // let offset = 1 / color.length;
    let offset: number[] = [];
    offset.push(0.5);
    offset.push(0);
    offset.push(1);
    for (let i = 0; i < color.length; i++) {
      gradient.addColorStop(offset[i], rgbToHex(color[i].r, color[i].g, color[i].b));
    }

    this.OrigionalContext.fillStyle = gradient;
    this.OrigionalContext.fillRect(0, 0, img.width, img.height);

    this.OrigionalContext.globalCompositeOperation = "destination-in";
    this.OrigionalContext.drawImage(img, 0, 0);

    this.OrigionalContext.globalCompositeOperation = "source-over";

    let imgd1 = this.OrigionalContext.getImageData(0, 0, img.width, img.height);
    return this.getFrame(imgd1);
  }
  private getFrame(img: any) {
    const frame = new cc.SpriteFrame();
    const texture = new cc.Texture2D();
    texture.initWithData(
      img,
      cc.Texture2D.PixelFormat.RGBA8888,
      this.OrigionalCanvas.width,
      this.OrigionalCanvas.height
    );
    frame.setTexture(texture);
    return frame;
  }
  public setSpriteFrame(node: cc.Sprite, huevalue: number) {
    let val = this.getStack(this.nativeUrl, huevalue);
    if (val) {
      node.spriteFrame = val;
    }
    const img = new Image();
    img.onload = () => {
      this.OrigionalCanvas.width = img.width;
      this.OrigionalCanvas.height = img.height;
      let frame = this.UpdateCanvas(img, huevalue);
      node.spriteFrame = frame;
      this.addToStack(this.nativeUrl, huevalue, frame, this.OrigionalContext.getImageData(0, 0, img.width, img.height));
    };
    img.src = this.nativeUrl;
  }
  public setSpriteFrameWithGradient(node: cc.Sprite, color: cc.Color[]) {
    const img = new Image();
    img.onload = () => {
      this.OrigionalCanvas.width = img.width;
      this.OrigionalCanvas.height = img.height;
      let frame = this.UpdateGradientCanvas(img, color);
      node.spriteFrame = frame;
      this.addToStack(this.nativeUrl, -1, frame, this.OrigionalContext.getImageData(0, 0, img.width, img.height));
    };
    img.src = this.nativeUrl;
  }
  addToStack(url: string, Hue: number, frame: cc.SpriteFrame, data: any) {
    this.Stack.push({ url: url, spriteframe: frame, HueValue: Hue, ImageData: data });
  }
  getStack(url: string, Hue: number) {
    for (let i = 0; i < this.Stack.length; i++) {
      if (this.Stack[i].url == url && this.Stack[i].HueValue == Hue) {
        return this.Stack[i].spriteframe;
      }
    }
    return null;
  }
  getLastState() {
    if (this.isGradient) {
      return this.color;
    } else {
      return this.HueValue;
    }
  }
  isGradientColor() {
    return this.isGradient;
  }
  // update (dt) {}
}
export function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return cc.color(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16));
}
export function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
