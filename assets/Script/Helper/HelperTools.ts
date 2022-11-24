import AdManager from "../Promotion/AdManager";
import AudioManager from "./AudioManager";

interface ButtonKeys {
  normalSprite: string;
  pressedSprite?: string;
  hoverSprite?: string;
  disabledSprite?: string;
}

export function GetRandomInterger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function GetRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export async function AsyncTask(callback: (taskResolve: (value: void | PromiseLike<void>) => void) => void) {
  return new Promise<void>((resolve, reject) => {
    callback(resolve);
  });
}

/**
 * Delay with Promise method
 * @param second - default 1 second
 */
export async function Delay(second: number = 1) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, second * 1000);
  });
}

export async function DelayForAd(second: number = 1) {
  let isdone = false;
  cc.tween(cc.director.getScene())
    .delay(second)
    .call(() => {
      isdone = true;
    })
    .start();
  return new Promise<void>((resolve, reject) => {
    setTimeout(async () => {
      while (AdManager.getInstance().isAdRunningOrNot() || AdManager.getInstance().isSwitchTab || isdone == false) {
        await Delay(1);
      }
      resolve();
    }, second * 1000);
  });
}
/**
 * Skippable Delay with Promise method
 * @param second - default 1 second
 * @param eventName - register gg.eventManager listener to manual trigger promise's resolve
 * @returns Promise
 */
export async function SkippableDelay(second: number = 1, eventName: string) {
  if (second <= 0) {
    return;
  }

  return new Promise<void>((resolve, reject) => {
    setTimeout(async () => {
      while (AdManager.getInstance().isAdRunningOrNot() || AdManager.getInstance().isSwitchTab) {
        await Delay(1);
      }
      resolve();
    }, second * 1000);

    if (eventName) {
      cc.game.on(eventName, () => {
        resolve();
      });
    }
  });
}

/**
 * The de-facto unbiased shuffle algorithm is the Fisher-Yates (aka Knuth) Shuffle.
 * @param array
 * @returns Shuffle Array
 */
export function Shuffle(array: any[]) {
  if (array == null) return array;

  let currentIndex = array.length;
  let temporaryValue: any;
  let randomIndex: number;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export function Pad(num: number, size: number) {
  const s = "000000000" + num;

  return s.substr(s.length - size);
}

/**
 * Beautify digit number by remove zero string behind.
 * Example: convert 100.00 to 100
 * @param num
 * @returns string
 */
export function BeautifyNumber(num: number, fractionDigits?: number) {
  if (num === 0) {
    return num.toFixed(fractionDigits);
  }

  if (Number.isInteger(num)) {
    return num.toFixed(0);
  }

  if (fractionDigits) {
    return num.toFixed(fractionDigits);
  }

  return num.toString();
}

export function RoundUp(num: number, numDigits: number = 2) {
  const decimalPoint = Math.pow(10, numDigits);

  return Math.ceil(num * decimalPoint) / decimalPoint;
}

export function RoundDown(num: number, numDigits: number = 2) {
  const decimalPoint = Math.pow(10, numDigits);

  return Math.floor(num * decimalPoint) / decimalPoint;
}

export const UItools = {
  ChangeButtonSpriteFrame: (button: cc.Button, spriteAtlas: cc.SpriteAtlas, keys: ButtonKeys) => {
    button.normalSprite = spriteAtlas.getSpriteFrame(keys.normalSprite);
    button.pressedSprite = spriteAtlas.getSpriteFrame(keys.pressedSprite);
    button.hoverSprite = spriteAtlas.getSpriteFrame(keys.hoverSprite);
    button.disabledSprite = spriteAtlas.getSpriteFrame(keys.disabledSprite);
  },
};

export const StringFormat = (str: string, ...args: string[]) =>
  str.replace(/{(\d+)}/g, (match, index) => args[index] || "");

export function GetURLParameter(name: string) {
  // eslint-disable-next-line no-useless-concat
  let regExp = new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search);
  let result: string;
  let decodeURI: string;

  if (regExp) {
    // eslint-disable-next-line no-sparse-arrays
    result = (regExp || [, ""])[1].replace(/\+/g, "%20");
    decodeURI = decodeURIComponent(result);
  }

  return decodeURI || null;
}

