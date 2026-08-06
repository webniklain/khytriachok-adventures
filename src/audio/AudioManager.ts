import Phaser from 'phaser'

import {
  backgroundMusicAsset,
  uiSoundCatalog,
  voiceCatalog,
  type UiSoundName,
  type VoiceCategory,
} from './audioCatalog'

type AudioSettings = {
  voiceEnabled: boolean
  effectsEnabled: boolean
  musicEnabled: boolean
  voiceVolume: number
  effectsVolume: number
  musicVolume: number
}

type VoiceCallback = () => void

type VolumeSound = Phaser.Sound.BaseSound & {
  volume: number
}

const SETTINGS_KEY =
  'khytriachok-audio-settings'

const DEFAULT_SETTINGS: AudioSettings = {
  voiceEnabled: true,
  effectsEnabled: true,
  musicEnabled: true,
  voiceVolume: 0.78,
  effectsVolume: 0.55,
  musicVolume: 0.12,
}

export class AudioManager {
  private scene: Phaser.Scene | null = null

  private backgroundMusic:
    Phaser.Sound.BaseSound | null = null

  private activeVoice:
    Phaser.Sound.BaseSound | null = null

  private settings: AudioSettings

  private lastVoiceByCategory =
    new Map<VoiceCategory, string>()

  private isMusicDucked = false

  constructor() {
    this.settings = this.loadSettings()
  }

  public static preload(
    scene: Phaser.Scene,
  ): void {
    scene.load.audio(
      backgroundMusicAsset.key,
      backgroundMusicAsset.path,
    )

    Object.values(voiceCatalog)
      .flat()
      .forEach((asset) => {
        scene.load.audio(
          asset.key,
          asset.path,
        )
      })

    Object.values(uiSoundCatalog)
      .filter(
        (asset): asset is NonNullable<
          typeof asset
        > => Boolean(asset),
      )
      .forEach((asset) => {
        scene.load.audio(
          asset.key,
          asset.path,
        )
      })
  }

  public initialize(
    scene: Phaser.Scene,
  ): void {
    this.scene = scene

    /*
     * Scene може бути перезапущена.
     * Повторно використовуємо музику лише
     * якщо вона належить актуальному manager.
     */
    if (
      this.backgroundMusic &&
      this.backgroundMusic.manager !==
        scene.sound
    ) {
      this.backgroundMusic.destroy()
      this.backgroundMusic = null
    }
  }

  public unlock(): void {
    this.scene?.sound.unlock()
  }

  public playBackgroundMusic(): void {
    const scene = this.scene

    if (
      !scene ||
      !this.settings.musicEnabled
    ) {
      return
    }

    this.unlock()

    if (!this.backgroundMusic) {
      this.backgroundMusic =
        scene.sound.add(
          backgroundMusicAsset.key,
          {
            loop: true,
            volume: 0,
          },
        )
    }

    const music = this.backgroundMusic

    if (!music.isPlaying) {
      const started = music.play({
        loop: true,
        volume: 0,
      })

      if (!started) {
        scene.sound.once(
          Phaser.Sound.Events.UNLOCKED,
          () => {
            this.playBackgroundMusic()
          },
        )

        return
      }
    }

    this.fadeSoundVolume(
      music,
      this.isMusicDucked
        ? this.getDuckedMusicVolume()
        : this.settings.musicVolume,
      700,
    )
  }

  public stopBackgroundMusic(): void {
    if (!this.backgroundMusic) {
      return
    }

    this.backgroundMusic.stop()
    this.backgroundMusic.destroy()
    this.backgroundMusic = null
  }

  public playGreeting(
    onComplete?: VoiceCallback,
  ): void {
    this.playRandomVoice(
      'greeting',
      onComplete,
    )
  }

  public playRandomCorrect(): void {
    this.playRandomVoice('correct')
  }

  public playRandomWrong(): void {
    this.playRandomVoice('wrong')
  }

  public playCelebration(): void {
    this.playRandomVoice('celebration')
  }

  public playUi(
    name: UiSoundName,
  ): void {
    const scene = this.scene
    const asset = uiSoundCatalog[name]

    if (
      !scene ||
      !asset ||
      !this.settings.effectsEnabled
    ) {
      return
    }

    scene.sound.play(
      asset.key,
      {
        volume:
          this.settings.effectsVolume,
      },
    )
  }

  public stopVoice(): void {
    const voice = this.activeVoice

    if (!voice) {
      return
    }

    /*
     * ???????? ???????? ?????????.
     * ?? ??????? ??? ?????????? ?????????,
     * ???? STOP ???? ?????????? ?????????.
     */
    this.activeVoice = null

    /*
     * ??? ?????? ??????? ?? ??????????
     * ?????????? COMPLETE ? STOP ????????
     * ????????? ??? ????? ????.
     */
    voice.removeAllListeners(
      Phaser.Sound.Events.COMPLETE,
    )

    voice.removeAllListeners(
      Phaser.Sound.Events.STOP,
    )

    if (voice.isPlaying) {
      voice.stop()
    }

    voice.destroy()
    this.restoreBackgroundMusic()
  }

  public getSettings(): AudioSettings {
    return {
      ...this.settings,
    }
  }

  public setMusicEnabled(
    enabled: boolean,
  ): void {
    this.settings.musicEnabled = enabled

    if (enabled) {
      this.playBackgroundMusic()
    } else {
      this.stopBackgroundMusic()
    }

    this.saveSettings()
  }

