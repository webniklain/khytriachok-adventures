import {
  uiSoundCatalog,
  voiceCatalog,
  type UiSoundName,
  type VoiceCategory,
} from './audioCatalog'

type AudioSettings = {
  voiceEnabled: boolean
  effectsEnabled: boolean
  volume: number
}

const SETTINGS_KEY =
  'khytriachok-audio-settings'

const DEFAULT_SETTINGS: AudioSettings = {
  voiceEnabled: true,
  effectsEnabled: true,
  volume: 0.75,
}

export class AudioManager {
  private settings: AudioSettings

  private activeVoice: HTMLAudioElement | null =
    null

  private backgroundMusic:
    HTMLAudioElement | null = null

  private musicFadeFrame:
    number | null = null

  private readonly normalMusicVolume =
    0.14

  private readonly duckedMusicVolume =
    0.025

  private lastVoiceByCategory =
    new Map<VoiceCategory, string>()

  constructor() {
    this.settings = this.loadSettings()
  }

  public getSettings(): AudioSettings {
    return {
      ...this.settings,
    }
  }

  public setVolume(volume: number): void {
    this.settings.volume = Math.min(
      1,
      Math.max(0, volume),
    )

    if (this.activeVoice) {
      this.activeVoice.volume =
        this.settings.volume
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

  public playGreeting(): void {
    void this.playRandomVoice('greeting')
  }

  public playRandomCorrect(): void {
    void this.playRandomVoice('correct')
  }

  public playRandomWrong(): void {
    void this.playRandomVoice('wrong')
  }

  public playCelebration(): void {
    void this.playRandomVoice(
      'celebration',
    )
  }

  public playUi(name: UiSoundName): void {
    if (!this.settings.effectsEnabled) {
      return
    }

    const sound = new Audio(
      uiSoundCatalog[name],
    )

    sound.volume = this.settings.volume

    void sound.play().catch(() => {
      /*
       * Файл може ще не існувати або браузер
       * може блокувати звук до першого натискання.
       * Гра при цьому продовжує працювати.
       */
    })
  }

  public playBackgroundMusic(): void {
    if (this.backgroundMusic) {
      if (this.backgroundMusic.paused) {
        void this.backgroundMusic
          .play()
          .catch(() => {
            // Playback may be blocked by browser.
          })
      }

      this.fadeMusicTo(
        this.normalMusicVolume,
        700,
      )

      return
    }

    const music = new Audio(
      `${import.meta.env.BASE_URL}audio/khytriachok/background/khytriachok.mp3`,
    )

    music.loop = true
    music.preload = 'auto'
    music.volume = 0

    this.backgroundMusic = music

    void music
      .play()
      .then(() => {
        this.fadeMusicTo(
          this.normalMusicVolume,
          900,
        )
      })
      .catch(() => {
        /*
         * The game keeps working even when
         * the browser blocks playback.
         */
      })
  }

  public stopBackgroundMusic(): void {
    if (!this.backgroundMusic) {
      return
    }

    this.cancelMusicFade()

    this.backgroundMusic.pause()
    this.backgroundMusic.currentTime = 0
    this.backgroundMusic = null
  }

  private duckBackgroundMusic(): void {
    this.fadeMusicTo(
      this.duckedMusicVolume,
      180,
    )
  }

  private restoreBackgroundMusic(): void {
    this.fadeMusicTo(
      this.normalMusicVolume,
      420,
    )
  }

  private fadeMusicTo(
    targetVolume: number,
    duration: number,
  ): void {
    const music = this.backgroundMusic

    if (!music) {
      return
    }

    this.cancelMusicFade()

    const startVolume = music.volume
    const target = Math.min(
      1,
      Math.max(0, targetVolume),
    )

    const startTime = performance.now()
    const safeDuration = Math.max(
      1,
      duration,
    )

    const update = (now: number): void => {
      if (!this.backgroundMusic) {
        this.musicFadeFrame = null
        return
      }

      const progress = Math.min(
        1,
        (now - startTime) / safeDuration,
      )

      this.backgroundMusic.volume =
        startVolume +
        (target - startVolume) * progress

      if (progress < 1) {
        this.musicFadeFrame =
          requestAnimationFrame(update)

        return
      }

      this.backgroundMusic.volume =
        target

      this.musicFadeFrame = null
    }

    this.musicFadeFrame =
      requestAnimationFrame(update)
  }

  private cancelMusicFade(): void {
    if (this.musicFadeFrame === null) {
      return
    }

    cancelAnimationFrame(
      this.musicFadeFrame,
    )

    this.musicFadeFrame = null
  }

  public stopVoice(): void {
    if (!this.activeVoice) {
      return
    }

    this.activeVoice.pause()
    this.activeVoice.currentTime = 0
    this.activeVoice = null
  }

  private async playRandomVoice(
    category: VoiceCategory,
  ): Promise<void> {
    if (!this.settings.voiceEnabled) {
      return
    }

    const candidates =
      voiceCatalog[category]

    if (candidates.length === 0) {
      return
    }

    const selected =
      this.selectNonRepeating(
        category,
        candidates,
      )

    this.stopVoice()

    this.duckBackgroundMusic()

    const voice = new Audio(selected)

    voice.volume = this.settings.volume
    voice.preload = 'auto'

    this.activeVoice = voice

    voice.addEventListener(
      'ended',
      () => {
        if (this.activeVoice === voice) {
          this.activeVoice = null
        }

        this.restoreBackgroundMusic()
      },
      {
        once: true,
      },
    )

    try {
      await voice.play()
    } catch {
      if (this.activeVoice === voice) {
        this.activeVoice = null
      }

      

      this.restoreBackgroundMusic()
/*
       * Не перериваємо гру через відсутній файл
       * або обмеження автозапуску браузера.
       */
    }
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
          Math.random() * available.length,
        )
      ]

    this.lastVoiceByCategory.set(
      category,
      selected,
    )

    return selected
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

      const parsed =
        JSON.parse(stored) as Partial<AudioSettings>

      return {
        voiceEnabled:
          parsed.voiceEnabled ??
          DEFAULT_SETTINGS.voiceEnabled,

        effectsEnabled:
          parsed.effectsEnabled ??
          DEFAULT_SETTINGS.effectsEnabled,

        volume:
          typeof parsed.volume === 'number'
            ? Math.min(
                1,
                Math.max(0, parsed.volume),
              )
            : DEFAULT_SETTINGS.volume,
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
      /*
       * У приватному режимі сховище іноді
       * недоступне. Це не повинно ламати гру.
       */
    }
  }
}

export const audioManager =
  new AudioManager()
