export type MathOperator = '+' | '-'

export type MathProblem = {
  left: number
  right: number
  operator: MathOperator
  answer: number
  options: number[]
}

const MIN_NUMBER = 1
const MAX_NUMBER = 10
const OPTIONS_COUNT = 4

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = randomBetween(0, index)

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
    const candidate = answer + randomBetween(-3, 3)

    if (candidate >= 0 && candidate <= MAX_NUMBER) {
      options.add(candidate)
    }
  }

  return shuffle([...options])
}

function generateAdditionProblem(): MathProblem {
  const left = randomBetween(MIN_NUMBER, MAX_NUMBER - 1)
  const right = randomBetween(MIN_NUMBER, MAX_NUMBER - left)
  const answer = left + right

  return {
    left,
    right,
    operator: '+',
    answer,
    options: createAnswerOptions(answer),
  }
}

function generateSubtractionProblem(): MathProblem {
  const left = randomBetween(2, MAX_NUMBER)
  const right = randomBetween(1, left)
  const answer = left - right

  return {
    left,
    right,
    operator: '-',
    answer,
    options: createAnswerOptions(answer),
  }
}

export function generateMathProblem(): MathProblem {
  return Math.random() < 0.5
    ? generateAdditionProblem()
    : generateSubtractionProblem()
}
