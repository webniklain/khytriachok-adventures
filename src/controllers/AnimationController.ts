import Phaser from 'phaser'
import {
  CharacterState,
  type CharacterState as CharacterStateValue,
} from '../characters/CharacterState'

type AnimationCompleteCallback = () => void

export class AnimationController {
  private currentState: CharacterStateValue | null = null
  private readonly directionX: 1 | -1
  private readonly scene: Phaser.Scene
  private readonly target: Phaser.GameObjects.Container
  private readonly baseScale: number

  constructor(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.Container,
    baseScale: number,
  ) {
    this.scene = scene
    this.target = target
    this.baseScale = baseScale
    this.directionX = target.scaleX < 0 ? -1 : 1
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

  public destroy(): void {
    this.stopCurrentAnimation()
    this.currentState = null
  }

  private playIdle(): void {
    this.scene.tweens.add({
      targets: this.target,
      scaleY: this.baseScale * 0.96,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })

    this.scene.tweens.add({
      targets: this.target,
      angle: 1.4,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
  }

  private playWalking(): void {
    const startY = this.target.y

    this.scene.tweens.add({
      targets: this.target,
      y: startY - 7,
      angle: 3 * this.directionX,
      duration: 190,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
  }

  private playThinking(): void {
    const startY = this.target.y

    this.scene.tweens.add({
      targets: this.target,
      angle: -5 * this.directionX,
      y: startY + 3,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
  }

  private playCelebrating(
    onComplete?: AnimationCompleteCallback,
  ): void {
    const startY = this.target.y

    this.scene.tweens.add({
      targets: this.target,
      y: startY - 24,
      angle: 7 * this.directionX,
      duration: 170,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.InOut',
      onComplete: () => {
        if (!this.target.active) {
          return
        }

        this.target.setY(startY)
        this.setCharacterState(CharacterState.Idle)
        onComplete?.()
      },
    })
  }

  private playMistake(
    onComplete?: AnimationCompleteCallback,
  ): void {
    const startX = this.target.x

    this.scene.tweens.add({
      targets: this.target,
      x: startX - 7,
      angle: -3 * this.directionX,
      duration: 65,
      yoyo: true,
      repeat: 4,
      ease: 'Sine.InOut',
      onComplete: () => {
        if (!this.target.active) {
          return
        }

        this.target.setX(startX)
        this.setCharacterState(CharacterState.Thinking)

        this.scene.time.delayedCall(450, () => {
          if (!this.target.active) {
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
      targets: this.target,
      scaleY: this.baseScale * 0.88,
      angle: -4 * this.directionX,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
  }

  private stopCurrentAnimation(): void {
    this.scene.tweens.killTweensOf(this.target)
  }

  private resetTransform(): void {
    this.target.setAngle(0)
    this.target.setScale(
      this.directionX * this.baseScale,
      this.baseScale,
    )
  }
}
