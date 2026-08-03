import Phaser from 'phaser'

export type MathOperator = '+'

export type MathProblem = {
  left: number
  right: number
  operator: MathOperator
  answer: number
  options: number[]
}

const MIN_NUMBER = 1
const MAX_TOTAL = 10
const OPTIONS_COUNT = 4

function shuffle<T>(items: T[]): T[] {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))

    ;[result[index], result[randomIndex]] = [
      result[randomIndex],
      result[index],
    ]
  }

  return result
}

function createAnswerOptions(answer: number): number[] {
  const options = new Set<number>([answer])

  while (options.size < OPTIONS_COUNT) {
    const offset = Math.floor(Math.random() * 7) - 3
    const candidate = answer + offset

    if (candidate >= 0 && candidate <= MAX_TOTAL) {
      options.add(candidate)
    }
  }

  return shuffle([...options])
}

export function generateAdditionProblem(): MathProblem {
  const left = Phaser.Math.Between(MIN_NUMBER, MAX_TOTAL - 1)
  const right = Phaser.Math.Between(
    MIN_NUMBER,
    MAX_TOTAL - left,
  )

  const answer = left + right

  return {
    left,
    right,
    operator: '+',
    answer,
    options: createAnswerOptions(answer),
  }
}