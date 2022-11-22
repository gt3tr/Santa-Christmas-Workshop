// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { shuffleArray } from './CocosHelper';
import { getImageElement, GlobalData } from './GlobalData';
import { rgbToHex } from './HelperTools';
import UserDrawing, { DRAWING_TYPE, SCENE_TYPE } from './UserDrawing';
const { ccclass, property } = cc._decorator;
interface CanvasData {
    UserCanvas: any;
    UserContext: any;
    DrawNode: cc.Node;
    CanvasWidth: number;
    CanvasHeight: number;
    ID: number;
}
interface PatternData {
    PatternData: any;
    Image: HTMLImageElement;
    ID: number;
}
export interface UndoTextureData {
    data: any;
}
@ccclass
export default class CanvasManager extends cc.Component {
    canvasdata: CanvasData = null;
    PatternData: PatternData[] = [];
    UserImage: HTMLImageElement;
    DefaultData: any = null;
    FillData: any = null;
    CanvasWidth: number = 0;
    CanvasHeight: number = 0;
    IsEraseData: boolean = false;
    userDrawingObj: UserDrawing = null;
    filterdata: any = null;
    DefaultImage: HTMLImageElement = null;
    OriginalData: any = null;
    SelectedPatternData: any = null;

    sframe: cc.SpriteFrame = null;
    texture: cc.Texture2D = null;
    defaulturl: string = null;

    TextureUserCanvas: any = null;
    TextureUserContext: any = null;

    DefaultTextureUserCanvas: any = null;
    DefaultTextureUserContext: any = null;

    GradientCanvas: any = null;
    GradientContext: any = null;
    GradientImageData: any = null;

    isDefault: boolean = false;

    UndoData: UndoTextureData[] = [];

    MaskUserCanvas: any;
    MaskUserContext: any;
    MaskImageData: any = null;
    maskframe: cc.SpriteFrame = null;
    masktexture: cc.Texture2D = null;

    StickerImage: HTMLImageElement = null;
    PatternColorData: any = null;
    PatternImage: HTMLImageElement = null;
    selectedPData: any = null;

    StickerCanvas: any;
    StickerContext: any;
    isMultiColorOn: boolean = false;