export function RequestDeviceFullScreen() {
  cc.view.enableAutoFullScreen(true);
}

export function RegisterDeviceFullScreen() {
  if (!cc.sys.isMobile) return;

  const theElement = document.getElementById("GameCanvas");

  theElement.addEventListener(
    "touchend",
    () => {
      RequestDeviceFullScreen();
    },
    false
  );
}

// eslint-disable-next-line max-params
export function NumberArray(start: number, end: number, prefix?: string, suffix?: string): number[] | string[] {
  let result = [];

  let i: number;
  let asString = false;

  if (prefix || suffix) {
    asString = true;

    if (!prefix) {
      // eslint-disable-next-line no-param-reassign
      prefix = "";
    }

    if (!suffix) {
      // eslint-disable-next-line no-param-reassign
      suffix = "";
    }
  }

  if (end < start) {
    for (i = start; i >= end; i--) {
      if (asString) {
        result.push(prefix + i.toString() + suffix);
      } else {
        result.push(i);
      }
    }
  } else {
    for (i = start; i <= end; i++) {
      if (asString) {
        result.push(prefix + i.toString() + suffix);
      } else {
        result.push(i);
      }
    }
  }

  return result;
}
export function animateProgressTo(progress: cc.Sprite, progressVal: number, progressDuration: number = 1) {
  let progressAmt = 0;
  cc.tween(progress)
    .to(
      progressDuration,
      { fillRange: progressVal },
      {
        // eslint-disable-next-line max-params
        progress: (start: number, end: number, current: number, ratio: number) => {
          progressAmt = cc.misc.lerp(start, end, ratio);
          progress.fillRange = progressAmt;
          return progressAmt;
        },
      }
    )
    .start();
}
export function distanceBetween2Points(point1, point2) {
  var dx = point2.x - point1.x;
  var dy = point2.y - point1.y;
  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}
