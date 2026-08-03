import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'BootScene',
    })
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#d9f0ff')

    const centerX = this.scale.width / 2
    const centerY = this.scale.height / 2

    this.add
      .text(centerX, centerY - 25, '🦔', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '72px',
      })
      .setOrigin(0.5)

    this.add
      .text(centerX, centerY + 65, 'Готуємо галявину…', {
        color: '#31533a',
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.time.delayedCall(700, () => {
      this.scene.start('PlayScene')
    })
  }
}