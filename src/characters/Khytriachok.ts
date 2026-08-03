import Phaser from 'phaser'
import { AnimationController } from '../controllers/AnimationController'
import {
  CharacterState,
  type CharacterState as CharacterStateValue,
} from './CharacterState'

export type KhytriachokOptions = {
  x: number
  y: number
  scale?: number
  direction?: 'left' | 'right'
}

export class Khytriachok extends Phaser.GameObjects.Container {
  private readonly baseScale: number
  private readonly animationController: AnimationController

  constructor(
    scene: Phaser.Scene,
    options: KhytriachokOptions,
  ) {
    super(scene, options.x, options.y)

    this.baseScale = options.scale ?? 1

    scene.add.existing(this)
    this.createBody()

    if (options.direction === 'left') {
      this.setScale(-this.baseScale, this.baseScale)
    } else {
      this.setScale(this.baseScale)
    }

    this.animationController = new AnimationController(
      scene,
      this,
      this.baseScale,
    )

    this.setCharacterState(CharacterState.Idle)
  }

  public getCharacterState(): CharacterStateValue | null {
    return this.animationController.getState()
  }

  public setCharacterState(
    state: CharacterStateValue,
  ): void {
    this.animationController.setCharacterState(state)
  }

  public celebrate(): void {
    this.setCharacterState(CharacterState.Celebrating)
  }

  public reactToMistake(): void {
    this.setCharacterState(CharacterState.Mistake)
  }

  public startWalking(): void {
    this.setCharacterState(CharacterState.Walking)
  }

  public startThinking(): void {
    this.setCharacterState(CharacterState.Thinking)
  }

  public fallAsleep(): void {
    this.setCharacterState(CharacterState.Sleeping)
  }

  public wakeUp(): void {
    this.setCharacterState(CharacterState.Idle)
  }

  public override destroy(fromScene?: boolean): void {
    this.animationController.destroy()
    super.destroy(fromScene)
  }

  private createBody(): void {
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
      -28,
      45,
      34,
      15,
      0xd7a172,
    )

    const rightFoot = this.scene.add.ellipse(
      26,
      45,
      34,
      15,
      0xd7a172,
    )

    const arm = this.scene.add
      .ellipse(38, 27, 18, 40, 0xd7a172)
      .setRotation(-0.55)

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

    this.add([
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
      arm,
    ])
  }
}
