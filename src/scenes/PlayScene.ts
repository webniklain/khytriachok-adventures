import Phaser from 'phaser'
import { Hedgehog } from '../entities/Hedgehog'
import {
  generateAdditionProblem,
  type MathProblem,
} from '../math/MathProblem'

type AnswerButton = {
  background: Phaser.GameObjects.Rectangle
  text: Phaser.GameObjects.Text
  value: number
}

export class PlayScene extends Phaser.Scene {
  private problem!: MathProblem
  private problemText!: Phaser.GameObjects.Text
  private feedbackText!: Phaser.GameObjects.Text
  private appleText!: Phaser.GameObjects.Text

  private hedgehogs: Hedgehog[] = []
  private answerButtons: AnswerButton[] = []

  private score = 0
  private isAnswerLocked = false

  constructor() {
    super({
      key: 'PlayScene',
    })
  }

  create(): void {
    this.createBackground()
    this.createHeader()
    this.createProblemPanel()
    this.createAnswerArea()
    this.startNewProblem()
  }

  private createBackground(): void {
    const { width, height } = this.scale

    this.add
      .rectangle(0, 0, width, height, 0xcceeff)
      .setOrigin(0)

    this.add.circle(width - 105, 90, 44, 0xffdf72)

    this.createCloud(155, 105, 1)
    this.createCloud(width - 300, 145, 0.75)

    this.add.ellipse(
      width * 0.23,
      height - 120,
      width * 0.72,
      320,
      0xa9d379,
    )

    this.add.ellipse(
      width * 0.78,
      height - 115,
      width * 0.85,
      340,
      0x92c866,
    )

    this.add
      .rectangle(
        0,
        height * 0.54,
        width,
        height * 0.46,
        0x79b957,
      )
      .setOrigin(0)

    this.add.ellipse(
      width / 2,
      height + 65,
      width * 0.75,
      300,
      0xe4c68c,
    )

    this.createFlowers()
  }

