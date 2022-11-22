// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

interface StorageValue {
    Key: string;
    Value: string;
}
@ccclass
export default class SessionStorageHelper extends cc.Component {
    static instance: SessionStorageHelper = null;
    Items: StorageValue[] = [];
    static getInstace() {
        if (SessionStorageHelper.instance == null) {
            SessionStorageHelper.instance = new SessionStorageHelper();
        }
        return SessionStorageHelper.instance;
    }
    setItem(key: string, value: string) {
        let isKeyExist = false;
        for (let i = 0; i < this.Items.length; i++) {
            if (this.Items[i].Key == key) {
                isKeyExist = true;
                this.Items[i].Value = value;
                break;
            }
        }
        if (isKeyExist == false) {
            this.Items.push({
                Key: key,
                Value: value,
            });
        }
    }
    getItem(key: string) {
        for (let i = 0; i < this.Items.length; i++) {
            if (this.Items[i].Key == key) {
                return this.Items[i].Value;
                break;
            }
        }
        return undefined;
    }
    removeItem(key: string) {
        for (let i = 0; i < this.Items.length; i++) {
            if (this.Items[i].Key == key) {
                this.Items.splice(i, 1);
                break;
            }
        }
        return undefined;
    }
    removeAllKeys() {
        this.Items.splice(0, this.Items.length);
    }
    // update (dt) {}
}
