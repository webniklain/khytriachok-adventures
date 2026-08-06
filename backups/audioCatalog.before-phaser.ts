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

const audioRoot =
  `${import.meta.env.BASE_URL}audio`

export const voiceCatalog: Record<
  VoiceCategory,
  string[]
> = {
  greeting: [
    `${audioRoot}/khytriachok/greetings/hello-01.mp3`,
    `${audioRoot}/khytriachok/greetings/hello-02.mp3`,
    `${audioRoot}/khytriachok/greetings/hello-03.mp3`,
  ],

  correct: [
    `${audioRoot}/khytriachok/correct/correct-01.mp3`,
    `${audioRoot}/khytriachok/correct/correct-02.mp3`,
    `${audioRoot}/khytriachok/correct/correct-03.mp3`,
    `${audioRoot}/khytriachok/correct/correct-04.mp3`,
    `${audioRoot}/khytriachok/correct/correct-05.mp3`,
  ],

  wrong: [
    `${audioRoot}/khytriachok/wrong/wrong-01.mp3`,
    `${audioRoot}/khytriachok/wrong/wrong-02.mp3`,
    `${audioRoot}/khytriachok/wrong/wrong-03.mp3`,
  ],

  celebration: [
    `${audioRoot}/khytriachok/celebration/yay-01.mp3`,
    `${audioRoot}/khytriachok/celebration/yay-02.mp3`,
    `${audioRoot}/khytriachok/celebration/yay-03.mp3`,
  ],
}

export const uiSoundCatalog: Record<
  UiSoundName,
  string
> = {
  click: `${audioRoot}/ui/click.mp3`,
  pop: `${audioRoot}/ui/pop.mp3`,
  star: `${audioRoot}/ui/star.mp3`,
  apple: `${audioRoot}/ui/apple.mp3`,
}
