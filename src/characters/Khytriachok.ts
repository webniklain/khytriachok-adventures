import Phaser from 'phaser'

export type KhytriachokOptions = {
  x: number
  y: number
  scale?: number
  direction?: 'left' | 'right'
}

type CharacterMode =
  | 'idle'
  | 'walking'
  | 'thinking'
  | 'celebrating'
  | 'mistake'
  | 'sleeping'

export class Khytriachok extends Phaser.GameObjects.Container {
  private readonly baseScale: number
  private readonly visualRoot: Phaser.GameObjects.Container

  private readonly leftFoot: Phaser.GameObjects.Ellipse
  private readonly rightFoot: Phaser.GameObjects.Ellipse
  private readonly eyeWhite: Phaser.GameObjects.Ellipse
  private readonly eye: Phaser.GameObjects.Arc
  private readonly eyeLight: Phaser.GameObjects.Arc
  private readonly nose: Phaser.GameObjects.Ellipse
  private readonly noseLight: Phaser.GameObjects.Ellipse

  private mode: CharacterMode = 'idle'
  private animationTime = 0
  private destroyed = false

  private blinkTimer: Phaser.Time.TimerEvent | null = null
  private sniffTimer: Phaser.Time.TimerEvent | null = null

  constructor(
    scene: Phaser.Scene,
    options: KhytriachokOptions,
  ) {
    super(scene, options.x, options.y)

    this.baseScale = options.scale ?? 1

    scene.add.existing(this)

    const parts = this.createVisual()

    this.visualRoot = parts.visualRoot
    this.leftFoot = parts.leftFoot
    this.rightFoot = parts.rightFoot
    this.eyeWhite = parts.eyeWhite
    this.eye = parts.eye
    this.eyeLight = parts.eyeLight
    this.nose = parts.nose
    this.noseLight = parts.noseLight

    const directionScale =
      options.direction === 'left'
        ? -this.baseScale
        : this.baseScale

    this.setScale(directionScale, this.baseScale)

    this.scene.events.on(
      Phaser.Scenes.Events.UPDATE,
      this.handleUpdate,
      this,
    )

    this.scheduleBlink()
    this.scheduleSniff()
  }

  public walkTo(
    targetX: number,
    duration: number,
    delay = 0,
    onComplete?: () => void,
  ): void {
    this.scene.time.delayedCall(delay, () => {
      if (!this.active || this.destroyed) {
        return
      }

      this.mode = 'walking'
      this.animationTime = 0

      this.scene.tweens.add({
        targets: this,
        x: targetX,
        duration,
        ease: 'Linear',
        onComplete: () => {
          if (!this.active || this.destroyed) {
            return
          }

          this.mode = 'idle'
          this.animationTime = 0
          this.resetVisual()
          onComplete?.()
        },
      })
    })
  }

  public celebrate(): void {
    if (!this.active || this.destroyed) {
      return
    }

    this.mode = 'celebrating'
    this.sniff()

    this.scene.tweens.killTweensOf(this.visualRoot)

    this.scene.tweens.add({
      targets: this.visualRoot,
      y: -28,
      angle: 10,
      scaleX: 1.12,
      scaleY: 0.9,
      duration: 150,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.InOut',
      onComplete: () => {
        if (!this.active || this.destroyed) {
          return
        }

        this.mode = 'idle'
        this.resetVisual()
      },
    })
  }

  public reactToMistake(): void {
    if (!this.active || this.destroyed) {
      return
    }

    this.mode = 'mistake'
    this.blink()

    const startX = this.x

    this.scene.tweens.killTweensOf(this)

    this.scene.tweens.add({
      targets: this,
      x: startX - 9,
      duration: 70,
      yoyo: true,
      repeat: 4,
      ease: 'Sine.InOut',
      onComplete: () => {
        if (!this.active || this.destroyed) {
          return
        }

        this.setX(startX)
        this.mode = 'thinking'
        this.animationTime = 0

        this.scene.time.delayedCall(650, () => {
          if (!this.active || this.destroyed) {
            return
          }

          this.mode = 'idle'
          this.animationTime = 0
          this.resetVisual()
        })
      },
    })
  }

  public startWalking(): void {
    this.mode = 'walking'
    this.animationTime = 0
  }

  public startThinking(): void {
    this.mode = 'thinking'
    this.animationTime = 0
  }

  public fallAsleep(): void {
    this.mode = 'sleeping'
    this.animationTime = 0
  }