    colors: string[] = ['red', 'orange', 'yellow', 'lime', 'green', 'teal', 'blue', 'purple'];
    StartGradientIndex: number = 0;
    isGradientEnable: boolean = false;
    initWithData(DrawingPad: cc.Node, userdraw: UserDrawing) {
        this.CanvasWidth = DrawingPad.width;
        this.CanvasHeight = DrawingPad.height;
        let UserCanvas = document.createElement('canvas');
        let UserContext = UserCanvas.getContext('2d');
        UserCanvas.width = this.CanvasWidth;
        UserCanvas.height = this.CanvasHeight;

        this.MaskUserCanvas = document.createElement('canvas');
        this.MaskUserContext = this.MaskUserCanvas.getContext('2d');
        this.MaskUserCanvas.width = this.CanvasWidth;
        this.MaskUserCanvas.height = this.CanvasHeight;
        this.MaskUserContext.fillRect(0, 0, this.CanvasWidth, this.CanvasHeight);
        this.MaskImageData = this.MaskUserContext.getImageData(0, 0, this.CanvasWidth, this.CanvasHeight);

        this.StickerCanvas = document.createElement('canvas');
        this.StickerContext = this.StickerCanvas.getContext('2d');
        this.StickerCanvas.width = this.CanvasWidth;
        this.StickerCanvas.height = this.CanvasHeight;

        if (this.isGradientEnable) {
            this.GradientCanvas = document.createElement('canvas');
            this.GradientContext = this.GradientCanvas.getContext('2d');
            this.GradientCanvas.width = 800;
            this.GradientCanvas.height = 504;
        }

        this.canvasdata = {
            UserCanvas: UserCanvas,
            UserContext: UserContext,
            DrawNode: DrawingPad,
            CanvasWidth: this.CanvasWidth,
            CanvasHeight: this.CanvasHeight,
            ID: 0,
        };
        this.userDrawingObj = userdraw;
        this.DefaultImage = new Image();

        this.sframe = new cc.SpriteFrame();
        this.texture = new cc.Texture2D();
        this.maskframe = new cc.SpriteFrame();
        this.masktexture = new cc.Texture2D();

        this.TextureUserCanvas = document.createElement('canvas');
        this.TextureUserContext = UserCanvas.getContext('2d');
        this.DefaultTextureUserCanvas = document.createElement('canvas');
        this.DefaultTextureUserContext = UserCanvas.getContext('2d');

        this.gradient();
    }
    gradient() {
        if (!this.isGradientEnable) return;
        let index: number[] = [];
        for (let i = 0; i < this.colors.length; i++) index.push(i);
        shuffleArray(index);
        const size = this.canvasdata.DrawNode.getContentSize();
        this.GradientContext.clearRect(0, 0, size.width, size.height);
        var gradient = this.GradientContext.createLinearGradient(0, 0, size.width, size.height);
        for (let i = 0; i < this.colors.length; i++) {
            gradient.addColorStop(i / this.colors.length, this.colors[index[i]]);
        }
        this.GradientContext.fillStyle = gradient;
        this.GradientContext.fillRect(0, 0, size.width, size.height);
        this.GradientImageData = this.GradientContext.getImageData(0, 0, size.width, size.height);
        this.StartGradientIndex = 0;
    }
    updateGradient() {
        if (!this.isGradientEnable) return;
        if (this.isMultiColorOn) {
            this.gradient();
        }
    }
    UpdateTexture() {
        let data = this.getCanvasData();
        // this.texture.initWithElement(this.canvasdata.UserCanvas);
        this.texture.initWithData(this.OriginalData, cc.Texture2D.PixelFormat.RGBA8888, this.CanvasWidth, this.CanvasHeight);
        // this.sframe.setTexture(this.texture);
        // if (data.DrawNode.getComponent(cc.Sprite).spriteFrame)
        //     data.DrawNode.getComponent(cc.Sprite).spriteFrame.setTexture(this.texture); // = this.sframe;
        // else {
        this.sframe.setTexture(this.texture);
        data.DrawNode.getComponent(cc.Sprite).spriteFrame = this.sframe;
        // }
    }
    setImageData(data) {
        if (data == null) return;
        this.getCanvasData().UserContext.putImageData(data, 0, 0);
        this.UpdateTexture();
    }
    setEraseOn(isErase: boolean) {
        this.IsEraseData = isErase;
    }
    getImageData() {
        let data = this.getCanvasData();
        if (data == null) return null;
        let imgd11 = data.UserContext.getImageData(0, 0, data.CanvasWidth, data.CanvasHeight);
        return imgd11;
    }
    getCanvasData() {
        return this.canvasdata;
    }
    resetTexture() {
        this.OriginalData = this.DefaultData;
        this.UpdateTexture();
    }
    clearPicture() {
        if (this.DefaultData == null) return;
        this.DefaultTextureUserContext.putImageData(this.DefaultData, 0, 0);
        this.OriginalData = this.DefaultTextureUserContext.getImageData(0, 0, this.CanvasWidth, this.CanvasHeight);
        this.OriginalData = this.filterData(this.OriginalData);
        this.UpdateTexture();
        this.UndoData.splice(0, this.UndoData.length);
    }
    FillTexture(id: number) {
        const patterndata = this.getPatternDataUsingIndex(id);
        const { width, data } = this.OriginalData;
        for (let i = 0; i < data.length; i += 4) {
            data[i + 0] = patterndata.data[i];
            data[i + 1] = patterndata.data[i + 1];
            data[i + 2] = patterndata.data[i + 2];
            data[i + 3] = patterndata.data[i + 3];
        }
        this.UpdateTexture();
    }
    LoadTexture(framepath: string, ID: number, isRepeatPattern: boolean, isFitWithContent: boolean = false) {
        let temp = getImageElement(framepath);
        if (temp) {
            this.ActionAfterLoaded(temp, framepath, ID, isRepeatPattern, isFitWithContent);
            return;
        }
        const img = new Image();
        img.onload = () => {
            this.ActionAfterLoaded(img, framepath, ID, isRepeatPattern, isFitWithContent);
        };
        img.src = framepath;
        if (ID == 0) {
            this.defaulturl = framepath;
            this.userDrawingObj.StartDrawingAfterLoading();
        }
    }
    ActionAfterLoaded(img: HTMLImageElement, framepath: string, ID: number, isRepeatPattern: boolean, isFitWithContent: boolean = false) {
        this.TextureUserContext.clearRect(0, 0, this.CanvasWidth, this.CanvasHeight);
        let CanvasWidth = img.width;
        let CanvasHeight = img.height;
        if (isRepeatPattern) {
            CanvasWidth = this.CanvasWidth;
            CanvasHeight = this.CanvasHeight;
        }
        if (ID == 100) {
            this.PatternImage = img;
            this.UpdatePatternWithColor(this.userDrawingObj.selectedFillColor);
        }
        this.TextureUserCanvas.width = CanvasWidth;
        this.TextureUserCanvas.height = CanvasHeight;
        if (ID == 0) {
            this.DefaultTextureUserCanvas.width = CanvasWidth;
            this.DefaultTextureUserCanvas.height = CanvasHeight;
        }
        if (isFitWithContent) {
            this.TextureUserContext.drawImage(img, 0, 0, this.CanvasWidth, this.CanvasHeight);
            if (ID == 0) {
                this.DefaultTextureUserContext.drawImage(img, CanvasWidth / 2 - img.width / 2, CanvasHeight / 2 - img.height / 2);
            }
        } else if (isRepeatPattern) {
            var pat = this.TextureUserContext.createPattern(img, 'repeat');
            this.TextureUserContext.rect(0, 0, this.TextureUserCanvas.width, this.TextureUserCanvas.height);
            this.TextureUserContext.fillStyle = pat;
            this.TextureUserContext.fill();
        } else {
            this.TextureUserContext.drawImage(img, CanvasWidth / 2 - img.width / 2, CanvasHeight / 2 - img.height / 2);
            if (ID == 0) {
                this.DefaultTextureUserContext.drawImage(img, CanvasWidth / 2 - img.width / 2, CanvasHeight / 2 - img.height / 2);
            }
        }

        if (ID == 0) {
            this.DefaultImage = img;
            this.isDefault = true;
            if (this.userDrawingObj.SceneType === SCENE_TYPE.FILL || this.userDrawingObj.SceneType === SCENE_TYPE.FILL_AND_DRAWING) {
                let data = this.filterData(this.TextureUserContext.getImageData(0, 0, CanvasWidth, CanvasHeight));
                this.PatternData.push({
                    PatternData: data,
                    Image: img,
                    ID: ID,
                });
                this.DefaultData = this.DefaultTextureUserContext.getImageData(0, 0, CanvasWidth, CanvasHeight);
                this.FillData = this.filterData(this.TextureUserContext.getImageData(0, 0, CanvasWidth, CanvasHeight));
                if (this.userDrawingObj.SceneType == SCENE_TYPE.FILL || this.userDrawingObj.SceneType == SCENE_TYPE.FILL_AND_DRAWING) {
                    this.userDrawingObj.initFloodFill(this.FillData);
                }
                this.OriginalData = data;
                this.setImageData(data);
                this.DefaultTextureUserContext.putImageData(this.OriginalData, 0, 0);
            } else {
                let data = this.TextureUserContext.getImageData(0, 0, CanvasWidth, CanvasHeight);
                this.PatternData.push({
                    PatternData: data,
                    Image: img,
                    ID: ID,
                });
                this.OriginalData = data;
                this.setImageData(data);
                this.FillData = this.DefaultTextureUserContext.getImageData(0, 0, CanvasWidth, CanvasHeight);
                this.userDrawingObj.initFloodFill(this.FillData);
                this.DefaultTextureUserContext.putImageData(this.OriginalData, 0, 0);
                this.DefaultData = this.DefaultTextureUserContext.getImageData(0, 0, CanvasWidth, CanvasHeight);
            }
        } else {
            this.PatternData.push({
                PatternData: this.TextureUserContext.getImageData(0, 0, CanvasWidth, CanvasHeight),
                Image: img,
                ID: ID,
            });
        }
    }
    LoadEmptyTexture(ID: number) {
        this.isDefault = false;
        this.TextureUserContext.clearRect(0, 0, this.CanvasWidth, this.CanvasHeight);
        let CanvasWidth = this.CanvasWidth;
        let CanvasHeight = this.CanvasHeight;

        this.TextureUserCanvas.width = CanvasWidth;
        this.TextureUserCanvas.height = CanvasHeight;
        this.DefaultTextureUserCanvas.width = CanvasWidth;
        this.DefaultTextureUserCanvas.height = CanvasHeight;

        let data = this.TextureUserContext.getImageData(0, 0, CanvasWidth, CanvasHeight);
        this.PatternData.push({
            PatternData: data,
            Image: null,
            ID: ID,
        });
        this.OriginalData = data;
        for (let i = 0; i < this.OriginalData.data.length; i += 4) {
            this.OriginalData.data[i] = 0;
            this.OriginalData.data[i + 1] = 0;
            this.OriginalData.data[i + 2] = 0;
            this.OriginalData.data[i + 3] = 0;
        }
        this.setImageData(data);
        this.FillData = this.DefaultTextureUserContext.getImageData(0, 0, CanvasWidth, CanvasHeight);

        this.userDrawingObj.initFloodFill(this.FillData);
        this.DefaultTextureUserContext.putImageData(this.OriginalData, 0, 0);
        this.DefaultData = this.DefaultTextureUserContext.getImageData(0, 0, CanvasWidth, CanvasHeight);

        this.userDrawingObj.StartDrawingAfterLoading();
    }
    filterData(data1: any) {
        if (this.userDrawingObj.SceneType === SCENE_TYPE.FILL || this.userDrawingObj.SceneType === SCENE_TYPE.FILL_AND_DRAWING) {
            let dataTexture = data1;
            const { data } = data1;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i] < 80 && data[i + 1] < 80 && data[i + 2] < 80) {
                    data[i + 0] = 0;
                    data[i + 1] = 0;
                    data[i + 2] = 0;
                    data[i + 3] = 255;
                } else {
                    data[i + 0] = 255;
                    data[i + 1] = 255;
                    data[i + 2] = 255;
                    data[i + 3] = 255;
                }
            }
            return dataTexture;
        }
        return data1;
    }
    getPatternData() {
        return this.SelectedPatternData;
    }
    setPatternData(id) {
        if (this.PatternData == null) {
            this.userDrawingObj.setPatternIndex(this.userDrawingObj.selectedPattern);
            return null;
        }
        for (let i = 0; i < this.PatternData.length; i++) {
            if (this.PatternData[i].ID == id) {
                this.SelectedPatternData = this.PatternData[i].PatternData;
                this.selectedPData = this.SelectedPatternData.data;
                return this.SelectedPatternData;
            }
        }
    }
    getPatternDataUsingIndex(id) {
        if (this.PatternData == null) return null;
        for (let i = 0; i < this.PatternData.length; i++) {
            if (this.PatternData[i].ID == id) return this.PatternData[i].PatternData;
        }
        return null;
    }

    UpdatePatternDrawingFloodFill(patternID: number, modifiedPixels: cc.Vec2[], color: cc.Color) {
        if (this.SelectedPatternData == null) {
            this.SelectedPatternData = this.getPatternDataUsingIndex(patternID);
            if (this.SelectedPatternData) this.selectedPData = this.SelectedPatternData.data;
        }
        cc.game.emit('EnableUndo');
        const { width, data, height } = this.OriginalData;

        const isEnableColor = this.userDrawingObj.isEnableColor;
        let colorcode;
        if (isEnableColor) {
            colorcode = this.userDrawingObj.selectedFillColor;
        }
        let ColorMatrix = this.userDrawingObj.floodfillcolor.ColorMatrix;
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                if (ColorMatrix[i][j]) {
                    const startPos = 4 * (j * width + i);
                    if (this.isGradientEnable && this.isMultiColorOn) {
                        data[startPos] = this.GradientImageData[startPos];
                        data[startPos + 1] = this.GradientImageData[startPos + 1];
                        data[startPos + 2] = this.GradientImageData[startPos + 2];
                        data[startPos + 3] = this.GradientImageData[startPos + 3];
                    } else if (this.userDrawingObj.isEnablePatternWithColor) {
                        data[startPos] = this.PatternColorData[startPos];
                        data[startPos + 1] = this.PatternColorData[startPos + 1];
                        data[startPos + 2] = this.PatternColorData[startPos + 2];
                        data[startPos + 3] = this.PatternColorData[startPos + 3];
                    } else if (isEnableColor) {
                        data[startPos] = colorcode.r;
                        data[startPos + 1] = colorcode.g;
                        data[startPos + 2] = colorcode.b;
                        data[startPos + 3] = 255;
                    } else {
                        data[startPos] = this.selectedPData[startPos];
                        data[startPos + 1] = this.selectedPData[startPos + 1];
                        data[startPos + 2] = this.selectedPData[startPos + 2];
                        data[startPos + 3] = this.selectedPData[startPos + 3];
                    }
                }
            }
        }
        if (this.userDrawingObj.SceneType != SCENE_TYPE.DRAWING) {
            this.UpdateContext();
        } else {
            this.setImageData(this.OriginalData);
        }
    }

    UpdatePatternDrawingUsingPosition(patternID: number, userDrawing, x, y, maxx, maxy) {
        if (this.OriginalData == null) return;
        if (x > maxx) return;
        if (y > maxy) return;
        if (this.IsEraseData) {
            const { width, data } = this.OriginalData;
            for (let i = x; i < maxx; i++) {
                for (let j = y; j < maxy; j++) {
                    if (j < 0 || i < 0 || j > maxy || i > maxx) continue;
                    const startPos = 4 * (j * width + i);
                    if (userDrawing.data && userDrawing.data[startPos + 3] && userDrawing.data[startPos + 3] > 0) {
                        data[startPos] = 0;
                        data[startPos + 1] = 0;
                        data[startPos + 2] = 0;
                        data[startPos + 3] = 0;
                    }
                }
            }
        } else if (this.isGradientEnable && this.isMultiColorOn) {
            if (this.GradientImageData == null) return;
            const { width, data } = this.OriginalData;
            for (let i = x; i < maxx; i++) {
                for (let j = y; j < maxy; j++) {
                    if (j < 0 || i < 0 || j > maxy || i > maxx) continue;
                    const startPos = 4 * (j * width + i);
                    if (userDrawing.data && userDrawing.data[startPos + 3] && userDrawing.data[startPos + 3] > 0) {
                        data[startPos] = this.GradientImageData[startPos];
                        data[startPos + 1] = this.GradientImageData[startPos + 1];
                        data[startPos + 2] = this.GradientImageData[startPos + 2];
                        data[startPos + 3] = this.GradientImageData[startPos + 3];
                    }
                }
            }
        } else if (this.userDrawingObj.isEnablePatternWithColor) {
            if (this.PatternColorData == null) return;
            const { width, data } = this.OriginalData;
            for (let i = x; i < maxx; i++) {
                for (let j = y; j < maxy; j++) {
                    if (j < 0 || i < 0 || j > maxy || i > maxx) continue;
                    const startPos = 4 * (j * width + i);
                    if (userDrawing.data && userDrawing.data[startPos + 3] && userDrawing.data[startPos + 3] > 0) {
                        data[startPos] = this.PatternColorData[startPos];
                        data[startPos + 1] = this.PatternColorData[startPos + 1];
                        data[startPos + 2] = this.PatternColorData[startPos + 2];
                        data[startPos + 3] = this.PatternColorData[startPos + 3];
                    }
                }
            }
        } else if (this.userDrawingObj.isEnableColor) {
            let color = this.userDrawingObj.selectedFillColor;
            const { width, data } = this.OriginalData;
            for (let i = x; i < maxx; i++) {
                for (let j = y; j < maxy; j++) {
                    if (j < 0 || i < 0 || j > maxy || i > maxx) continue;
                    const startPos = 4 * (j * width + i);
                    if (userDrawing.data && userDrawing.data[startPos + 3] && userDrawing.data[startPos + 3] > 0) {
                        data[startPos] = color.r;
                        data[startPos + 1] = color.g;
                        data[startPos + 2] = color.b;
                        data[startPos + 3] = 255;
                    }
                }
            }
        } else {
            if (this.SelectedPatternData == null) {
                this.setPatternData(this.userDrawingObj.selectedPattern);
                return;
            }
            const { width, data } = this.OriginalData;
            const udata = userDrawing.data;
            for (let i = x; i < maxx; i++) {
                for (let j = y; j < maxy; j++) {
                    if (j < 0 || i < 0 || j > maxy || i > maxx) continue;
                    const startPos = 4 * (j * width + i);
                    if (udata[startPos + 3] && this.selectedPData[startPos + 3]) {
                        data[startPos] = this.selectedPData[startPos];
                        data[startPos + 1] = this.selectedPData[startPos + 1];
                        data[startPos + 2] = this.selectedPData[startPos + 2];
                        data[startPos + 3] = this.selectedPData[startPos + 3];
                    }
                }
            }
        }

        this.UpdateTexture();
    }
    UpdatePatternDrawingInBoundry(patternID: number, userDrawing, x, y, maxx, maxy) {
        if (this.OriginalData == null) return;
        if (this.GradientImageData == null) return;
        if (this.isGradientEnable && this.isMultiColorOn) {
            const { width, data } = this.OriginalData;
            const data2 = this.GradientImageData.data;
            const data1 = userDrawing.data;
            if (data1 == null) return;
            for (let i = x; i < maxx; i++) {
                for (let j = y; j < maxy; j++) {
                    if (i > maxx) continue;
                    if (j > maxy) continue;
                    if (i < 0) continue;
                    if (j < 0) continue;
                    const startPos = 4 * (j * width + i);
                    if (data1[startPos + 3] > 0 && data2[startPos + 3] > 0 && this.checkValue(i, j)) {
                        data[startPos] = data2[startPos];
                        data[startPos + 1] = data2[startPos + 1];
                        data[startPos + 2] = data2[startPos + 2];
                        data[startPos + 3] = 255;
                    }
                    // this.StartGradientIndex += 4;
                    // if (this.StartGradientIndex > data2.length) {
                    //     this.updateGradient();
                    //     this.StartGradientIndex = 0;
                    // }
                }
            }
        } else if (this.userDrawingObj.isEnableColor && !this.userDrawingObj.isEnablePatternWithColor) {
            let color = this.userDrawingObj.selectedFillColor;
            const { width, data } = this.OriginalData;
            const data1 = userDrawing.data;
            if (data1 == null) return;
            for (let i = x; i < maxx; i++) {
                for (let j = y; j < maxy; j++) {
                    if (i > maxx) continue;
                    if (j > maxy) continue;
                    if (i < 0) continue;
                    if (j < 0) continue;
                    const startPos = 4 * (j * width + i);
                    if (data1[startPos + 3] > 0 && this.checkValue(i, j)) {
                        data[startPos] = color.r;
                        data[startPos + 1] = color.g;
                        data[startPos + 2] = color.b;
                        data[startPos + 3] = 255;
                    }
                }
            }
        } else if (this.userDrawingObj.isEnableColor && this.userDrawingObj.isEnablePatternWithColor) {
            let color = this.userDrawingObj.selectedFillColor;
            const { width, data } = this.OriginalData;
            if (width == null) return;
            if (data == null) return;
            if (this.PatternColorData == null) return;
            const data1 = userDrawing.data;
            if (data1 == null) return;
            for (let i = x; i < maxx; i++) {
                for (let j = y; j < maxy; j++) {
                    if (i > maxx) continue;
                    if (j > maxy) continue;
                    if (i < 0) continue;
                    if (j < 0) continue;
                    const startPos = 4 * (j * width + i);
                    if (data1[startPos + 3] > 0 && this.checkValue(i, j)) {
                        data[startPos] = this.PatternColorData[startPos];
                        data[startPos + 1] = this.PatternColorData[startPos + 1];
                        data[startPos + 2] = this.PatternColorData[startPos + 2];
                        data[startPos + 3] = this.PatternColorData[startPos + 3];
                    }
                }
            }
        } else {
            const { width, data } = this.OriginalData;
            const data1 = userDrawing.data;
            if (data1 == null) return;
            if (this.selectedPData == null) return;
            for (let i = x; i < maxx; i++) {
                for (let j = y; j < maxy; j++) {
                    if (i > maxx) continue;
                    if (j > maxy) continue;
                    if (i < 0) continue;
                    if (j < 0) continue;
                    const startPos = 4 * (j * width + i);
                    if (data1[startPos + 3] > 0 && this.checkValue(i, j)) {
                        data[startPos] = this.selectedPData[startPos];
                        data[startPos + 1] = this.selectedPData[startPos + 1];
                        data[startPos + 2] = this.selectedPData[startPos + 2];
                        data[startPos + 3] = this.selectedPData[startPos + 3];
                    }
                }
            }
        }
        this.UpdateTexture();
    }
    setSticker(name: string) {
        let isdone = false;
        for (let i = 0; i < GlobalData.data.flags.StickerPath.length; i++) {
            if (GlobalData.data.flags.StickerPath[i].name == name) {
                this.StickerImage = GlobalData.data.flags.StickerPath[i].img;
                isdone = true;
                break;
            }
        }
        if (isdone == false) {
        }
    }
    AddSticker(x, y, scale: number = 1) {
        if (this.StickerImage) {
            this.StickerContext.putImageData(this.OriginalData, 0, 0);
            this.StickerContext.drawImage(
                this.StickerImage,
                x - (this.StickerImage.width * scale) / 2,
                y - (this.StickerImage.height * scale) / 2,
                this.StickerImage.width * scale,
                this.StickerImage.height * scale
            );
            this.UpdateSticker(
                this.StickerContext.getImageData(0, 0, this.CanvasWidth, this.CanvasHeight),
                x,
                y,
                this.StickerImage.width * scale,
                this.StickerImage.height * scale
            );
        }
    }
    UpdateSticker(data1, x, y, width1: number, height1) {
        if (this.userDrawingObj.SceneType == SCENE_TYPE.FILL_AND_DRAWING) {
            const modifiedPixels = this.userDrawingObj.floodfillcolor.modifiedPixelsIndex;
            const { width, data } = this.OriginalData;
            const datasticker = data1.data;
            let wid = parseInt((width1 / 2).toFixed(0));
            let hei = parseInt((height1 / 2).toFixed(0));
            for (let i = x - wid; i < x + width1; i++) {
                if (i < 0 || i >= this.CanvasWidth) continue;
                for (let j = y - hei; j < y + height1; j++) {
                    if (j < 0 || j >= this.CanvasHeight) continue;
                    const startPos = 4 * (j * width + i);
                    if (this.checkValue(i, j)) {
                        data[startPos] = datasticker[startPos];
                        data[startPos + 1] = datasticker[startPos + 1];
                        data[startPos + 2] = datasticker[startPos + 2];
                        data[startPos + 3] = datasticker[startPos + 3];
                    }
                }
            }
        } else {
            const { width, data } = this.OriginalData;
            const datasticker = data1.data;
            for (let i = 0; i < data.length; i += 4) {
                const startPos = i;
                data[startPos] = datasticker[startPos];
                data[startPos + 1] = datasticker[startPos + 1];
                data[startPos + 2] = datasticker[startPos + 2];
                data[startPos + 3] = datasticker[startPos + 3];
            }
        }
        this.UpdateContext();
    }
    UpdateContext() {
        this.setImageData(this.OriginalData);
        this.UndoData.push({ data: this.getCanvasData().UserContext.getImageData(0, 0, this.CanvasWidth, this.CanvasHeight) });
        cc.game.emit('Enable.Undo');
    }
    checkValue(x, y) {
        return this.userDrawingObj.floodfillcolor.ColorMatrix[x][y];
    }
    getDrawingPixels() {
        let count = 0;
        if (this.isDefault) {
            const data = this.TextureUserContext.getImageData(0, 0, this.CanvasWidth, this.CanvasHeight);
            if (data == null) return 1;
            for (let i = 0; i < data.data.length; i += 4) {
                if (data.data[i + 3] && data.data[i + 3] > 0) {
                    count++;
                }
            }
        } else {
            const data = this.OriginalData;
            if (data == null) return 1;
            for (let i = 0; i < data.data.length; i += 4) {
                if (data.data[i + 3] && data.data[i + 3] > 0) {
                    count++;
                }
            }
        }
        return count;
    }
    getTotalPixels(patternID: number) {
        let count = 0;
        const dataTexture = this.getPatternDataUsingIndex(patternID);
        if (dataTexture == null) return 1;
        for (let i = 0; i < dataTexture.data.length; i += 4) {
            if (dataTexture.data[i + 3] && dataTexture.data[i + 3] > 0) {
                count++;
            }
        }
        return count;
    }
    getDrawingPercentage(patternID: number = 1) {
        const origonalpixel = this.getTotalPixels(patternID);
        const userpixel = this.getDrawingPixels();
        if (this.isDefault) return (origonalpixel / userpixel) * 100;
        else return (userpixel / origonalpixel) * 100;
    }

    UpdatePatternWithColor(color: cc.Color) {
        if (this.PatternImage && color && color.r != null && color.g != null && color.b != null) {
            let UserCanvas = document.createElement('canvas');
            let UserContext = UserCanvas.getContext('2d');
            UserCanvas.width = this.CanvasWidth;
            UserCanvas.height = this.CanvasHeight;

            UserContext.fillStyle = rgbToHex(color.r, color.g, color.b);
            UserContext.fillRect(0, 0, this.CanvasWidth, this.CanvasHeight);
            UserContext.drawImage(this.PatternImage, 0, 0);
            this.PatternColorData = UserContext.getImageData(0, 0, this.CanvasWidth, this.CanvasHeight).data;
        }
    }
    UpdatePatternWithColorCode(patternindex: number, color: cc.Color) {
        let val: PatternData = null;
        if (this.PatternData == null) return;
        for (let i = 0; i < this.PatternData.length; i++) {
            if (this.PatternData[i].ID == patternindex) {
                val = this.PatternData[i];
                break;
            }
        }
        if (val == null) return;
        if (val.Image == null) return;
        if (color && color.r != null && color.g != null && color.b != null) {
            let UserCanvas = document.createElement('canvas');
            let UserContext = UserCanvas.getContext('2d');
            UserCanvas.width = this.CanvasWidth;
            UserCanvas.height = this.CanvasHeight;

            UserContext.fillStyle = rgbToHex(color.r, color.g, color.b);
            UserContext.fillRect(0, 0, this.CanvasWidth, this.CanvasHeight);

            // set composite mode
            UserContext.globalCompositeOperation = 'destination-in';

            UserContext.drawImage(val.Image, 0, 0);
            val.PatternData = UserContext.getImageData(0, 0, this.CanvasWidth, this.CanvasHeight);
        }
    }
}
