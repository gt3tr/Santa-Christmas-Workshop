// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import FloodFill from '../FloodFill/FloodFill';
import AudioManager from './AudioManager';
import CanvasManager from './CanvasManager';
import { getRandomNumber } from './CocosHelper';
import { GlobalData, LoadSticker, TextureKeyPair } from './GlobalData';
import SessionStorageHelper from './SessionStorageHelper';

const { ccclass, property } = cc._decorator;

export enum DRAWING_TYPE {
    NONE = 0,
    DRAWING = 1,
    FILL = 2,
    STICKER = 3,
}
export enum SCENE_TYPE {
    FILL = 1,
    DRAWING = 2,
    FILL_AND_DRAWING = 3,
}
@ccclass
export default class UserDrawing extends cc.Component {
    @property()
    private isActiveDrawing: boolean = true;

    @property(cc.SpriteFrame)
    brush: cc.SpriteFrame = null;

    @property()
    brushsize: number = 30;

    @property()
    isErase: boolean = false;

    @property()
    isRepeatPattern: boolean = false;

    @property(cc.Vec2)
    DrawingOffset: cc.Vec2 = cc.v2(0, 0);

    @property([cc.SpriteFrame])
    DrawingTexture: cc.SpriteFrame[] = [];

    @property(cc.SpriteFrame)
    DefaultTexture: cc.SpriteFrame = null;

    @property(cc.Node)
    OutLineNode: cc.Node = null;

    @property()
    selectedPattern: number = 0;

    @property({ type: cc.Enum(DRAWING_TYPE) })
    DrawingType: DRAWING_TYPE = DRAWING_TYPE.DRAWING;

    @property({ type: cc.Enum(SCENE_TYPE) })
    SceneType: SCENE_TYPE = SCENE_TYPE.DRAWING;

    @property()
    DrawingPercentage: number = 90;

    @property()
    ErasePercentage: number = 10;

    @property(cc.Node)
    Stickers: cc.Node = null;

    @property()
    isEnableColor: boolean = true;

    @property()
    isEnablePatternWithColor: boolean = true;

    @property(cc.Node)
    MoveTool: cc.Node = null;

    @property(cc.Node)
    EraseMoveTool: cc.Node = null;

    UserImage: HTMLImageElement;
    BrushImage: HTMLImageElement;
    UserCanvas: any;
    UserContext: any;
    DrawNode: cc.Node;
    CanvasWidth: number;
    CanvasHeight: number;

    floodfillcolor: FloodFill = null;
    BeganPoint: cc.Vec3 = cc.Vec3.ZERO;

    startx: number = 0;
    starty: number = 0;
    imageData: any = null;
    Maxx: number = 0;
    Maxy: number = 0;
    Minx: number = 1000;
    Miny: number = 1000;
    DefaultTextureIndex: number = 0;

    TextureSize: cc.Size = cc.Size.ZERO;
    SelectedColorID: number = 0;
    CanvasManagerObj: CanvasManager = null;

    selectedFillColor: cc.Color = cc.Color.RED;
    isPickColor: boolean = false;
    StickerScale: number = 1;

    BunchURL: TextureKeyPair[] = [];
    isUpdateDrawing: boolean = false;
    onLoad() {
        this.init();

        this.TextureSize = this.node.getContentSize();
        this.DrawNode = this.node;
        this.CanvasManagerObj = new CanvasManager();
        this.CanvasManagerObj.initWithData(this.node, this);

        if (this.Stickers) {
            this.Stickers.children.forEach((element) => {
                GlobalData.data.flags.StickerPath.push({
                    name: element.name,
                    nativeurl: element.getComponent(cc.Sprite).spriteFrame.getTexture().nativeUrl,
                    img: null,
                });
                LoadSticker(element.getComponent(cc.Sprite).spriteFrame.getTexture().nativeUrl, this.CanvasManagerObj.StickerImage);
            });
        }

        if (this.DefaultTexture instanceof cc.SpriteFrame) {
            this.CanvasManagerObj.LoadTexture(this.DefaultTexture.getTexture().nativeUrl, 0, this.isRepeatPattern);
            this.node.getComponent(cc.Sprite).spriteFrame = this.DefaultTexture;
        } else {
            this.CanvasManagerObj.LoadEmptyTexture(0);
        }
        for (let i = 0; i < this.DrawingTexture.length; i++) {
            this.CanvasManagerObj.LoadTexture(this.DrawingTexture[i].getTexture().nativeUrl, i + 1, this.isRepeatPattern);
        }

        this.setEraseOn(this.isErase);
        this.setPatternIndex(this.selectedPattern);
    }