  public wakeUp(): void {
    this.mode = 'idle'
    this.animationTime = 0
    this.resetVisual()
  }

  public override destroy(fromScene?: boolean): void {
    this.destroyed = true

    this.scene.events.off(
      Phaser.Scenes.Events.UPDATE,
      this.handleUpdate,
      this,
    )

    this.blinkTimer?.remove(false)
    this.sniffTimer?.remove(false)

    this.scene.tweens.killTweensOf(this)
    this.scene.tweens.killTweensOf(this.visualRoot)
    this.scene.tweens.killTweensOf([
      this.eyeWhite,
      this.eye,
      this.eyeLight,
      this.nose,
      this.noseLight,
    ])

    super.destroy(fromScene)
  }

  private handleUpdate(
    _time: number,
    delta: number,
  ): void {
    if (!this.active || this.destroyed) {
      return
    }

    this.animationTime += delta / 1000

    if (this.mode === 'walking') {
      this.updateWalking()
      return
    }

    if (this.mode === 'thinking') {
      this.updateThinking()
      return
    }

    if (this.mode === 'sleeping') {
      this.updateSleeping()
      return
    }

    if (this.mode === 'idle') {
      this.updateIdle()
    }
  }

  private updateWalking(): void {
    const cycle = this.animationTime * 5.2
    const step = Math.sin(cycle)
    const bounce = Math.abs(step)

    this.visualRoot.setPosition(
      0,
      -5 - bounce * 15,
    )

    this.visualRoot.setAngle(step * 6)

    this.visualRoot.setScale(
      1 + bounce * 0.07,
      1 - bounce * 0.08,
    )

    this.leftFoot
      .setVisible(true)
      .setPosition(
        -34 + step * 12,
        51 - Math.max(0, step) * 8,
      )
      .setAngle(step * 34)

    this.rightFoot
      .setVisible(true)
      .setPosition(
        32 - step * 12,
        51 - Math.max(0, -step) * 8,
      )
      .setAngle(-step * 34)

  }

  private updateIdle(): void {
    const breath = Math.sin(this.animationTime * 3)

    this.visualRoot.setPosition(
      0,
      breath * 2,
    )

    this.visualRoot.setAngle(
      Math.sin(this.animationTime * 1.8) * 1.5,
    )

    this.visualRoot.setScale(
      1,
      1 + breath * 0.025,
    )

    this.leftFoot
      .setVisible(true)
      .setPosition(-32, 51)
      .setAngle(0)

    this.rightFoot
      .setVisible(true)
      .setPosition(30, 51)
      .setAngle(0)

  }

  private updateThinking(): void {
    const movement = Math.sin(this.animationTime * 4)

    this.visualRoot.setPosition(
      0,
      3 + movement * 2,
    )

    this.visualRoot.setAngle(-7 + movement * 2)

  }

  private updateSleeping(): void {
    const breath = Math.sin(this.animationTime * 2)

    this.visualRoot.setPosition(
      0,
      8 + breath * 2,
    )

    this.visualRoot.setAngle(-7)

    this.visualRoot.setScale(
      1.04,
      0.88 + breath * 0.025,
    )
  }

  private resetVisual(): void {
    this.scene.tweens.killTweensOf(this.visualRoot)

    this.visualRoot
      .setPosition(0, 0)
      .setAngle(0)
      .setScale(1)

    this.leftFoot
      .setVisible(true)
      .setPosition(-32, 51)
      .setAngle(0)

    this.rightFoot
      .setVisible(true)
      .setPosition(30, 51)
      .setAngle(0)

  }

  private blink(): void {
    if (!this.active || this.destroyed) {
      return
    }

    const eyes = [
      this.eyeWhite,
      this.eye,
      this.eyeLight,
    ]

    this.scene.tweens.killTweensOf(eyes)

    eyes.forEach((part) => {
      part.setScale(1)
    })

    this.scene.tweens.add({
      targets: eyes,
      scaleY: 0.04,
      duration: 150,
      hold: 80,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.InOut',
      onComplete: () => {
        eyes.forEach((part) => {
          part.setScale(1)
        })
      },
    })
  }

