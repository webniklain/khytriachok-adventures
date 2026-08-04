import Phaser from 'phaser'
import type { CharacterAnimationParts } from './AnimationController'

export class WalkController {
  private readonly scene: Phaser.Scene
  private readonly visualRoot: Phaser.GameObjects.Container
  private readonly parts: CharacterAnimationParts

  private stepTimer: Phaser.Time.TimerEvent | null = null
  private stepIndex = 0

  constructor(
    scene: Phaser.Scene,
    visualRoot: Phaser.GameObjects.Container,
    parts: CharacterAnimationParts,
  ) {
    this.scene = scene
    this.visualRoot = visualRoot
    this.parts = parts
  }

  public start(): void {
    console.log('[WalkController] start')
    this.stop()
    this.stepIndex = 0

    this.stepTimer = this.scene.time.addEvent({
      delay: 90,
      loop: true,
      callback: () => {
        this.updateStep()
      },
    })

    this.updateStep()
  }

  public stop(): void {
    this.stepTimer?.remove(false)
    this.stepTimer = null

    this.visualRoot
      .setPosition(0, 0)
      .setAngle(0)
      .setScale(1)

    this.parts.leftFoot
      .setPosition(-28, 45)
      .setAngle(0)

    this.parts.rightFoot
      .setPosition(26, 45)
      .setAngle(0)

    this.parts.arm
      .setPosition(38, 27)
      .setRotation(-0.55)
  }

  public destroy(): void {
    this.stop()
  }

  private updateStep(): void {
    const phase = this.stepIndex % 4

    console.log('[WalkController] step', phase)

    if (phase === 0) {
      this.visualRoot
        .setY(-12)
        .setAngle(-4)
        .setScale(1.04, 0.94)

      this.parts.leftFoot
        .setPosition(-37, 39)
        .setAngle(32)

      this.parts.rightFoot
        .setPosition(33, 47)
        .setAngle(-20)

      this.parts.arm.setAngle(-8)
    }

    if (phase === 1) {
      this.visualRoot
        .setY(-3)
        .setAngle(0)
        .setScale(0.97, 1.04)

      this.parts.leftFoot
        .setPosition(-30, 45)
        .setAngle(10)

      this.parts.rightFoot
        .setPosition(27, 43)
        .setAngle(-8)

      this.parts.arm.setAngle(-24)
    }

    if (phase === 2) {
      this.visualRoot
        .setY(-12)
        .setAngle(4)
        .setScale(1.04, 0.94)

      this.parts.leftFoot
        .setPosition(-22, 47)
        .setAngle(-20)

      this.parts.rightFoot
        .setPosition(36, 39)
        .setAngle(32)

      this.parts.arm.setAngle(-55)
    }

    if (phase === 3) {
      this.visualRoot
        .setY(-3)
        .setAngle(0)
        .setScale(0.97, 1.04)

      this.parts.leftFoot
        .setPosition(-27, 43)
        .setAngle(-8)

      this.parts.rightFoot
        .setPosition(30, 45)
        .setAngle(10)

      this.parts.arm.setAngle(-35)
    }

    this.stepIndex += 1
  }
}
