import Phaser from 'phaser'
import { Khytriachok } from '../characters/Khytriachok'
import {
  AudioManager,
  audioManager,
} from '../audio/AudioManager'
import {
  generateMathProblem,
  type MathProblem,
} from '../math/MathProblem'

type AnswerButton = {
  root: Phaser.GameObjects.Container
  shadow: Phaser.GameObjects.Arc
  bark: Phaser.GameObjects.Arc
  background: Phaser.GameObjects.Arc
  rings: Phaser.GameObjects.Graphics
  hitTarget: Phaser.GameObjects.Arc
  text: Phaser.GameObjects.Text
  value: number
}

export class PlayScene extends Phaser.Scene {
  private problem!: MathProblem
  private problemText!: Phaser.GameObjects.Text
  private feedbackText!: Phaser.GameObjects.Text
  private appleText!: Phaser.GameObjects.Text

  private hedgehogs: Khytriachok[] = []
  private answerButtons: AnswerButton[] = []

  private score = 0
  private isAnswerLocked = false

  constructor() {
    super({
      key: 'PlayScene',
    })
  }

  preload(): void {
    AudioManager.preload(this)

    this.load.image(
      'welcome-khytriachok',
      `${import.meta.env.BASE_URL}icons/icon-source.png`,
    )
  }

  create(): void {
    audioManager.initialize(this)

    this.createBackground()
    this.createHeader()
    this.createProblemPanel()
    this.createAnswerArea()
    this.createStartScreen()
  }

