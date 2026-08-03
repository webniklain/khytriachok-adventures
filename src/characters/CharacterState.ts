export const CharacterState = {
  Idle: 'idle',
  Walking: 'walking',
  Thinking: 'thinking',
  Celebrating: 'celebrating',
  Mistake: 'mistake',
  Sleeping: 'sleeping',
} as const

export type CharacterState =
  (typeof CharacterState)[keyof typeof CharacterState]