export function ScrollAction(scrollView: cc.ScrollView, time: number) {
  scrollView.scrollToBottom(0.0, false);
  cc.tween(scrollView)
    .delay(0.2)
    .call(() => {
      scrollView.scrollToTop(2.0, false);
    })
    .start();
}
export function setTexture(source: cc.Node, dest: cc.Node) {
  source.getComponent(cc.Sprite).spriteFrame = dest.getComponent(cc.Sprite).spriteFrame;
}
export function addButtonEvent(
  element: cc.Node,
  parent: cc.Node,
  filename: string,
  methodname: string,
  autograyeffect: boolean = true,
  transitiontype: cc.Button.Transition = cc.Button.Transition.SCALE,
  shouldCreateButton = true
) {
  if (shouldCreateButton) {
    element.addComponent(cc.Button);
  }

  var clickEventHandler = new cc.Component.EventHandler();
  clickEventHandler.target = parent;
  clickEventHandler.component = filename;
  clickEventHandler.handler = methodname;
  clickEventHandler.customEventData = "";
  var button = element.getComponent(cc.Button);
  button.clickEvents.push(clickEventHandler);
  button.transition = transitiontype;
  button.enableAutoGrayEffect = autograyeffect;
}
export function ManageButton(node: cc.Node) {
  node.parent.children.forEach((element) => {
    element.getComponent(cc.Button).interactable = true;
  });
  node.getComponent(cc.Button).interactable = false;
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
export function capturePhoto(Frame: cc.Node) {
  // console.log(document.getElementById('GameCanvas'));
  let node = new cc.Node();
  node.parent = cc.director.getScene();
  let camera = node.addComponent(cc.Camera);
  node.position = new cc.Vec3(400, 252, 0);
  // Set the CullingMask of the screenshot you want
  camera.cullingMask = 0xffffffff;

  // Create a new RenderTexture and set this new RenderTexture to the camera's targetTexture so that the camera content will be rendered to this new RenderTexture
  let texture = new cc.RenderTexture();

  // If the Mask component is not included in the screenshot, you don't need to pass the third parameter.
  texture.initWithSize(800, 504, cc.RenderTexture.DepthStencilFormat.RB_FMT_S8); //RB_FMT_S8
  camera.targetTexture = texture;

  // Render the camera once, updating the content once into RenderTexture
  camera.render();

  // This allows the data to be obtained from the rendertexture.
  let data = texture.readPixels();

  // Then you can manipulate the data.
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  let width = (canvas.width = texture.width);
  let height = (canvas.height = texture.height);

  canvas.width = texture.width;
  canvas.height = texture.height;

  let rowBytes = width * 4;
  for (let row = 0; row < height; row++) {
    let srow = height - 1 - row;
    let imageData = ctx.createImageData(width, 1);
    let start = srow * width * 4;
    for (let i = 0; i < rowBytes; i++) {
      imageData.data[i] = data[start + i];
    }
    ctx.putImageData(imageData, 0, row);
  }

  var imgData = ctx.getImageData(0, 0, 800, 504);

  let dataURL = canvas.toDataURL("image/png");

  let img = document.createElement("img");
  img.src = dataURL;
  img.onload = function () {
    ctx.clearRect(0, 0, 800, 504);
    ctx.drawImage(img, 0, 0);
    let UserTexture = new cc.Texture2D();
    let UserSpriteFrame = new cc.SpriteFrame();

    UserTexture.initWithData(
      // @ts-ignore
      ctx.getImageData(0, 0, 800, 504),
      cc.Texture2D.PixelFormat.RGBA8888,
      800,
      504
    );
    UserSpriteFrame.setTexture(UserTexture);
    Frame.getComponent(cc.Sprite).spriteFrame = UserSpriteFrame;
  };
}
export function Jumpto(node: cc.Node, start: cc.Vec3, end: cc.Vec3, delay: number = 0.3) {
  // let x = start.x - end.x / 2;
  // let y = end.y + 100;
  // if (end.y < start.y) y = start.y + 100;
  // let mid = cc.v2(x, y);
  cc.Tween.stopAllByTarget(node);
  node.stopAllActions();
  node.runAction(cc.jumpTo(delay, cc.v2(end), 200, 0.5));
  // cc.tween(node).bezierTo(delay, cc.v2(start), mid, cc.v2(end)).start();
}
export function getWorldPosition(node: cc.Node) {
  if (node) return node.parent.convertToWorldSpaceAR(node.position);
  else return cc.Vec3.ZERO;
}
export function DisableSpriteComponent(node: cc.Node) {
  if (node && node.getComponent(cc.Sprite)) {
    node.getComponent(cc.Sprite).enabled = false;
  }
}
export function EnableSpriteComponent(node: cc.Node) {
  if (node && node.getComponent(cc.Sprite)) {
    node.getComponent(cc.Sprite).enabled = true;
  }
}
export function resetParticle(node: cc.Node) {
  if (node && node.getComponent(cc.ParticleSystem)) {
    node.active = true;
    node.getComponent(cc.ParticleSystem).resetSystem();
  }
}
export function stopParticle(node: cc.Node) {
  if (node && node.getComponent(cc.ParticleSystem)) {
    node.getComponent(cc.ParticleSystem).stopSystem();
  }
}
export function ScalePopEffect(node: cc.Node, delay: number) {
  node.active = true;
  node.scale = 0;
  cc.tween(node)
    .delay(delay)
    .call(() => {
      AudioManager.getInstance().play("17901001");
    })
    .to(0.2, { scale: 1 }, { easing: cc.easing.bounceOut })
    .start();
}
export function setAnimation(node: cc.Node, name: string, isRepeat: boolean = true) {
  if (node && node.getComponent(sp.Skeleton)) {
    node.getComponent(sp.Skeleton).setAnimation(0, name, isRepeat);
  }
}
export function addAnimation(node: cc.Node, name: string, isRepeat: boolean = true) {
  if (node && node.getComponent(sp.Skeleton)) {
    node.getComponent(sp.Skeleton).addAnimation(0, name, isRepeat);
  }
}
export function preloadScene(scenename: string[]) {
  let stack = scenename;
  const name = stack.shift();
  cc.director.preloadScene(name, () => {
    console.log("Next scene preloaded", name);
    if (stack.length > 0) {
      preloadScene(stack);
    } else {
      console.log("loaded all");
    }
  });
}