    start() {
        this.setPatternIndex(this.selectedPattern);
    }
    init() {
        this.DrawNode = this.node;
        this.UserCanvas = document.createElement('canvas');
        this.UserContext = this.UserCanvas.getContext('2d');
        this.UserCanvas.width = this.node.width;
        this.UserCanvas.height = this.node.height;

        this.CanvasWidth = this.node.width;
        this.CanvasHeight = this.node.height;

        this.UserContext.clearRect(0, 0, this.CanvasWidth, this.CanvasHeight);

        this.BrushImage = new Image();
        this.BrushImage.onload = function () {};
        this.BrushImage.src = this.brush.getTexture().nativeUrl;
    }
    StartDrawingAfterLoading() {
        this.setActiveDrawing(this.isActiveDrawing);
    }
    initFloodFill(imgdata) {
        this.floodfillcolor = new FloodFill(imgdata, null);
    }

    UpdateMinMax(position: cc.Vec2) {
        this.startx = Math.floor(position.x);
        this.starty = Math.floor(position.y);

        if (this.Minx > this.startx) {
            this.Minx = this.startx;
        }
        if (this.Maxx < this.startx + this.brushsize) {
            this.Maxx = this.startx + this.brushsize;
        }
        if (this.Miny > this.starty) {
            this.Miny = this.starty;
        }
        if (this.Maxy < this.starty + this.brushsize) {
            this.Maxy = this.starty + this.brushsize;
        }
    }
    touchStart(touch: cc.Event.EventTouch) {
        if (this.DrawingType == DRAWING_TYPE.NONE) return;

        if (this.MoveTool && touch.getLocationY() < 150) {
            this.MoveTool.position = cc.v3(4545455, 455454);
            if (this.EraseMoveTool) this.EraseMoveTool.position = cc.v3(4545455, 455454);
            return;
        }

        let Start = touch.getLocation();
        this.BeganPoint = cc.v3(Start);

        if (this.DrawingType == DRAWING_TYPE.FILL) return;
        if (this.DrawingType == DRAWING_TYPE.STICKER) {
            let pos = this.DrawNode.convertToNodeSpaceAR(touch.getLocation());
            const content1 = this.DrawNode.getContentSize();
            pos = cc.v2(pos.x + content1.width / 2, content1.height - (pos.y + content1.height / 2));
            this.floodfillcolor.fill(this.getRandomColor(), Math.floor(pos.x), Math.floor(pos.y), 0);
            // console.log('AddSticker');
            AudioManager.getInstance().play('particle1');
            this.CanvasManagerObj.AddSticker(Math.floor(pos.x), Math.floor(pos.y), this.StickerScale);
            return;
        }

        if (this.floodfillcolor && this.SceneType != SCENE_TYPE.DRAWING) {
            let pos = this.DrawNode.convertToNodeSpaceAR(touch.getLocation());
            const content1 = this.DrawNode.getContentSize();
            pos = cc.v2(pos.x + content1.width / 2, content1.height - (pos.y + content1.height / 2));
            this.floodfillcolor.fill(this.getRandomColor(), Math.floor(pos.x), Math.floor(pos.y), 0);
        }
        if (this.isEnableColor == false && this.isEnablePatternWithColor == false) {
            this.setPatternIndex(this.selectedPattern);
        }
        this.CanvasManagerObj.updateGradient();

        let End = touch.getPreviousLocation();
        if (this.isErase) {
            Start.x = Start.x;
            End.x = End.x;
            Start.y = Start.y;
            End.y = End.y;
        } else {
            Start.x = Start.x - this.DrawingOffset.x;
            End.x = End.x - this.DrawingOffset.x;
            Start.y = Start.y - this.DrawingOffset.y;
            End.y = End.y - this.DrawingOffset.y;
        }

        let position = this.DrawNode.convertToNodeSpaceAR(Start);
        let content = this.DrawNode.getContentSize();
        Start = cc.v2(position.x + content.width / 2, content.height - (position.y + content.height / 2));

        let position1 = this.DrawNode.convertToNodeSpaceAR(End);
        End = cc.v2(position1.x + content.width / 2, content.height - (position1.y + content.height / 2));

        let Pos = cc.v2(Start.x - this.brushsize / 2, Start.y - this.brushsize / 2);
        if (this.brushsize == 0) {
            this.UserContext.drawImage(this.BrushImage, Pos.x, Pos.y);
        } else {
            this.UserContext.drawImage(this.BrushImage, Pos.x, Pos.y, this.brushsize, this.brushsize);
        }
        this.UpdateMinMax(Pos);
        this.isUpdateDrawing = true;
        this.imageData = this.getImageData();
        if (this.imageData) {
            if (this.SceneType == SCENE_TYPE.FILL_AND_DRAWING)
                this.CanvasManagerObj.UpdatePatternDrawingInBoundry(this.selectedPattern, this.imageData, this.Minx, this.Miny, this.Maxx, this.Maxy);
            else {
                this.CanvasManagerObj.UpdatePatternDrawingUsingPosition(
                    this.selectedPattern,
                    this.imageData,
                    this.Minx,
                    this.Miny,
                    this.Maxx,
                    this.Maxy
                );
            }
        }
        if (!this.isErase && this.MoveTool) {
            this.MoveTool.position = cc.v3(this.MoveTool.parent.convertToNodeSpaceAR(touch.getLocation()));
        } else if (this.isErase && this.EraseMoveTool) {
            this.EraseMoveTool.position = cc.v3(this.EraseMoveTool.parent.convertToNodeSpaceAR(touch.getLocation()));
        }

        this.UserContext.clearRect(0, 0, this.CanvasWidth, this.CanvasHeight);
        this.Minx = this.Maxx;
        this.Miny = this.Maxy;
        this.Maxx = 0;
        this.Maxy = 0;
    }
    touchMove(touch: cc.Event.EventTouch) {
        if (this.DrawingType != DRAWING_TYPE.DRAWING) return;

        let Start = touch.getLocation();
        let End = touch.getPreviousLocation();
        if (this.isErase) {
            Start.x = Start.x;
            End.x = End.x;
            Start.y = Start.y;
            End.y = End.y;
        } else {
            Start.x = Start.x - this.DrawingOffset.x;
            End.x = End.x - this.DrawingOffset.x;
            Start.y = Start.y - this.DrawingOffset.y;
            End.y = End.y - this.DrawingOffset.y;
        }

        let position = this.DrawNode.convertToNodeSpaceAR(Start);
        let content = this.DrawNode.getContentSize();
        Start = cc.v2(position.x + content.width / 2, content.height - (position.y + content.height / 2));

        let position1 = this.DrawNode.convertToNodeSpaceAR(End);
        End = cc.v2(position1.x + content.width / 2, content.height - (position1.y + content.height / 2));

        let distance = Math.sqrt(Math.pow(End.x - Start.x, 2) + Math.pow(End.y - Start.y, 2));

        for (let i = 0; i < distance; i += 3) {
            let difx = End.x - Start.x;
            let dify = End.y - Start.y;
            let delta = i / distance;
            let Pos = cc.v2(Start.x + difx * delta, Start.y + dify * delta);
            Pos = cc.v2(Pos.x - this.brushsize / 2, Pos.y - this.brushsize / 2);

            if (this.brushsize == 0) {
                this.UserContext.drawImage(this.BrushImage, Pos.x, Pos.y);
            } else {
                this.UserContext.drawImage(this.BrushImage, Pos.x, Pos.y, this.brushsize, this.brushsize);
            }
            this.UpdateMinMax(Pos);
        }
        if (!this.isErase && this.MoveTool) {
            this.MoveTool.position = cc.v3(this.MoveTool.parent.convertToNodeSpaceAR(touch.getLocation()));
        } else if (this.isErase && this.EraseMoveTool) {
            this.EraseMoveTool.position = cc.v3(this.EraseMoveTool.parent.convertToNodeSpaceAR(touch.getLocation()));
        }

        this.isUpdateDrawing = true;
        this.imageData = this.getImageData();
        if (this.SceneType == SCENE_TYPE.FILL_AND_DRAWING) {
            this.CanvasManagerObj.UpdatePatternDrawingInBoundry(this.selectedPattern, this.imageData, this.Minx, this.Miny, this.Maxx, this.Maxy);
            this.UserContext.clearRect(0, 0, this.CanvasWidth, this.CanvasHeight);
            this.Minx = this.CanvasWidth;
            this.Miny = this.CanvasHeight;
            this.Maxx = 0;
            this.Maxy = 0;
        } else {
            this.isUpdateDrawing = true;
            //   this.CanvasManagerObj.UpdatePatternDrawingUsingPosition(
            //     this.selectedPattern,
            //     this.imageData,
            //     this.Minx,
            //     this.Miny,
            //     this.Maxx,
            //     this.Maxy
            //   );
        }
    }
    private TouchEnd(touch: cc.Event.EventTouch, event: cc.Event) {
        this.Minx = this.CanvasWidth;
        this.Miny = this.CanvasHeight;
        this.Maxx = 0;
        this.Maxy = 0;
        this.HideTools();
        if (this.DrawingType === DRAWING_TYPE.DRAWING) {
            this.CanvasManagerObj.UpdateContext();
        }

        if (this.DrawingType != DRAWING_TYPE.FILL) return;

        //FILL COLOR
        if (Math.abs(this.BeganPoint.x - touch.getLocationX()) > 10) return;
        if (Math.abs(this.BeganPoint.y - touch.getLocationY()) > 10) return;
        let pos = this.DrawNode.convertToNodeSpaceAR(touch.getLocation());
        const content = this.DrawNode.getContentSize();
        pos = cc.v2(pos.x + content.width / 2, content.height - (pos.y + content.height / 2));
        this.FillPointAt(Math.floor(pos.x), Math.floor(pos.y), this.getRandomColor());
    }
    HideTools() {
        if (this.MoveTool) this.MoveTool.position = cc.v3(56565, 565656);
        if (this.EraseMoveTool) this.EraseMoveTool.position = cc.v3(56565, 565656);
    }
    setMultiColor(state: boolean) {
        this.CanvasManagerObj.isMultiColorOn = state;
    }
    FillPointAt(x: number, y: number, color: cc.Color) {
        if (x < 0 || y < 0 || x >= this.DrawNode.width || y >= this.DrawNode.height) return;
        if (this.floodfillcolor) {
            this.floodfillcolor.isEnabledPattern = false;
            this.floodfillcolor.fill(color, x, y, 0);
            if (this.floodfillcolor.modifiedPixelsCount > 0) {
                AudioManager.getInstance().play('Color fill tap');
                this.CanvasManagerObj.UpdatePatternDrawingFloodFill(
                    this.selectedPattern,
                    this.floodfillcolor.modifiedPixelsIndex,
                    this.floodfillcolor._newColor
                );
            }
        }
    }
    setFillColor(color: cc.Color, isEnabledPattern: boolean) {
        if (
            this.isEnablePatternWithColor == isEnabledPattern &&
            this.selectedFillColor.r == color.r &&
            this.selectedFillColor.g == color.g &&
            this.selectedFillColor.b == color.b
        )
            return;
        this.selectedFillColor = color;
        this.isEnableColor = true;
        this.isEnablePatternWithColor = isEnabledPattern;
        if (this.isEnablePatternWithColor) {
            this.CanvasManagerObj.UpdatePatternWithColor(this.selectedFillColor);
        }
    }
    setActiveDrawing(status: boolean) {
        this.isActiveDrawing = status;
        if (this.isActiveDrawing) {
            cc.find('Canvas').on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
            cc.find('Canvas').on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
            cc.find('Canvas').on(cc.Node.EventType.TOUCH_END, this.TouchEnd, this);
            cc.find('Canvas').on(cc.Node.EventType.TOUCH_CANCEL, this.TouchEnd, this);
        } else {
            cc.find('Canvas').off(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
            cc.find('Canvas').off(cc.Node.EventType.TOUCH_START, this.touchStart, this);
            cc.find('Canvas').off(cc.Node.EventType.TOUCH_END, this.TouchEnd, this);
            cc.find('Canvas').off(cc.Node.EventType.TOUCH_CANCEL, this.TouchEnd, this);
            this.HideTools();
        }
    }
    UndoItems() {
        if (this.CanvasManagerObj.UndoData.length > 0) {
            AudioManager.getInstance().play('eraser');
            this.CanvasManagerObj.UndoData.splice(this.CanvasManagerObj.UndoData.length - 1, 1);
            if (this.CanvasManagerObj.UndoData.length == 0) {
                this.CanvasManagerObj.clearPicture();
            } else {
                let len = this.CanvasManagerObj.UndoData.length - 1;
                const data = this.CanvasManagerObj.UndoData[len].data;
                this.CanvasManagerObj.OriginalData = data;
                this.CanvasManagerObj.setImageData(data);
            }
            if (this.CanvasManagerObj.UndoData.length > 0) return true;
            return false;
        } else {
            return false;
        }
    }
    clearPicture() {
        if (this.CanvasManagerObj) this.CanvasManagerObj.clearPicture();
    }
    FillFullTexture() {
        this.CanvasManagerObj.FillTexture(this.selectedPattern);
    }
    resetPicture() {
        this.CanvasManagerObj.resetTexture();
    }
    setDrawingOffset(x: number, y: number) {
        this.DrawingOffset = cc.v2(x, y);
    }
    private getImageData() {
        return this.UserContext.getImageData(0, 0, this.CanvasWidth, this.CanvasHeight);
    }
    setBrushSize(size: number) {
        this.brushsize = size;
    }
    setEraseOn(isErase: boolean) {
        this.CanvasManagerObj.setEraseOn(isErase);
        this.isErase = isErase;
    }
    setPatternIndex(index: number) {
        if (index == -1) return;
        if (index > this.DrawingTexture.length) {
            alert('Index must spriteframe Range');
            return;
        }
        this.isEnableColor = false; //TEMP NO PATTERN
        this.selectedPattern = index;
        this.CanvasManagerObj.setPatternData(this.selectedPattern);
    }
    getDrawingPercentage() {
        return this.CanvasManagerObj.getDrawingPercentage(this.selectedPattern);
    }
    isToolDone() {
        let per = this.getDrawingPercentage();
        if (this.isErase) {
            if (per <= this.ErasePercentage) return true;
        } else {
            if (per >= this.DrawingPercentage) return true;
        }
        return false;
    }
    getRandomColor() {
        return cc.color(getRandomNumber(10, 255), getRandomNumber(10, 255), getRandomNumber(10, 255));
    }
    setSticker(name: string) {
        this.CanvasManagerObj.setSticker(name);
    }
    addSticker(x, y) {
        this.addSticker(x, y);
    }

    update() {
        if (this.SceneType != SCENE_TYPE.FILL_AND_DRAWING) {
            if (this.isUpdateDrawing) {
                this.isUpdateDrawing = false;
                this.imageData = this.getImageData();
                this.CanvasManagerObj.UpdatePatternDrawingUsingPosition(
                    this.selectedPattern,
                    this.imageData,
                    this.Minx,
                    this.Miny,
                    this.Maxx,
                    this.Maxy
                );
                this.UserContext.clearRect(0, 0, this.CanvasWidth, this.CanvasHeight);
                this.Minx = this.CanvasWidth;
                this.Miny = this.CanvasHeight;
                this.Maxx = 0;
                this.Maxy = 0;
            }
        }
    }

    UpdatePatternColor(color: cc.Color, index: number = -1) {
        if (this.node.name == 'Lips') {
            this.CanvasManagerObj.UpdatePatternWithColorCode(1, color);
        } else {
            if (index == -1) this.CanvasManagerObj.UpdatePatternWithColorCode(this.selectedPattern, color);
            else this.CanvasManagerObj.UpdatePatternWithColorCode(index, color);
        }
    }
    UpdateAllPatternColor(color: cc.Color) {
        for (let i = 0; i < this.DrawingTexture.length; i++) this.CanvasManagerObj.UpdatePatternWithColorCode(i + 1, color);
    }
}
