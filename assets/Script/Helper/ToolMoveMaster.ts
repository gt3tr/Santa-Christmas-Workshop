import AdManager from "../Promotion/AdManager";
import AudioManager from "./AudioManager";
import UserDrawing from "./UserDrawing";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ToolMoveMaster extends cc.Component {
  isDrawingOn: boolean = false;
  isSelfNodeMove: boolean = true;

  @property()
  isTouchActive: boolean = true;

  @property()
  ToolEndMoveTime: number = 0.5;

  @property({ type: cc.Integer })
  ToolID: number = 0;

  @property(cc.Component.EventHandler)
  BeganAction: cc.Component.EventHandler = null;

  @property(cc.Component.EventHandler)
  MoveAction: cc.Component.EventHandler = null;

  @property(cc.Component.EventHandler)
  EndAction: cc.Component.EventHandler = null;

  @property({ visible: false })
  isSelf: boolean = false;
  @property({ displayName: "Move Node" })
  get typenode() {
    return this.isSelfNodeMove;
  }
  set typenode(val) {
    this.isSelfNodeMove = val;
  }

  @property({ type: cc.Node, visible: false })
  MoveItem: cc.Node = null;
  @property({
    type: cc.Node,
    visible: function (this) {
      return this.isSelfNodeMove;
    },
    displayName: "MoveItem",
  })
  get moveitem() {
    return this.MoveItem;
  }
  set moveitem(val) {
    this.MoveItem = val;
  }
  //Drawing
  @property({ visible: false })
  isDrawingEnable: boolean = false;
  @property({ displayName: "isEnable Drawing" })
  get type() {
    return this.isDrawingEnable;
  }
  set type(val) {
    this.isDrawingEnable = val;
    this.setType(val);
  }
  private setType(val): void {
    this.isDrawingOn = val;
  }
  @property({ type: UserDrawing, visible: false })
  drawing: UserDrawing[] = [];
  @property({
    type: UserDrawing,
    visible: function (this) {
      return this.isDrawingOn;
    },
    displayName: "Item",
  })
  get drawing1() {
    return this.drawing;
  }
  set drawing1(val) {
    this.drawing = val;
  }
  @property(cc.Node)
  destinationNode: cc.Node = null;

  @property
  ForceDisableDrawing: boolean = false;

  isPositionChanged: boolean = false;
  initPosition: cc.Vec3 = null;
  MoveinitPosition: cc.Vec3 = null;
  DefaultinitPosition: cc.Vec3 = null;
  DestinitPosition: cc.Vec3 = null;
  TapinitPosition: cc.Vec3 = null;
  isTapObject: boolean = false;
  isExitTool: boolean = false;
  isSwipe: boolean = false;
  BeganPoint: number = 10000;

  startX: number = 0;
  startY: number = 0;
  dist: number = 0;
  threshold = 50; //required min distance traveled to be considered swipe
  allowedTime = 500; // maximum time allowed to travel that distance
  elapsedTime: number = 0;
  startTime: number = 0;
  restraint: number = 100;
  swipedir: string = "none";
  distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  TapSound: string = "";
  SwipeSound: string = "";
  onLoad() {
    this.initPosition = this.node.position;
    this.DefaultinitPosition = this.node.position;
    if (this.MoveItem) this.MoveinitPosition = this.MoveItem.position;
    this.registerEvents();
  }
  start() {}
  registerEvents() {
    this.node.on(cc.Node.EventType.TOUCH_START, this.TouchStart, this);
    this.node.on(cc.Node.EventType.TOUCH_MOVE, this.TouchMove, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.TouchEnd, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.TouchEnd, this);
  }
  UpdateInitPosition() {
    this.initPosition = this.node.position;
    this.DefaultinitPosition = this.node.position;
    if (this.MoveItem) this.MoveinitPosition = this.MoveItem.position;
  }
  SwipeAction(touch: cc.Event.EventTouch) {
    AudioManager.getInstance().play(this.SwipeSound);
    if (this.node.getChildByName("Ads")) {
      this.ShowAds(this.node);
      return;
    }
    if (this.drawing) {
      for (let i = 0; i < this.drawing.length; i++) this.drawing[i].setActiveDrawing(true);
    }
    if (this.MoveItem) {
      this.node.opacity = 0;
      this.MoveItem.opacity = 255;
      this.MoveItem.active = true;
      this.MoveItem.position = cc.v3(this.MoveItem.parent.convertToNodeSpaceAR(touch.getLocation()));
      this.TapinitPosition = this.MoveItem.position;
      this.MoveinitPosition = this.MoveItem.position;
    } else {
      this.node.opacity = 255;
      this.node.active = true;
      this.node.position = cc.v3(this.node.parent.convertToNodeSpaceAR(touch.getLocation()));
      this.TapinitPosition = this.node.position;
      this.MoveinitPosition = this.node.position;
    }
    cc.Tween.stopAllByTarget(this.node);
    if (this.BeganAction) {
      this.BeganAction.emit([this.node, this.ToolID, touch.getLocation(), this.MoveItem, this.destinationNode]);
    }

    if (this.node.parent.name == "content") {
      if (this.node.parent.parent.parent && this.node.parent.parent.parent.getComponent(cc.ScrollView)) {
        this.node.parent.parent.parent.getComponent(cc.ScrollView).enabled = false;
      }
    }
  }
  TouchStart(touch: cc.Event.EventTouch) {
    if (!this.isTouchActive) return;
    if (!this.node.active) return;
    if (this.node.opacity != 255) return;
    this.isPositionChanged = true;
    // this.node.zIndex = 0;
    this.isTapObject = true;
    this.isSwipe = false;
    this.BeganPoint = touch.getLocationX();
    this.dist = 0;
    this.swipedir = "none";
    this.startX = touch.getLocationX();
    this.startY = touch.getLocationY();
    this.startTime = new Date().getTime();
    if (this.drawing && !this.ForceDisableDrawing) {
      for (let i = 0; i < this.drawing.length; i++) {
        this.drawing[i].setActiveDrawing(true);
        this.drawing[i].touchStart(touch);
      }
    }
    if (this.node.parent.name != "content") {
      this.SwipeAction(touch);
      AudioManager.getInstance().play(this.TapSound);
    } else {
      this.isSwipe = true;
    }
  }
  TouchMove(touch: cc.Event.EventTouch) {
    if (this.isTapObject == false) return;
    if (!this.isTouchActive) return;
    if (this.isTouchActive) {
      if (this.isSwipe) {
        const distX = touch.getLocationX() - this.startX; // get horizontal dist traveled by finger while in contact with surface
        const distY = touch.getLocationY() - this.startY; // get vertical dist traveled by finger while in contact with surface
        const elapsedTime = new Date().getTime() - this.startTime; // get time elapsed
        if (elapsedTime <= this.allowedTime) {
          // first condition for awipe met
          if (Math.abs(distX) >= this.threshold && Math.abs(distY) <= this.restraint) {
            // 2nd condition for horizontal swipe met
            this.swipedir = distX < 0 ? "left" : "right"; // if dist traveled is negative, it indicates left swipe
          } else if (Math.abs(distY) >= this.threshold && Math.abs(distX) <= this.restraint) {
            // 2nd condition for vertical swipe met
            this.swipedir = distY < 0 ? "up" : "down"; // if dist traveled is negative, it indicates up swipe
          }
        }
        if (this.swipedir == "left") {
          this.isSwipe = false;
          this.SwipeAction(touch);
        } else return;
      }
      if (this.MoveItem) {
        this.MoveItem.position = cc.v3(this.MoveItem.parent.convertToNodeSpaceAR(touch.getLocation()));
      } else {
        this.node.position = cc.v3(this.node.parent.convertToNodeSpaceAR(touch.getLocation()));
      }
      if (this.MoveAction) {
        this.MoveAction.emit([this.node, this.ToolID, touch.getLocation(), this.MoveItem]);
      }

      if (this.drawing && !this.ForceDisableDrawing) {
        for (let i = 0; i < this.drawing.length; i++) {
          this.drawing[i].touchMove(touch);
        }
      }
    }
  }
  TouchEnd(touch: cc.Event.EventTouch, event: cc.Event.EventCustom) {
    if (this.isTapObject == false) return;
    // if (this.MoveItem == null) return;
    if (!this.isTouchActive) return;
    if (this.node.getChildByName("Ads")) {
      const distX = touch.getLocationX() - this.startX;
      const distY = touch.getLocationY() - this.startY;
      if (distX < 50 && distY < 50) {
        this.ShowAds(this.node);
      }
      return;
    }
    if (this.destinationNode && this.destinationNode.getBoundingBoxToWorld().contains(touch.getLocation())) {
      this.destinationNode.active = true;
      this.MoveItem.active = false;
      this.isTapObject = false;
      this.isTouchActive = false;
    }
    if (this.isSwipe) {
      const distX = touch.getLocationX() - this.startX; // get horizontal dist traveled by finger while in contact with surface
      const distY = touch.getLocationY() - this.startY; // get vertical dist traveled by finger while in contact with surface
      const elapsedTime = new Date().getTime() - this.startTime; // get time elapsed
      if (elapsedTime <= this.allowedTime) {
        if (Math.abs(distX) >= this.threshold && Math.abs(distY) <= this.restraint) {
          this.swipedir = distX < 0 ? "left" : "right"; // if dist traveled is negative, it indicates left swipe
        } else if (Math.abs(distY) >= this.threshold && Math.abs(distX) <= this.restraint) {
          this.swipedir = distY < 0 ? "up" : "down"; // if dist traveled is negative, it indicates up swipe
        }
      }
      if (this.swipedir == "left") {
        this.isSwipe = false;
        this.SwipeAction(touch);
      } else return;
    }
    if (this.drawing) {
      for (let i = 0; i < this.drawing.length; i++) this.drawing[i].setActiveDrawing(false);
    }
    this.isTapObject = false;

    if (this.node.parent.name == "content") {
      if (this.node.parent.parent.parent && this.node.parent.parent.parent.getComponent(cc.ScrollView)) {
        this.node.parent.parent.parent.getComponent(cc.ScrollView).enabled = true;
      }
    }
    if (this.isTouchActive && this.isPositionChanged) {
      this.isPositionChanged = false;
      let node1 = this.MoveItem;
      let pos = this.MoveinitPosition;
      if (node1 == null) {
        node1 = this.node;
        pos = this.DefaultinitPosition;
      }
      cc.tween(node1)
        .to(this.getTime(node1.position, pos), { position: pos })
        .call(() => {
          // this.node.zIndex = 0;
          if (this.MoveItem) {
            this.MoveItem.active = false;
            if (this.MoveinitPosition) this.MoveItem.position = this.DefaultinitPosition;
          } else {
            if (this.DefaultinitPosition) this.node.position = this.DefaultinitPosition;
          }
          this.node.active = true;
          this.node.opacity = 255;
        })
        .start();
    }
    if (this.EndAction) {
      this.EndAction.emit([this.node, this.ToolID, touch.getLocation(), this.MoveItem, this.destinationNode]);
    }
  }
  ToolEnd() {
    let node1 = this.MoveItem;
    let pos = this.MoveinitPosition;
    if (node1 == null) {
      node1 = this.node;
      pos = this.DefaultinitPosition;
    }
    cc.tween(node1)
      .to(this.getTime(node1.position, pos), { position: pos })
      .call(() => {
        // this.node.zIndex = 0;
        if (this.MoveItem) {
          this.MoveItem.active = false;
          if (this.MoveinitPosition) this.MoveItem.position = this.DefaultinitPosition;
        } else {
          if (this.DefaultinitPosition) this.node.position = this.DefaultinitPosition;
        }
        this.node.active = true;
        this.node.opacity = 255;
      })
      .start();
  }
  getTime(pos: cc.Vec3, dest: cc.Vec3) {
    return 0.2;
  }
  async ShowAds(node: cc.Node) {
    if (node && node.getChildByName("Ads")) {
      this.resetComponent();
      const val = await AdManager.getInstance().requestRewardAds(node.getChildByName("Ads"));
      if (val) node.removeComponent(cc.Button);
      return;
    }
  }
  UpdateOffset(size: cc.Size) {
    if (this.drawing) {
      for (let i = 0; i < this.drawing.length; i++) this.drawing[i].setDrawingOffset(size.width, size.height);
    }
  }
  UpdateBrushSize(size: number) {
    if (this.drawing) {
      for (let i = 0; i < this.drawing.length; i++) this.drawing[i].setBrushSize(size);
    }
  }
  resetComponent() {
    if (this.MoveItem) {
      this.MoveItem.active = false;
      cc.Tween.stopAllByTarget(this.MoveItem);
    }
    cc.Tween.stopAllByTarget(this.node);
    this.isTapObject = false;
    this.node.opacity = 255;
    this.node.active = true;
    this.node.position = this.DefaultinitPosition;
    if (this.MoveItem) this.MoveItem.position = this.MoveinitPosition;
    this.isTouchActive = true;
  }
  isToolReset() {
    cc.tween(this.MoveItem)
      .to(this.ToolEndMoveTime, { position: this.DefaultinitPosition })
      .call(() => {
        this.isTapObject = false;
        this.node.opacity = 255;
        this.node.active = true;
        this.node.position = this.DefaultinitPosition;
        // if (this.MoveItem) this.MoveItem.position = this.MoveinitPosition;
        this.isTouchActive = false;
      })
      .start();
  }
  setActive(isOn: boolean) {
    if (isOn) {
      this.node.opacity = 255;
      this.isTouchActive = true;
    } else {
      this.node.opacity = 254;
      this.isTouchActive = false;
    }
  }

  ToolDoneAction() {
    if (this.drawing.length > 0) {
      for (let i = 0; i < this.drawing.length; i++) {
        if (this.drawing[i].isErase) {
          this.drawing[i].clearPicture();
        } else {
          this.drawing[i].FillFullTexture();
        }
      }
    }
  }
  resetTexture() {
    if (this.drawing.length > 0) {
      for (let i = 0; i < this.drawing.length; i++) {
        this.drawing[i].resetPicture();
      }
    }
  }
  isToolDone() {
    if (this.drawing.length > 0) {
      let isdone = true;
      for (let i = 0; i < this.drawing.length; i++) {
        if (this.drawing[i].isErase) {
          if (this.drawing[i].getDrawingPercentage() > 10) {
            isdone = false;
            break;
          }
        } else {
          if (this.drawing[i].getDrawingPercentage() < 90) {
            isdone = false;
            break;
          }
        }
      }
      return isdone;
    } else {
      return false;
    }
  }
}
