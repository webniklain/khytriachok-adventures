import Phaser from 'phaser'
import {
  CharacterState,
  type CharacterState as CharacterStateValue,
} from '../characters/CharacterState'

type AnimationCompleteCallback = () => void

export type CharacterAnimationParts = {
  leftFoot: Phaser.GameObjects.Ellipse
  rightFoot: Phaser.GameObjects.Ellipse
  arm: Phaser.GameObjects.Ellipse
}

export class AnimationController {
  private currentState: CharacterStateValue | null = null

  private readonly directionX: 1 | -1
  private readonly scene: Phaser.Scene
  private readonly visualRoot: Phaser.GameObjects.Container
  private readonly baseScale: number
  private readonly parts: CharacterAnimationParts

  private readonly leftFootBaseAngle: number
  private readonly rightFootBaseAngle: number
  private readonly armBaseAngle: number

  constructor(
    scene: Phaser.Scene,
    visualRoot: Phaser.GameObjects.Container,
    baseScale: number,
    parts: CharacterAnimationParts,
  ) {
    this.scene = scene
    this.visualRoot = visualRoot
    this.baseScale = baseScale
    this.parts = parts

    this.directionX = 1

    this.leftFootBaseAngle = parts.leftFoot.angle
    this.rightFootBaseAngle = parts.rightFoot.angle
    this.armBaseAngle = parts.arm.angle
  }

  public getState(): CharacterStateValue | null {
    return this.currentState
  }

  public setCharacterState(
    state: CharacterStateValue,
    onComplete?: AnimationCompleteCallback,
  ): void {
    if (
      this.currentState === state &&
      state === CharacterState.Idle
    ) {
      return
    }

    this.stopCurrentAnimation()
    this.currentState = state
    this.resetTransform()

    switch (state) {
      case CharacterState.Idle:
        this.playIdle()
        break

      case CharacterState.Walking:
        this.playWalking()
        break

      case CharacterState.Thinking:
        this.playThinking()
        break

      case CharacterState.Celebrating:
        this.playCelebrating(onComplete)
        break

      case CharacterState.Mistake:
        this.playMistake(onComplete)
        break

      case CharacterState.Sleeping:
        this.playSleeping()
        break
    }
  }

  public beginExternalWalk(): void {
    this.stopCurrentAnimation()
    this.currentState = CharacterState.Walking
    this.resetTransform()
  }

  public endExternalWalk(): void {
    this.setCharacterState(CharacterState.Idle)
  }

  public destroy(): void {
    this.stopCurrentAnimation()
    this.currentState = null
  }

  private playIdle(): void {
    this.scene.tweens.add({
      targets: this.visualRoot,
      scaleY: this.baseScale * 0.96,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })

    this.scene.tweens.add({
      targets: this.visualRoot,
      angle: 1.4,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })

    this.scene.tweens.add({
      targets: this.parts.arm,
      angle: this.armBaseAngle + 4,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
  }

  private playWalking(): void {
    const startY = this.visualRoot.y

    this.scene.tweens.add({
      targets: this.visualRoot,
      y: startY - 13,
      angle: 5 * this.directionX,
      scaleX: 1.04,
      scaleY: 0.94,
      duration: 180,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })

    this.scene.tweens.add({
      targets: this.parts.leftFoot,
      angle: this.leftFootBaseAngle + 38,
      x: '-=8',
      y: '-=5',
      duration: 180,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })

    this.scene.tweens.add({
      targets: this.parts.rightFoot,
      angle: this.rightFootBaseAngle - 38,
      x: '+=8',
      y: '-=5',
      duration: 180,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
      delay: 180,
    })

    this.scene.tweens.add({
      targets: this.parts.arm,
      angle: this.armBaseAngle + 38,
      duration: 180,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
  }

  private playThinking(): void {
    const startY = this.visualRoot.y

    this.scene.tweens.add({
      targets: this.visualRoot,
      angle: -6 * this.directionX,
      y: startY + 4,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })

    this.scene.tweens.add({
      targets: this.parts.arm,
      angle: this.armBaseAngle - 20,
      y: this.parts.arm.y - 5,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
  }

  private playCelebrating(
    onComplete?: AnimationCompleteCallback,
  ): void {
    const startY = this.visualRoot.y

    this.scene.tweens.add({
      targets: this.visualRoot,
      y: startY - 28,
      angle: 8 * this.directionX,
      duration: 160,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.InOut',
      onComplete: () => {
        if (!this.visualRoot.active) {
          return
        }

        this.visualRoot.setY(startY)
        this.setCharacterState(CharacterState.Idle)
        onComplete?.()
      },
    })

    this.scene.tweens.add({
      targets: this.parts.arm,
      angle: this.armBaseAngle + 45,
      duration: 110,
      yoyo: true,
      repeat: 6,
      ease: 'Sine.InOut',
    })
  }

  private playMistake(
    onComplete?: AnimationCompleteCallback,
  ): void {
    const startX = this.visualRoot.x

    this.scene.tweens.add({
      targets: this.visualRoot,
      x: startX - 8,
      angle: -4 * this.directionX,
      duration: 65,
      yoyo: true,
      repeat: 4,
      ease: 'Sine.InOut',
      onComplete: () => {
        if (!this.visualRoot.active) {
          return
        }

        this.visualRoot.setX(startX)
        this.setCharacterState(CharacterState.Thinking)

        this.scene.time.delayedCall(500, () => {
          if (!this.visualRoot.active) {
            return
          }

          if (this.currentState === CharacterState.Thinking) {
            this.setCharacterState(CharacterState.Idle)
          }

          onComplete?.()
        })
      },
    })
  }

  private playSleeping(): void {
    this.scene.tweens.add({
      targets: this.visualRoot,
      scaleY: this.baseScale * 0.86,
      angle: -6 * this.directionX,
      duration: 1300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
  }

  private stopCurrentAnimation(): void {
    this.scene.tweens.killTweensOf(this.visualRoot)
    this.scene.tweens.killTweensOf(this.parts.leftFoot)
    this.scene.tweens.killTweensOf(this.parts.rightFoot)
    this.scene.tweens.killTweensOf(this.parts.arm)
  }

  private resetTransform(): void {
    this.visualRoot.setAngle(0)

    this.visualRoot.setScale(
      this.directionX * this.baseScale,
      this.baseScale,
    )

    this.parts.leftFoot
      .setAngle(this.leftFootBaseAngle)
      .setPosition(-28, 45)

    this.parts.rightFoot
      .setAngle(this.rightFootBaseAngle)
      .setPosition(26, 45)

    this.parts.arm
      .setAngle(this.armBaseAngle)
      .setPosition(38, 27)
  }
}
