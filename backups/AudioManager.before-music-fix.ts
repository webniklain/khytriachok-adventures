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
