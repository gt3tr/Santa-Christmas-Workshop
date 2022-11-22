import AdManager from "../Promotion/AdManager";
import CocosHelper from "./CocosHelper";

const { ccclass } = cc._decorator;

interface audioPlay {
  audioId: number;
  audioName: string;
  audioVolume: number;
}

@ccclass
export default class AudioManager extends cc.Component {
  audioClipList: Map<string, cc.AudioClip> = new Map();
  audioPlayingList: audioPlay[] = [];
  vocalaudioPlayingList: audioPlay[] = [];
  isMute = false;

  private static instance: AudioManager;
  private volume = 1;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
      AudioManager.instance.init();
    }
    return AudioManager.instance;
  }

  init() {
    this.schedule(this.garbageCollector, 30, Infinity, 0.0);
    let me = this;
    cc.loader.loadResDir("Sound", function (err, assets) {
      for (let i = 0; i < assets.length; i++) {
        if (assets[i] instanceof cc.AudioClip) {
          me.add(assets[i].name, assets[i]);
        }
      }
    });
  }

  /**
   * Adds a new audio clip into the audio manager
   * @param name Name for the source
   * @param audioClip Audio clip source
   */
  add(name: string, audioClip: cc.AudioClip) {
    if (this.audioClipList.has(name)) {
      return;
    }

    this.audioClipList.set(name, audioClip);
  }

  /**
   *  Adds new audio clips into the audio manager
   * @param audioClips
   */
  addAll(audioClips: cc.AudioClip[]) {
    let name = "";

    for (const audioClip of audioClips) {
      name = audioClip.name;

      if (this.audioClipList.has(name)) {
        continue;
      }

      this.audioClipList.set(name, audioClip);
    }
  }

  /**
   * Get audio clip by name
   * @param name The name of the audio clip
   * @returns Audio clip
   */
  get(name: string) {
    const audioClip = this.audioClipList.get(name);

    if (audioClip) {
      return audioClip;
    }

    return undefined;
  }

  /**
   * Remove audio clip by name
   * @param name The name of the audio clip
   */
  remove(name: string) {
    const audioClip = this.audioClipList.get(name);

    if (audioClip) {
      this.audioClipList.delete(name);
    }
  }

  /**
   * Remove all audio clip
   * @param name The name of the audio clip
   */
  removeAll() {
    this.stopAll();

    this.audioClipList.clear();
  }

  /**
   *  Play audio clip
   * @param name The name of the audio clip
   * @param loop Set audio loop
   * @param volume Volume must be in 0.0~1.0
   */
  play(name: string, loop: boolean = false, volume: number = this.volume, isvocal: boolean = false) {
    if (this.isMute) {
      return;
    }
    if (AdManager.getInstance().isAdRunningOrNot()) return;
    if (cc.audioEngine.getEffectsVolume() == 0) return;
    const audioClip = this.audioClipList.get(name);
    if (isvocal) {
      this.stopAllVocal();
    }
    if (loop) this.stop(name);
    if (audioClip) {
      const audioID = cc.audioEngine.play(audioClip, loop, cc.audioEngine.getMusicVolume());
      const audioObj: audioPlay = {
        audioId: audioID,
        audioName: name,
        audioVolume: 1,
      };
      this.audioPlayingList.push(audioObj);
      if (isvocal) {
        this.vocalaudioPlayingList.push(audioObj);
      }
      return cc.audioEngine.getDuration(audioID);
    }
  }
  playVocal(name: string) {
    if (this.isMute) {
      return;
    }
    if (AdManager.getInstance().isAdRunningOrNot()) return;
    if (cc.audioEngine.getEffectsVolume() == 0) return;
    const audioClip = this.audioClipList.get(name);
    if (audioClip) {
      this.stopAllVocal();
      const audioID = cc.audioEngine.play(audioClip, false, cc.audioEngine.getEffectsVolume());
      const audioObj: audioPlay = {
        audioId: audioID,
        audioName: name,
        audioVolume: 1,
      };
      this.vocalaudioPlayingList.push(audioObj);
      return cc.audioEngine.getDuration(audioID);
    }
  }
  playMusic(name: string, loop: boolean = true) {
    const audioClip = this.audioClipList.get(name);
    if (audioClip) {
      cc.audioEngine.playMusic(audioClip, loop);
      // if (CocosHelper.getInstance().isSwitchTab || AdManager.getInstance().isAdRunning()) {
      //   cc.audioEngine.pauseMusic();
      // }
    }
  }
  /**
   * Stop audio clips by name
   * @param name The name of the audio clip
   */
  stop(name: string | string[]) {
    let audioId = -1;
    let audioName = "";
    for (const audioPlaying of this.audioPlayingList) {
      audioId = audioPlaying.audioId;
      audioName = audioPlaying.audioName;
      if (name.includes(audioName)) {
        cc.audioEngine.stop(audioId);
      }
    }
  }
  stopAllVocal() {
    let audioId = -1;
    let audioName = "";
    for (const audioPlaying of this.vocalaudioPlayingList) {
      audioId = audioPlaying.audioId;
      audioName = audioPlaying.audioName;
      cc.audioEngine.stop(audioId);
    }
    this.vocalaudioPlayingList.splice(0, this.vocalaudioPlayingList.length);
  }
  /**
   * Stop all audio clips
   */
  stopAll() {
    cc.audioEngine.stopAllEffects();

    this.audioPlayingList = [];
  }

  /**
   * Pause audio clip by name
   * @param name The name of the audio clip
   */
  pause(name: string) {
    let audioId = -1;
    let audioName = "";

    for (const audioPlaying of this.audioPlayingList) {
      audioId = audioPlaying.audioId;
      audioName = audioPlaying.audioName;

      if (audioName === name && cc.audioEngine.getState(audioId) === cc.audioEngine.AudioState.PLAYING) {
        cc.audioEngine.pause(audioId);

        break;
      }
    }
  }
  isPlaying(name: string) {
    let audioId = -1;
    let audioName = "";
    for (const audioPlaying of this.audioPlayingList) {
      audioId = audioPlaying.audioId;
      audioName = audioPlaying.audioName;
      if (audioName === name && cc.audioEngine.getState(audioId) === cc.audioEngine.AudioState.PLAYING) {
        return true;
      }
    }
    return false;
  }
  /**
   * Pause all audio clip
   */
  pauseAll() {
    cc.audioEngine.pauseAll();
  }

  /**
   * Resume audio clip by name
   * @param name The name of the audio clip
   */
  resume(name: string) {
    let audioId = -1;
    let audioName = "";

    for (const audioPlaying of this.audioPlayingList) {
      audioId = audioPlaying.audioId;
      audioName = audioPlaying.audioName;

      if (audioName === name && cc.audioEngine.getState(audioId) === cc.audioEngine.AudioState.PAUSED) {
        cc.audioEngine.resume(audioId);
        break;
      }
    }
  }
  isPause(name: string) {
    let audioId = -1;
    let audioName = "";

    for (const audioPlaying of this.audioPlayingList) {
      audioId = audioPlaying.audioId;
      audioName = audioPlaying.audioName;

      if (audioName === name && cc.audioEngine.getState(audioId) === cc.audioEngine.AudioState.PAUSED) {
        return true;
      }
    }
    return false;
  }

  /**
   * Resume all audio clip
   */
  resumeAll() {
    cc.audioEngine.resumeAll();
  }

  /**
   * Set audio clip volume by name
   * @param name The name of the audio clip
   * @param volume Volume must be in 0.0~1.0
   */
  setVolume(name: string, volume: number) {
    let audioId = -1;
    let audioName = "";

    for (const audioPlaying of this.audioPlayingList) {
      audioId = audioPlaying.audioId;
      audioName = audioPlaying.audioName;

      if (audioName === name) {
        cc.audioEngine.setVolume(audioId, volume);

        audioPlaying.audioVolume = volume;
        break;
      }
    }
  }

  setAllVolume(volume: number) {
    let audioId = -1;

    for (const audioPlaying of this.audioPlayingList) {
      audioId = audioPlaying.audioId;

      cc.audioEngine.setVolume(audioId, volume);

      audioPlaying.audioVolume = volume;
    }
  }

  /**
   * Mute all audio clip
   */
  mute() {
    this.setAllMute(0);

    this.isMute = true;
  }

  /**
   * Unmute all audio clip
   */
  unMute() {
    this.setAllMute(1);

    this.isMute = false;
  }

  private setAllMute(volume: number) {
    let audioId = -1;

    for (const audioPlaying of this.audioPlayingList) {
      audioId = audioPlaying.audioId;

      cc.audioEngine.setVolume(audioId, volume);
    }
  }

  /**
   * Clear unused audio clips
   */
  private garbageCollector() {
    const len = this.audioPlayingList.length;
    let audioPlaying: audioPlay = null;

    for (let i = len - 1; i >= 0; i--) {
      audioPlaying = this.audioPlayingList[i];

      switch (cc.audioEngine.getState(audioPlaying.audioId)) {
        case cc.audioEngine.AudioState.STOPPED:
        case cc.audioEngine.AudioState.ERROR:
          this.audioPlayingList.splice(i, 1);
          break;
        default:
          break;
      }
    }
  }
}