  private createStartScreen(): void {
    const { width, height } = this.scale
this.answerButtons.forEach((button) => {
      button.hitTarget.disableInteractive()
      button.root.setVisible(false)
    })

    this.problemText.setText('')
    this.feedbackText.setText('')

    const overlay = this.add
      .rectangle(
        0,
        0,
        width,
        height,
        0x163a30,
        0.48,
      )
      .setOrigin(0)
      .setDepth(900)
      .setInteractive()

    const panelWidth = Math.min(
      width - 150,
      1120,
    )

    const panelHeight = 430
    const panelX = width / 2
    const panelY = height / 2 + 5

    const panelShadow = this.add
      .rectangle(
        panelX,
        panelY + 16,
        panelWidth,
        panelHeight,
        0x254829,
        0.32,
      )
      .setDepth(901)

    const panel = this.add
      .rectangle(
        panelX,
        panelY,
        panelWidth,
        panelHeight,
        0xfff7dc,
        1,
      )
      .setStrokeStyle(
        8,
        0x78a94c,
      )
      .setDepth(902)

    /*
     * ???????????? ???????????? ??????????.
     */
    const dividerX =
      panelX - 40

    const divider = this.add
      .rectangle(
        dividerX,
        panelY,
        4,
        panelHeight - 70,
        0xa8c880,
        0.75,
      )
      .setDepth(903)

    /*
     * ???? ???????: ????????? ???? ????????.
     */
    const imageCenterX =
      panelX - panelWidth * 0.27

    const imageFrameShadow = this.add
      .rectangle(
        imageCenterX,
        panelY + 10,
        318,
        318,
        0x35552f,
        0.28,
      )
      .setDepth(903)

    const imageFrame = this.add
      .rectangle(
        imageCenterX,
        panelY,
        318,
        318,
        0xffffff,
        1,
      )
      .setStrokeStyle(
        7,
        0x7caf54,
      )
      .setDepth(904)

    const hedgehogImage = this.add
      .image(
        imageCenterX,
        panelY,
        'welcome-khytriachok',
      )
      .setDisplaySize(
        294,
        294,
      )
      .setDepth(905)

    /*
     * ????? ???????: ?????????? ?? ??????.
     */
    const contentX =
      panelX + panelWidth * 0.23

    const title = this.add
      .text(
        contentX,
        panelY - 125,
        'Привіт!',
        {
          color: '#294b32',
          fontFamily:
            '"Trebuchet MS", Arial, sans-serif',
          fontSize: '56px',
          fontStyle: 'bold',
          stroke: '#ffffff',
          strokeThickness: 6,
        },
      )
      .setOrigin(0.5)
      .setDepth(904)

    const subtitleText = [
      'Я — Їжачок Хитрячок!',
      'Давай рахувати',
      'та веселитися разом!',
    ].join('\n')

    const subtitle = this.add
      .text(
        contentX,
        panelY - 32,
        subtitleText,
        {
          color: '#45623d',
          fontFamily:
            '"Trebuchet MS", Arial, sans-serif',
          fontSize: '29px',
          fontStyle: 'bold',
          align: 'center',
          lineSpacing: 9,
        },
      )
      .setOrigin(0.5)
      .setDepth(904)

    const buttonY =
      panelY + 125

    const buttonShadow = this.add
      .ellipse(
        contentX,
        buttonY + 12,
        270,
        88,
        0x4b2d18,
        0.4,
      )
      .setDepth(903)

    const playButton = this.add
      .ellipse(
        contentX,
        buttonY,
        270,
        88,
        0x80bd50,
        1,
      )
      .setStrokeStyle(
        6,
        0x3d7c3b,
      )
      .setDepth(904)

    const playText = this.add
      .text(
        contentX,
        buttonY - 3,
        'Грати',
        {
          color: '#ffffff',
          fontFamily:
            '"Trebuchet MS", Arial, sans-serif',
          fontSize: '43px',
          fontStyle: 'bold',
          stroke: '#356b35',
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5)
      .setDepth(905)

    /*
     * ?????? ??????? ???? ?????????? ??????
     * ?????? ? ??????. ??? ?????????? ?????????
     * ?????? ?? ??????????.
     */
    const playHitTarget = this.add
      .ellipse(
        contentX,
        buttonY,
        286,
        102,
        0xffffff,
        0.001,
      )
      .setDepth(906)
      .setInteractive({
        useHandCursor: true,
      })

    const startObjects = [
      panelShadow,
      panel,
      divider,
      imageFrameShadow,
      imageFrame,
      hedgehogImage,
      title,
      subtitle,
      buttonShadow,
      playButton,
      playText,
      playHitTarget,
    ]

    let hasStarted = false

    const startGame = (): void => {
      if (hasStarted) {
        return
      }

      hasStarted = true
      playHitTarget.disableInteractive()

      audioManager.unlock()
      audioManager.playBackgroundMusic()
      audioManager.playUi('click')

      /*
       * ?????? ??????? ?????????? ????
       * ????? ?????????? ??????????.
       */
      audioManager.playGreeting(() => {
        this.tweens.add({
          targets: startObjects,
          alpha: 0,
          scaleX: 0.96,
          scaleY: 0.96,
          duration: 320,
          ease: 'Sine.In',
        })

        this.tweens.add({
          targets: overlay,
          alpha: 0,
          duration: 380,
          ease: 'Sine.Out',
          onComplete: () => {
            startObjects.forEach(
              (item) => {
                item.destroy()
              },
            )

            overlay.destroy()

            this.answerButtons.forEach(
              (button) => {
                button.root.setVisible(true)
              },
            )

            this.startNewProblem()
          },
        })
      })
    }

    playHitTarget.on('pointerover', () => {
      if (hasStarted) {
        return
      }

      this.tweens.killTweensOf([
        playButton,
        playText,
        buttonShadow,
      ])

      this.tweens.add({
        targets: [
          playButton,
          playText,
        ],
        scaleX: 1.06,
        scaleY: 1.06,
        duration: 130,
        ease: 'Back.Out',
      })

      this.tweens.add({
        targets: buttonShadow,
        scaleX: 1.04,
        scaleY: 1.04,
        duration: 130,
        ease: 'Back.Out',
      })
    })

    playHitTarget.on('pointerout', () => {
      if (hasStarted) {
        return
      }

      this.tweens.killTweensOf([
        playButton,
        playText,
        buttonShadow,
      ])

      this.tweens.add({
        targets: [
          playButton,
          playText,
          buttonShadow,
        ],
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: 'Sine.Out',
      })
    })

    playHitTarget.on('pointerdown', () => {
      /*
       * ?????????? ??? ??????.
       * pointerout ?????? ?? ???? ????????? ??????.
       */
      startGame()
    })
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
      .text(width / 2, 48, '\u041f\u0440\u0438\u0433\u043e\u0434\u0438 \u0407\u0436\u0430\u0447\u043a\u0430 \u0425\u0438\u0442\u0440\u044f\u0447\u043a\u0430', {
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

    const spacing = 184
    const startX = width / 2 - (spacing * 3) / 2
    const buttonY = height - 82

    for (let index = 0; index < 4; index += 1) {
      const x = startX + index * spacing
      const root = this.add.container(x, buttonY)

      const shadow = this.add.circle(
        0,
        11,
        62,
        0x58331c,
        0.42,
      )

      const bark = this.add.circle(
        0,
        1,
        61,
        0x985325,
      )

      bark.setStrokeStyle(5, 0x603216)

      const background = this.add
        .circle(
          0,
          -5,
          52,
          0xf4bd67,
        )
        .setStrokeStyle(3, 0xd58a3a)

      const rings = this.add.graphics()

      rings.lineStyle(2, 0xd68d3b, 0.52)
      rings.strokeCircle(0, -5, 39)
      rings.strokeCircle(0, -5, 29)

      rings.lineStyle(2, 0xb96c2f, 0.42)
      rings.beginPath()
      rings.arc(
        0,
        -5,
        19,
        Phaser.Math.DegToRad(25),
        Phaser.Math.DegToRad(300),
      )
      rings.strokePath()

      const crack = this.add.graphics()

      crack.lineStyle(3, 0xaa622d, 0.6)
      crack.beginPath()
      crack.moveTo(34, -31)
      crack.lineTo(25, -22)
      crack.lineTo(30, -12)
      crack.strokePath()

      const text = this.add
        .text(0, -5, '', {
          color: '#4b2d17',
          fontFamily:
            '"Trebuchet MS", Arial, sans-serif',
          fontSize: '48px',
          fontStyle: 'bold',
          stroke: '#ffe5ad',
          strokeThickness: 2,
        })
        .setOrigin(0.5)

      /*
       * Майже невидиме коло поверх усіх деталей.
       * Alpha не ставимо в 0, щоб Phaser гарантовано
       * залишав об'єкт у системі вводу.
       */
      const hitTarget = this.add
        .circle(
          0,
          0,
          64,
          0xffffff,
          0.001,
        )
        .setInteractive({
          useHandCursor: true,
        })

      root.add([
        shadow,
        bark,
        background,
        rings,
        crack,
        text,
        hitTarget,
      ])

      const button: AnswerButton = {
        root,
        shadow,
        bark,
        background,
        rings,
        hitTarget,
        text,
        value: 0,
      }

      hitTarget.on('pointerover', () => {
        if (this.isAnswerLocked) {
          return
        }

        this.tweens.killTweensOf(root)

        this.tweens.add({
          targets: root,
          scaleX: 1.07,
          scaleY: 1.07,
          y: buttonY - 5,
          duration: 120,
          ease: 'Back.Out',
        })
      })

      hitTarget.on('pointerout', () => {
        if (this.isAnswerLocked) {
          return
        }

        this.tweens.killTweensOf(root)

        this.tweens.add({
          targets: root,
          scaleX: 1,
          scaleY: 1,
          y: buttonY,
          duration: 120,
          ease: 'Sine.Out',
        })
      })

      hitTarget.on('pointerdown', () => {
        if (this.isAnswerLocked) {
          return
        }

        audioManager.playUi('click')
        this.checkAnswer(button)
        this.tweens.killTweensOf(root)

        this.tweens.add({
          targets: root,
          scaleX: 0.91,
          scaleY: 0.82,
          y: buttonY + 10,
          duration: 85,
          ease: 'Sine.In',
          onComplete: () => {
            this.tweens.add({
              targets: root,
              scaleX: 1.08,
              scaleY: 1.08,
              y: buttonY - 4,
              duration: 130,
              ease: 'Back.Out',
              onComplete: () => {
                this.tweens.add({
                  targets: root,
                  scaleX: 1,
                  scaleY: 1,
                  y: buttonY,
                  duration: 100,
                  ease: 'Sine.Out',
                })
              },
            })
          },
        })
      })

      this.answerButtons.push(button)
    }
  }

  private startNewProblem(): void {
    this.isAnswerLocked = false

    this.answerButtons.forEach((button) => {
      button.hitTarget.setInteractive({
        useHandCursor: true,
      })
    })

    this.problem = generateMathProblem()

    this.problemText.setText(
      `${this.problem.left} ${this.problem.operator} ${this.problem.right} = ?`,
    )

    this.feedbackText
      .setText(
        this.problem.operator === '+'
          ? '\u041f\u043e\u0440\u0430\u0445\u0443\u0439 \u0434\u0432\u0456 \u0433\u0440\u0443\u043f\u0438 \u0457\u0436\u0430\u0447\u043a\u0456\u0432'
          : '\u0421\u043a\u0456\u043b\u044c\u043a\u0438 \u0457\u0436\u0430\u0447\u043a\u0456\u0432 \u0437\u0430\u043b\u0438\u0448\u0438\u0442\u044c\u0441\u044f?',
      )
      .setColor('#31533a')

    this.renderAnswerButtons()
    this.createHedgehogGroups()
  }

  private renderAnswerButtons(): void {
    const buttonY = this.scale.height - 82

    this.answerButtons.forEach((button, index) => {
      const value = this.problem.options[index]

      button.value = value
      button.text.setText(String(value))

      this.tweens.killTweensOf(button.root)

      button.root
        .setScale(1)
        .setY(buttonY)

      button.background
        .setFillStyle(0xf4bd67)
        .setStrokeStyle(3, 0xd58a3a)

      button.bark
        .setFillStyle(0x985325)
        .setStrokeStyle(5, 0x603216)
    })
  }

  private createHedgehogGroups(): void {
    this.destroyHedgehogs()

    const { width } = this.scale
    const groupY = 455
    const edgePadding = 105

    if (this.problem.operator === '+') {
      const total =
        this.problem.left + this.problem.right

      const maxColumns =
        total > 7
          ? 3
          : 5

      const leftWidth = this.getGroupWidth(
        this.problem.left,
        maxColumns,
      )

      const rightWidth = this.getGroupWidth(
        this.problem.right,
        maxColumns,
      )

      this.createGroup(
        this.problem.left,
        edgePadding + leftWidth / 2,
        groupY,
        'right',
        maxColumns,
      )

      this.createGroup(
        this.problem.right,
        width - edgePadding - rightWidth / 2,
        groupY,
        'left',
        maxColumns,
      )

      return
    }

    this.createGroup(
      this.problem.left,
      width / 2,
      groupY,
      'right',
      5,
    )
  }

  private getHedgehogLayout(
    count: number,
  ): {
    spacingX: number
    spacingY: number
    scale: number
  } {
    if (count >= 8) {
      return {
        spacingX: 150,
        spacingY: 108,
        scale: 0.74,
      }
    }

    if (count >= 5) {
      return {
        spacingX: 156,
        spacingY: 110,
        scale: 0.82,
      }
    }

    return {
      spacingX: 164,
      spacingY: 112,
      scale: 0.94,
    }
  }

  private getRowCounts(
    count: number,
    maxColumns = 5,
  ): number[] {
    if (count <= maxColumns) {
      return [count]
    }

    const firstRowCount =
      Math.ceil(count / 2)

    const secondRowCount =
      count - firstRowCount

    return [
      firstRowCount,
      secondRowCount,
    ]
  }

  private getGroupWidth(
    count: number,
    maxColumns = 5,
  ): number {
    const { spacingX } =
      this.getHedgehogLayout(count)

    const longestRow = Math.max(
      ...this.getRowCounts(
        count,
        maxColumns,
      ),
    )

    return Math.max(
      0,
      (longestRow - 1) * spacingX,
    )
  }

  private createGroup(
    count: number,
    centerX: number,
    y: number,
    direction: 'left' | 'right',
    maxColumns = 5,
  ): void {
    const {
      spacingX,
      spacingY,
      scale,
    } = this.getHedgehogLayout(count)

    const rowCounts = this.getRowCounts(
      count,
      maxColumns,
    )

    rowCounts.forEach((rowCount, rowIndex) => {
      const rowWidth =
        Math.max(
          0,
          (rowCount - 1) * spacingX,
        )

      const rowStartX =
        centerX - rowWidth / 2

      const rowY =
        rowCounts.length === 1
          ? y
          : y +
            (
              rowIndex === 0
                ? -spacingY / 2
                : spacingY / 2
            )

      const rowOffsetX =
        rowCounts.length > 1 &&
        rowIndex === 1 &&
        rowCount < rowCounts[0]
          ? spacingX * 0.08
          : 0

      for (
        let columnIndex = 0;
        columnIndex < rowCount;
        columnIndex += 1
      ) {
        const naturalOffsetY =
          columnIndex % 2 === 0
            ? -3
            : 4

        const hedgehog = new Khytriachok(this, {
          x:
            rowStartX +
            columnIndex * spacingX +
            rowOffsetX,
          y:
            rowY -
            8 +
            naturalOffsetY,
          scale,
          direction,
        })

        hedgehog.setDepth(
          20 +
          rowIndex * 10 +
          columnIndex,
        )

        this.hedgehogs.push(hedgehog)
      }
    })
  }

  private gatherHedgehogs(
    onComplete: () => void,
  ): void {
    const { width } = this.scale
    const total = this.hedgehogs.length

    if (total === 0) {
      onComplete()
      return
    }

    const {
      spacingX,
      spacingY,
    } = this.getHedgehogLayout(total)

    const rowCounts = this.getRowCounts(total)
    const centerX = width / 2
    const centerY = 455

    const targetPositions: Array<{
      x: number
      y: number
    }> = []

    rowCounts.forEach((rowCount, rowIndex) => {
      const rowWidth =
        Math.max(0, (rowCount - 1) * spacingX)

      const rowStartX =
        centerX - rowWidth / 2

      const rowY =
        rowCounts.length === 1
          ? centerY
          : centerY +
            (rowIndex === 0
              ? -spacingY / 2
              : spacingY / 2)

      const rowOffsetX =
        rowCounts.length > 1 &&
        rowIndex === 1 &&
        rowCount < rowCounts[0]
          ? spacingX * 0.08
          : 0

      for (
        let columnIndex = 0;
        columnIndex < rowCount;
        columnIndex += 1
      ) {
        const naturalOffsetY =
          columnIndex % 2 === 0
            ? -3
            : 4

        targetPositions.push({
          x:
            rowStartX +
            columnIndex * spacingX +
            rowOffsetX,
          y: rowY - 8 + naturalOffsetY,
        })
      }
    })

    let completedCount = 0

    this.hedgehogs.forEach((hedgehog, index) => {
      const target =
        targetPositions[index]

      const duration =
        1750 + index * 55

      const delay =
        index * 65

      /*
       * walkTo відповідає за горизонтальну ходу
       * та анімацію лапок.
       */
      hedgehog.walkTo(
        target.x,
        duration,
        delay,
        () => {
          completedCount += 1

          if (completedCount === total) {
            onComplete()
          }
        },
      )

      /*
       * Окремо пересуваємо кожного їжачка
       * у потрібний ряд по вертикалі.
       */
      this.tweens.add({
        targets: hedgehog,
        y: target.y,
        duration,
        delay,
        ease: 'Sine.InOut',
      })
    })
  }

  private subtractHedgehogs(
    onComplete: () => void,
  ): void {
    const leavingCount = this.problem.right
    const firstLeavingIndex =
      this.hedgehogs.length - leavingCount

    const leavingHedgehogs =
      this.hedgehogs.slice(firstLeavingIndex)

    if (leavingHedgehogs.length === 0) {
      onComplete()
      return
    }

    let completedCount = 0

    leavingHedgehogs.forEach((hedgehog, index) => {
      hedgehog.walkTo(
        this.scale.width + 130 + index * 65,
        1700 + index * 80,
        index * 90,
        () => {
          completedCount += 1

          if (
            completedCount === leavingHedgehogs.length
          ) {
            leavingHedgehogs.forEach((item) => {
              item.setVisible(false)
            })

            onComplete()
          }
        },
      )
    })
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

    this.appleText.setText(
      `\u{1F34E} ${this.score}`,
    )

    button.background
      .setFillStyle(0x9ddc7a)
      .setStrokeStyle(4, 0x4f9d54)

    this.answerButtons.forEach((answerButton) => {
      answerButton.hitTarget.disableInteractive()
    })

    if (this.problem.operator === '+') {
      this.feedbackText
        .setText(
          '\u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e! \u0407\u0436\u0430\u0447\u043a\u0438 \u0437\u0431\u0438\u0440\u0430\u044e\u0442\u044c\u0441\u044f \u0440\u0430\u0437\u043e\u043c',
        )
        .setColor('#28743a')

      this.gatherHedgehogs(() => {
        this.finishCorrectAnswer()
      })

      return
    }

    this.feedbackText
      .setText(
        '\u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e! \u0427\u0430\u0441\u0442\u0438\u043d\u0430 \u0457\u0436\u0430\u0447\u043a\u0456\u0432 \u0439\u0434\u0435',
      )
      .setColor('#28743a')

    this.subtractHedgehogs(() => {
      this.finishCorrectAnswer()
    })
  }

  private finishCorrectAnswer(): void {
    this.problemText.setText(
      `${this.problem.left} ${this.problem.operator} ${this.problem.right} = ${this.problem.answer}`,
    )

    this.feedbackText
      .setText(
        this.problem.operator === '+'
          ? `\u0424\u0438\u0440-\u0440-\u0440! \u0420\u0430\u0437\u043e\u043c \u0457\u0436\u0430\u0447\u043a\u0456\u0432: ${this.problem.answer}`
          : `\u0424\u0438\u0440-\u0440-\u0440! \u0417\u0430\u043b\u0438\u0448\u0438\u043b\u043e\u0441\u044f \u0457\u0436\u0430\u0447\u043a\u0456\u0432: ${this.problem.answer}`,
      )
      .setColor('#28743a')

    this.hedgehogs
      .filter((hedgehog) => hedgehog.visible)
      .forEach((hedgehog) => {
        hedgehog.celebrate()
      })

    this.time.delayedCall(800, () => {
      audioManager.playRandomCorrect()
    })

    this.time.delayedCall(4900, () => {
      this.startNewProblem()
    })
  }

  private handleWrongAnswer(
    button: AnswerButton,
  ): void {
    this.feedbackText
      .setText(
        '\u0414\u0430\u0432\u0430\u0439 \u0449\u0435 \u0440\u0430\u0437 \u043f\u043e\u0440\u0430\u0445\u0443\u0454\u043c\u043e',
      )
      .setColor('#9b552f')

    button.background
      .setFillStyle(0xf3a392)
      .setStrokeStyle(4, 0xb96355)

    this.hedgehogs.forEach((hedgehog) => {
      hedgehog.reactToMistake()
    })

    this.time.delayedCall(250, () => {
      audioManager.playRandomWrong()
    })

    this.time.delayedCall(650, () => {
      button.background
        .setFillStyle(0xf7bc58)
        .setStrokeStyle(4, 0xbd702a)

      this.feedbackText
        .setText(
          '\u0421\u043f\u0440\u043e\u0431\u0443\u0439 \u0456\u043d\u0448\u0443 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c',
        )
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