  private createHeader(): void {
    const { width } = this.scale

    this.add
      .text(width / 2, 48, 'Калькулятор їжачків', {
        color: '#294b32',
        fontFamily:
          '"Trebuchet MS", Arial, sans-serif',
        fontSize: '42px',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 7,
      })
      .setOrigin(0.5)

    const scorePanel = this.add.rectangle(
      width - 120,
      55,
      155,
      62,
      0xfff4c8,
      0.95,
    )

    scorePanel.setStrokeStyle(3, 0xe8bd61)

    this.appleText = this.add
      .text(width - 120, 55, '🍎 0', {
        color: '#604624',
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
  }

  private createProblemPanel(): void {
    const { width } = this.scale

    const panel = this.add.rectangle(
      width / 2,
      145,
      410,
      92,
      0xffffff,
      0.9,
    )

    panel.setStrokeStyle(4, 0x9dc77d)

    this.problemText = this.add
      .text(width / 2, 145, '', {
        color: '#294b32',
        fontFamily:
          '"Trebuchet MS", Arial, sans-serif',
        fontSize: '54px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.feedbackText = this.add
      .text(width / 2, 215, '', {
        color: '#31533a',
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
  }

  private createAnswerArea(): void {
    const { width, height } = this.scale
    const startX = width / 2 - 255
    const buttonY = height - 75

    for (let index = 0; index < 4; index += 1) {
      const x = startX + index * 170

      const background = this.add
        .rectangle(
          x,
          buttonY,
          135,
          82,
          0xf7bc58,
        )
        .setStrokeStyle(4, 0xbd702a)
        .setInteractive({
          useHandCursor: true,
        })

      const text = this.add
        .text(x, buttonY, '', {
          color: '#4f351b',
          fontFamily:
            '"Trebuchet MS", Arial, sans-serif',
          fontSize: '42px',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)

      const button: AnswerButton = {
        background,
        text,
        value: 0,
      }

      background.on('pointerover', () => {
        if (!this.isAnswerLocked) {
          background.setScale(1.06)
        }
      })

      background.on('pointerout', () => {
        background.setScale(1)
      })

      background.on('pointerdown', () => {
        this.checkAnswer(button)
      })

      this.answerButtons.push(button)
    }
  }

  private startNewProblem(): void {
    this.isAnswerLocked = false
    this.problem = generateAdditionProblem()

    this.problemText.setText(
      `${this.problem.left} + ${this.problem.right} = ?`,
    )

    this.feedbackText.setText('Порахуй їжачків')
    this.feedbackText.setColor('#31533a')

    this.renderAnswerButtons()
    this.createHedgehogGroups()
  }

  private renderAnswerButtons(): void {
    this.answerButtons.forEach((button, index) => {
      const value = this.problem.options[index]

      button.value = value
      button.text.setText(String(value))
      button.background
        .setFillStyle(0xf7bc58)
        .setStrokeStyle(4, 0xbd702a)
        .setScale(1)
    })
  }

  private createHedgehogGroups(): void {
    this.destroyHedgehogs()

    const { width } = this.scale
    const groupY = 385

    this.createGroup(
      this.problem.left,
      width * 0.25,
      groupY,
      'right',
    )

    this.createGroup(
      this.problem.right,
      width * 0.75,
      groupY,
      'left',
    )
  }

  private createGroup(
    count: number,
    centerX: number,
    y: number,
    direction: 'left' | 'right',
  ): void {
    const spacing = count >= 5 ? 74 : 86
    const totalWidth = (count - 1) * spacing
    const startX = centerX - totalWidth / 2

    for (let index = 0; index < count; index += 1) {
      const hedgehog = new Hedgehog(this, {
        x: startX + index * spacing,
        y: y + (index % 2) * 8,
        scale: count >= 5 ? 0.55 : 0.66,
        direction,
      })

      this.hedgehogs.push(hedgehog)

      this.tweens.add({
        targets: hedgehog,
        x:
          hedgehog.x +
          (direction === 'right' ? 26 : -26),
        duration: 2200 + index * 90,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }
  }

  private checkAnswer(button: AnswerButton): void {
    if (this.isAnswerLocked) {
      return
    }

    if (button.value === this.problem.answer) {
      this.handleCorrectAnswer(button)
      return
    }

    this.handleWrongAnswer(button)
  }

  private handleCorrectAnswer(
    button: AnswerButton,
  ): void {
    this.isAnswerLocked = true
    this.score += 1

    this.appleText.setText(`🍎 ${this.score}`)
    this.feedbackText
      .setText('Фир-р-р! Правильно!')
      .setColor('#28743a')

    button.background
      .setFillStyle(0x9ddc7a)
      .setStrokeStyle(4, 0x4f9d54)

    this.hedgehogs.forEach((hedgehog) => {
      hedgehog.celebrate()
    })

    this.time.delayedCall(1400, () => {
      this.startNewProblem()
    })
  }

  private handleWrongAnswer(
    button: AnswerButton,
  ): void {
    this.feedbackText
      .setText('Порахуй ще раз')
      .setColor('#9b552f')

    button.background
      .setFillStyle(0xf3a392)
      .setStrokeStyle(4, 0xb96355)

    this.hedgehogs.forEach((hedgehog) => {
      hedgehog.reactToMistake()
    })

    this.time.delayedCall(650, () => {
      button.background
        .setFillStyle(0xf7bc58)
        .setStrokeStyle(4, 0xbd702a)

      this.feedbackText
        .setText('Спробуй іншу відповідь')
        .setColor('#31533a')
    })
  }

  private destroyHedgehogs(): void {
    this.hedgehogs.forEach((hedgehog) => {
      hedgehog.destroy()
    })

    this.hedgehogs = []
  }

  private createCloud(
    x: number,
    y: number,
    scale: number,
  ): void {
    const cloud = this.add.container(x, y)

    cloud.add([
      this.add.circle(-45, 12, 27, 0xffffff, 0.9),
      this.add.circle(-12, -2, 39, 0xffffff, 0.92),
      this.add.circle(28, 8, 31, 0xffffff, 0.9),
      this.add.circle(58, 17, 23, 0xffffff, 0.88),
    ])

    cloud.setScale(scale)

    this.tweens.add({
      targets: cloud,
      x: x + 35,
      duration: 7000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
  }

  private createFlowers(): void {
    const positions = [
      [90, 485],
      [195, 535],
      [350, 500],
      [925, 505],
      [1080, 545],
      [1185, 490],
    ]

    positions.forEach(([x, y], index) => {
      const flower = this.add.container(x, y)

      const color =
        index % 3 === 0
          ? 0xffef8a
          : index % 3 === 1
            ? 0xffffff
            : 0xffb3c7

      flower.add([
        this.add.rectangle(0, 18, 5, 38, 0x43843f),
        this.add.circle(-8, 0, 8, color),
        this.add.circle(8, 0, 8, color),
        this.add.circle(0, -8, 8, color),
        this.add.circle(0, 8, 8, color),
        this.add.circle(0, 0, 6, 0xe59b38),
      ])
    })
  }
}