  public setVoiceEnabled(
    enabled: boolean,
  ): void {
    this.settings.voiceEnabled = enabled

    if (!enabled) {
      this.stopVoice()
    }

    this.saveSettings()
  }

  public setEffectsEnabled(
    enabled: boolean,
  ): void {
    this.settings.effectsEnabled = enabled
    this.saveSettings()
  }

  public setMusicVolume(
    volume: number,
  ): void {
    this.settings.musicVolume =
      this.clampVolume(volume)

    if (this.backgroundMusic) {
      ;(this.backgroundMusic as VolumeSound).volume =
        this.isMusicDucked
          ? this.getDuckedMusicVolume()
          : this.settings.musicVolume
    }

    this.saveSettings()
  }

  public setVoiceVolume(
    volume: number,
  ): void {
    this.settings.voiceVolume =
      this.clampVolume(volume)

    if (this.activeVoice) {
      ;(this.activeVoice as VolumeSound).volume =
        this.settings.voiceVolume
    }

    this.saveSettings()
  }

  private playRandomVoice(
    category: VoiceCategory,
    onComplete?: VoiceCallback,
  ): void {
    const scene = this.scene

    if (
      !scene ||
      !this.settings.voiceEnabled
    ) {
      onComplete?.()
      return
    }

    const candidates =
      voiceCatalog[category]

    if (candidates.length === 0) {
      onComplete?.()
      return
    }

    this.stopVoice()

    const selected =
      this.selectNonRepeating(
        category,
        candidates.map(
          (candidate) => candidate.key,
        ),
      )

    const voice = scene.sound.add(
      selected,
      {
        volume:
          this.settings.voiceVolume,
      },
    )

    this.activeVoice = voice
    this.duckBackgroundMusic()

    let completed = false

    const finish = (): void => {
      if (completed) {
        return
      }

      completed = true

      if (this.activeVoice === voice) {
        this.activeVoice = null
      }

      voice.destroy()
      this.restoreBackgroundMusic()
      onComplete?.()
    }

    voice.once(
      Phaser.Sound.Events.COMPLETE,
      finish,
    )

    voice.once(
      Phaser.Sound.Events.STOP,
      finish,
    )

    const started = voice.play()

    if (!started) {
      finish()
    }
  }

  private duckBackgroundMusic(): void {
    this.isMusicDucked = true

    if (!this.backgroundMusic) {
      return
    }

    this.fadeSoundVolume(
      this.backgroundMusic,
      this.getDuckedMusicVolume(),
      180,
    )
  }

  private restoreBackgroundMusic(): void {
    this.isMusicDucked = false

    if (!this.backgroundMusic) {
      return
    }

    this.fadeSoundVolume(
      this.backgroundMusic,
      this.settings.musicVolume,
      420,
    )
  }

  private getDuckedMusicVolume(): number {
    return Math.min(
      0.025,
      this.settings.musicVolume * 0.22,
    )
  }

  private fadeSoundVolume(
    sound: Phaser.Sound.BaseSound,
    targetVolume: number,
    duration: number,
  ): void {
    const scene = this.scene

    if (!scene) {
      ;(sound as VolumeSound).volume =
        this.clampVolume(targetVolume)

      return
    }

    scene.tweens.killTweensOf(sound)

    scene.tweens.add({
      targets: sound,
      volume: this.clampVolume(
        targetVolume,
      ),
      duration,
      ease: 'Sine.InOut',
    })
  }

  private selectNonRepeating(
    category: VoiceCategory,
    candidates: string[],
  ): string {
    if (candidates.length === 1) {
      return candidates[0]
    }

    const previous =
      this.lastVoiceByCategory.get(category)

    const available = candidates.filter(
      (candidate) =>
        candidate !== previous,
    )

    const selected =
      available[
        Math.floor(
          Math.random() *
            available.length,
        )
      ]

    this.lastVoiceByCategory.set(
      category,
      selected,
    )

    return selected
  }

  private clampVolume(
    volume: number,
  ): number {
    return Math.min(
      1,
      Math.max(0, volume),
    )
  }

  private loadSettings(): AudioSettings {
    try {
      const stored =
        localStorage.getItem(SETTINGS_KEY)

      if (!stored) {
        return {
          ...DEFAULT_SETTINGS,
        }
      }

      const parsed = JSON.parse(
        stored,
      ) as Partial<AudioSettings>

      return {
        voiceEnabled:
          parsed.voiceEnabled ??
          DEFAULT_SETTINGS.voiceEnabled,

        effectsEnabled:
          parsed.effectsEnabled ??
          DEFAULT_SETTINGS.effectsEnabled,

        musicEnabled:
          parsed.musicEnabled ??
          DEFAULT_SETTINGS.musicEnabled,

        voiceVolume:
          typeof parsed.voiceVolume ===
          'number'
            ? this.clampVolume(
                parsed.voiceVolume,
              )
            : DEFAULT_SETTINGS.voiceVolume,

        effectsVolume:
          typeof parsed.effectsVolume ===
          'number'
            ? this.clampVolume(
                parsed.effectsVolume,
              )
            : DEFAULT_SETTINGS.effectsVolume,

        musicVolume:
          typeof parsed.musicVolume ===
          'number'
            ? this.clampVolume(
                parsed.musicVolume,
              )
            : DEFAULT_SETTINGS.musicVolume,
      }
    } catch {
      return {
        ...DEFAULT_SETTINGS,
      }
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(this.settings),
      )
    } catch {
      // Storage can be unavailable.
    }
  }
}

export const audioManager =
  new AudioManager()
