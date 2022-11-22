// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import CanvasManager from './CanvasManager';

const { ccclass, property } = cc._decorator;

export interface UserImageData {
    Arrayindex: number;
    colorcode: cc.Color;
    isPixelChecked: boolean;
    x: number;
    y: number;
}
export enum DRAWING_TYPE {
    NONE = 0,
    DRAWING = 1,
    FILL = 2,
    STICKER = 3,
}
export interface DRAWING_DATA {
    data: any;
    ID: number;
}

@ccclass
export default class DrawingManager extends cc.Component {
    private static instance: DrawingManager;
    TextureSize: cc.Size = cc.Size.ZERO;
    DrawingType: number = DRAWING_TYPE.DRAWING;
    SelectedColorID: number = 0;
    DrawNode: cc.Node = null;
    CanvasManagerObj: CanvasManager = null;

    initWithData(DrawingPad: cc.Node) {
        this.TextureSize = DrawingPad.getContentSize();
        this.DrawNode = DrawingPad;
        this.CanvasManagerObj = new CanvasManager();
        // console.log(DrawingPad);

        this.CanvasManagerObj.initWithData(DrawingPad);
    }
    loadTextureFrame(path: string, id: number, isRepeatPattern: boolean) {
        this.CanvasManagerObj.LoadTexture(path, id, isRepeatPattern);
    }
    resetTextureFrame(id: number) {
        this.CanvasManagerObj.resetTexture(id);
    }
    clearAll() {
        this.CanvasManagerObj.clearAll();
    }
    setEraseOn(isErase: boolean) {
        this.CanvasManagerObj.setEraseOn(isErase);
    }
    updateCanvas(patternID: number, userDrawing) {
        this.CanvasManagerObj.UpdatePatternDrawing(patternID, userDrawing);
    }
    getPercentage(patternID: number) {
        return this.CanvasManagerObj.getDrawingPercentage(patternID);
    }
    getImageData(patternID: number) {
        return this.CanvasManagerObj.getImageData();
    }
}
