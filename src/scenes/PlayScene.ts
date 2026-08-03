import Phaser from 'phaser'

export class PlayScene extends Phaser.Scene {
  private hedgehog!: Phaser.GameObjects.Container

  constructor() {
    super({
      key: 'PlayScene',
    })
  }

  create(): void {
    this.createBackground()
    this.createTitle()
    this.createHedgehog()
    this.createAnimations()
    this.createStatusText()
  }

  private createBackground(): void {
    const { width, height } = this.scale

    // Небо
    this.add
      .rectangle(0, 0, width, height, 0xcceeff)
      .setOrigin(0)

    // Сонце
    const sun = this.add.circle(width - 115, 95, 47, 0xffdf72)

    this.tweens.add({
      targets: sun,
      scale: 1.08,
      alpha: 0.9,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })

    // Хмаринки
    this.createCloud(180, 115, 1)
    this.createCloud(width - 320, 175, 0.72)

    // Далекі пагорби
    this.add.ellipse(
      width * 0.25,
      height - 120,
      width * 0.75,
      330,
      0xa9d379,
    )

    this.add.ellipse(
      width * 0.77,
      height - 105,
      width * 0.9,
      350,
      0x92c866,
    )

    // Основна галявина
    this.add
      .rectangle(0, height * 0.61, width, height * 0.39, 0x79b957)
      .setOrigin(0)

    // Доріжка
    this.add.ellipse(
      width / 2,
      height + 35,
      width * 0.78,
      280,
      0xe4c68c,
    )

    this.createFlowers()
  }

  private createCloud(
    x: number,
    y: number,
    scale: number,
  ): void {
    const cloud = this.add.container(x, y)

    const parts: Phaser.GameObjects.Arc[] = [
      this.add.circle(-45, 12, 27, 0xffffff, 0.9),
      this.add.circle(-12, -2, 39, 0xffffff, 0.92),
      this.add.circle(28, 8, 31, 0xffffff, 0.9),
      this.add.circle(58, 17, 23, 0xffffff, 0.88),
    ]

    cloud.add(parts)
    cloud.setScale(scale)

    this.tweens.add({
      targets: cloud,
      x: x + 45,
      duration: 7000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
  }

  private createFlowers(): void {
    const flowerPositions = [
      { x: 105, y: 520, color: 0xffef8a },
      { x: 210, y: 610, color: 0xffffff },
      { x: 360, y: 525, color: 0xffb3c7 },
      { x: 940, y: 535, color: 0xffffff },
      { x: 1080, y: 625, color: 0xffef8a },
      { x: 1180, y: 510, color: 0xffb3c7 },
    ]

    flowerPositions.forEach(({ x, y, color }, index) => {
      const flower = this.add.container(x, y)

      const stem = this.add
        .rectangle(0, 20, 5, 42, 0x43843f)
        .setOrigin(0.5)

      const petals = [
        this.add.circle(-9, 0, 9, color),
        this.add.circle(9, 0, 9, color),
        this.add.circle(0, -9, 9, color),
        this.add.circle(0, 9, 9, color),
      ]

      const center = this.add.circle(0, 0, 7, 0xe59b38)

      flower.add([stem, ...petals, center])

      this.tweens.add({
        targets: flower,
        angle: index % 2 === 0 ? 4 : -4,
        duration: 1300 + index * 100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    })
  }

  private createTitle(): void {
    const { width } = this.scale

    this.add
      .text(width / 2, 62, 'Калькулятор їжачків', {
        color: '#294b32',
        fontFamily:
          '"Trebuchet MS", "Arial Rounded MT Bold", Arial, sans-serif',
        fontSize: '44px',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 7,
      })
      .setOrigin(0.5)
  }

  private createHedgehog(): void {
    const { width, height } = this.scale

    this.hedgehog = this.add.container(
      width / 2,
      height * 0.66,
    )

    // Тінь
    const shadow = this.add.ellipse(
      0,
      86,
      185,
      35,
      0x31502d,
      0.2,
    )

    // Голки
    const spikes = this.add.graphics()

    spikes.fillStyle(0x684d3c, 1)
    spikes.beginPath()
    spikes.moveTo(-105, 50)
    spikes.lineTo(-125, 4)
    spikes.lineTo(-87, 8)
    spikes.lineTo(-102, -42)
    spikes.lineTo(-62, -25)
    spikes.lineTo(-55, -78)
    spikes.lineTo(-18, -47)
    spikes.lineTo(8, -91)
    spikes.lineTo(28, -45)
    spikes.lineTo(75, -72)
    spikes.lineTo(71, -24)
    spikes.lineTo(116, -32)
    spikes.lineTo(91, 12)
    spikes.lineTo(122, 39)
    spikes.lineTo(76, 64)
    spikes.closePath()
    spikes.fillPath()

    // Тіло
    const body = this.add.ellipse(
      0,
      18,
      205,
      145,
      0x9a7152,
    )

    // Мордочка
    const face = this.add.ellipse(
      48,
      3,
      125,
      113,
      0xe7bd8b,
    )

    // Вушко
    const ear = this.add.circle(
      18,
      -43,
      22,
      0xd99d72,
    )

    const innerEar = this.add.circle(
      18,
      -43,
      11,
      0xf1bdac,
    )

    // Око
    const eyeWhite = this.add.ellipse(
      58,
      -14,
      27,
      34,
      0xffffff,
    )

    const eye = this.add.circle(
      62,
      -10,
      8,
      0x273028,
    )

    const eyeLight = this.add.circle(
      65,
      -14,
      3,
      0xffffff,
    )

    // Носик
    const nose = this.add.ellipse(
      111,
      12,
      35,
      29,
      0x26302a,
    )

    const noseLight = this.add.ellipse(
      105,
      6,
      9,
      6,
      0xffffff,
      0.65,
    )

    // Усмішка
    const smile = this.add.graphics()

    smile.lineStyle(4, 0x6e4939, 1)
    smile.beginPath()
    smile.arc(
      70,
      18,
      18,
      Phaser.Math.DegToRad(15),
      Phaser.Math.DegToRad(125),
    )
    smile.strokePath()

    // Лапки
    const leftFoot = this.add.ellipse(
      -44,
      72,
      55,
      25,
      0xd7a172,
    )

    const rightFoot = this.add.ellipse(
      43,
      72,
      55,
      25,
      0xd7a172,
    )

    // Передня лапка
    const arm = this.add
      .ellipse(62, 43, 30, 65, 0xd7a172)
      .setRotation(-0.55)

    this.hedgehog.add([
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

    this.hedgehog.setScale(0.88)
  }

  private createAnimations(): void {
    // Спокійне дихання
    this.tweens.add({
      targets: this.hedgehog,
      scaleX: 0.9,
      scaleY: 0.86,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })

    // Ледь помітне погойдування
    this.tweens.add({
      targets: this.hedgehog,
      angle: 2,
      duration: 1700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
  }

  private createStatusText(): void {
    const { width, height } = this.scale

    const panel = this.add
      .rectangle(
        width / 2,
        height - 62,
        500,
        70,
        0xffffff,
        0.86,
      )
      .setStrokeStyle(3, 0x91bd70, 0.75)

    this.add
      .text(
        width / 2,
        height - 62,
        'Перша ігрова сцена працює!',
        {
          color: '#31533a',
          fontFamily: 'Arial, sans-serif',
          fontSize: '26px',
          fontStyle: 'bold',
        },
      )
      .setOrigin(0.5)

    this.tweens.add({
      targets: panel,
      alpha: 0.7,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
  }
}