  private sniff(): void {
    if (!this.active || this.destroyed) {
      return
    }

    const noseX = 68
    const noseLightX = 65

    this.scene.tweens.killTweensOf([
      this.nose,
      this.noseLight,
    ])

    this.scene.tweens.add({
      targets: this.nose,
      x: noseX + 9,
      scaleX: 1.4,
      scaleY: 0.78,
      duration: 180,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.InOut',
      onComplete: () => {
        this.nose
          .setX(noseX)
          .setScale(1)
      },
    })

    this.scene.tweens.add({
      targets: this.noseLight,
      x: noseLightX + 9,
      scaleX: 1.4,
      scaleY: 0.78,
      duration: 180,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.InOut',
      onComplete: () => {
        this.noseLight
          .setX(noseLightX)
          .setScale(1)
      },
    })
  }

  private scheduleBlink(): void {
    this.blinkTimer = this.scene.time.delayedCall(
      Phaser.Math.Between(900, 1900),
      () => {
        if (this.destroyed) {
          return
        }

        this.blink()
        this.scheduleBlink()
      },
    )
  }

  private scheduleSniff(): void {
    this.sniffTimer = this.scene.time.delayedCall(
      Phaser.Math.Between(2500, 4200),
      () => {
        if (this.destroyed) {
          return
        }

        this.sniff()
        this.scheduleSniff()
      },
    )
  }

  private createVisual(): {
    visualRoot: Phaser.GameObjects.Container
    leftFoot: Phaser.GameObjects.Ellipse
    rightFoot: Phaser.GameObjects.Ellipse
    eyeWhite: Phaser.GameObjects.Ellipse
    eye: Phaser.GameObjects.Arc
    eyeLight: Phaser.GameObjects.Arc
    nose: Phaser.GameObjects.Ellipse
    noseLight: Phaser.GameObjects.Ellipse
  } {
    const visualRoot =
      this.scene.add.container(0, 0)

    const shadow = this.scene.add.ellipse(
      0,
      54,
      105,
      20,
      0x31502d,
      0.18,
    )

    const spikes = this.scene.add.graphics()

    spikes.fillStyle(0x684d3c, 1)
    spikes.beginPath()
    spikes.moveTo(-66, 31)
    spikes.lineTo(-75, 1)
    spikes.lineTo(-54, 5)
    spikes.lineTo(-60, -27)
    spikes.lineTo(-35, -16)
    spikes.lineTo(-29, -48)
    spikes.lineTo(-8, -29)
    spikes.lineTo(7, -54)
    spikes.lineTo(19, -28)
    spikes.lineTo(47, -43)
    spikes.lineTo(44, -14)
    spikes.lineTo(71, -19)
    spikes.lineTo(57, 7)
    spikes.lineTo(73, 24)
    spikes.lineTo(47, 40)
    spikes.closePath()
    spikes.fillPath()

    const body = this.scene.add.ellipse(
      0,
      10,
      126,
      88,
      0x9a7152,
    )

    const face = this.scene.add.ellipse(
      30,
      1,
      76,
      69,
      0xe7bd8b,
    )

    const ear = this.scene.add.circle(
      10,
      -27,
      13,
      0xd99d72,
    )

    const innerEar = this.scene.add.circle(
      10,
      -27,
      7,
      0xf1bdac,
    )

    const eyeWhite = this.scene.add.ellipse(
      35,
      -9,
      17,
      21,
      0xffffff,
    )

    const eye = this.scene.add.circle(
      38,
      -7,
      5,
      0x273028,
    )

    const eyeLight = this.scene.add.circle(
      40,
      -10,
      2,
      0xffffff,
    )

    const nose = this.scene.add.ellipse(
      68,
      8,
      22,
      18,
      0x26302a,
    )

    const noseLight = this.scene.add.ellipse(
      65,
      4,
      6,
      4,
      0xffffff,
      0.6,
    )

    const leftFoot = this.scene.add.ellipse(
      -32,
      51,
      38,
      17,
      0xd7a172,
    )

    const rightFoot = this.scene.add.ellipse(
      30,
      51,
      38,
      17,
      0xd7a172,
    )

    const smile = this.scene.add.graphics()

    smile.lineStyle(3, 0x6e4939, 1)
    smile.beginPath()
    smile.arc(
      43,
      10,
      11,
      Phaser.Math.DegToRad(15),
      Phaser.Math.DegToRad(125),
    )
    smile.strokePath()

    visualRoot.add([
      shadow,
      spikes,
      body,
      leftFoot,
      rightFoot,
      face,
      ear,
      innerEar,
      eyeWhite,
      eye,
      eyeLight,
      nose,
      noseLight,
      smile,
    ])

    this.add(visualRoot)

    return {
      visualRoot,
      leftFoot,
      rightFoot,
      eyeWhite,
      eye,
      eyeLight,
      nose,
      noseLight,
    }
  }
}
