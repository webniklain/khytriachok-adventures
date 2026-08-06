export type VoiceCategory =
  | 'greeting'
  | 'correct'
  | 'wrong'
  | 'celebration'

export type UiSoundName =
  | 'click'
  | 'pop'
  | 'star'
  | 'apple'

export type AudioAsset = {
  key: string
  path: string
}

const audioRoot =
  `${import.meta.env.BASE_URL}audio`

export const backgroundMusicAsset: AudioAsset = {
  key: 'music-khytriachok',
  path:
    `${audioRoot}/khytriachok/background/khytriachok.mp3`,
}

export const voiceCatalog: Record<
  VoiceCategory,
  AudioAsset[]
> = {
  greeting: [
    {
      key: 'voice-greeting-01',
      path:
        `${audioRoot}/khytriachok/greetings/hello-01.mp3`,
    },
    {
      key: 'voice-greeting-02',
      path:
        `${audioRoot}/khytriachok/greetings/hello-02.mp3`,
    },
    {
      key: 'voice-greeting-03',
      path:
        `${audioRoot}/khytriachok/greetings/hello-03.mp3`,
    },
  ],

  correct: [
    {
      key: 'voice-correct-01',
      path:
        `${audioRoot}/khytriachok/correct/correct-01.mp3`,
    },
    {
      key: 'voice-correct-02',
      path:
        `${audioRoot}/khytriachok/correct/correct-02.mp3`,
    },
    {
      key: 'voice-correct-03',
      path:
        `${audioRoot}/khytriachok/correct/correct-03.mp3`,
    },
    {
      key: 'voice-correct-04',
      path:
        `${audioRoot}/khytriachok/correct/correct-04.mp3`,
    },
    {
      key: 'voice-correct-05',
      path:
        `${audioRoot}/khytriachok/correct/correct-05.mp3`,
    },
  ],

  wrong: [
    {
      key: 'voice-wrong-01',
      path:
        `${audioRoot}/khytriachok/wrong/wrong-01.mp3`,
    },
    {
      key: 'voice-wrong-02',
      path:
        `${audioRoot}/khytriachok/wrong/wrong-02.mp3`,
    },
    {
      key: 'voice-wrong-03',
      path:
        `${audioRoot}/khytriachok/wrong/wrong-03.mp3`,
    },
  ],

  celebration: [
    {
      key: 'voice-celebration-01',
      path:
        `${audioRoot}/khytriachok/celebration/yay-01.mp3`,
    },
    {
      key: 'voice-celebration-02',
      path:
        `${audioRoot}/khytriachok/celebration/yay-02.mp3`,
    },
    {
      key: 'voice-celebration-03',
      path:
        `${audioRoot}/khytriachok/celebration/yay-03.mp3`,
    },
  ],
}

/*
 * UI-звуки поки не завантажуємо, доки
 * відповідні файли фізично не додані.
 */
export const uiSoundCatalog: Partial<
  Record<UiSoundName, AudioAsset>
> = {}
