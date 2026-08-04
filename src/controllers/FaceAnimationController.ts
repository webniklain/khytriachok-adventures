import Phaser from 'phaser'

export type FaceAnimationParts = {
  eyeWhite: Phaser.GameObjects.Ellipse
  eye: Phaser.GameObjects.Arc
  eyeLight: Phaser.GameObjects.Arc
  nose: Phaser.GameObjects.Ellipse
  noseLight: Phaser.GameObjects.Ellipse
}

export class FaceAnimationController {
  private readonly scene: Phaser.Scene
  private readonly parts: FaceAnimationParts

  private blinkTimer: Phaser.Time.TimerEvent | null = null
  private sniffTimer: Phaser.Time.TimerEvent | null = null
  private destroyed = false

  constructor(
    scene: Phaser.Scene,
    parts: FaceAnimationParts,
  ) {
    this.scene = scene
    this.parts = parts

    this.scene.time.delayedCall(500, () => {
      this.blink()
    })

    this.scene.time.delayedCall(1200, () => {
      this.sniff()
    })

    this.scheduleBlink()
    this.scheduleSniff()
  }

  public blink(): void {
    if (this.destroyed) {
      return
    }

    const eyeParts = [
      this.parts.eyeWhite,
      this.parts.eye,
      this.parts.eyeLight,
    ]

    this.scene.tweens.killTweensOf(eyeParts)

    eyeParts.forEach((part) => {
      part.setScale(1)
    })

    this.scene.tweens.add({
      targets: eyeParts,
      scaleY: 0.03,
      duration: 170,
      yoyo: true,
      repeat: 1,
      hold: 90,
      ease: 'Sine.InOut',
      onComplete: () => {
        eyeParts.forEach((part) => {
          part.setScale(1)
        })
      },
    })
  }

  public sniff(): void {
    if (this.destroyed) {
      return
    }

    const noseParts = [
      this.parts.nose,
      this.parts.noseLight,
    ]

    this.scene.tweens.killTweensOf(noseParts)

    const noseStartX = this.parts.nose.x
    const noseLightStartX = this.parts.noseLight.x

    this.scene.tweens.add({
      targets: this.parts.nose,
      x: noseStartX + 9,
      scaleX: 1.4,
      scaleY: 0.78,
      duration: 180,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.InOut',
      onComplete: () => {
        this.parts.nose
          .setX(noseStartX)
          .setScale(1)
      },
    })

    this.scene.tweens.add({
      targets: this.parts.noseLight,
      x: noseLightStartX + 9,
      scaleX: 1.4,
      scaleY: 0.78,
      duration: 180,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.InOut',
      onComplete: () => {
        this.parts.noseLight
          .setX(noseLightStartX)
          .setScale(1)
      },
    })
  }

  public destroy(): void {
    this.destroyed = true

    this.blinkTimer?.remove(false)
    this.sniffTimer?.remove(false)

    this.scene.tweens.killTweensOf([
      this.parts.eyeWhite,
      this.parts.eye,
      this.parts.eyeLight,
      this.parts.nose,
      this.parts.noseLight,
    ])

    this.blinkTimer = null
    this.sniffTimer = null
  }

  private scheduleBlink(): void {
    const delay = Phaser.Math.Between(900, 1800)

    this.blinkTimer = this.scene.time.delayedCall(
      delay,
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
    const delay = Phaser.Math.Between(2400, 3800)

    this.sniffTimer = this.scene.time.delayedCall(
      delay,
      () => {
        if (this.destroyed) {
          return
        }

        this.sniff()
        this.scheduleSniff()
      },
    )
  }
}
