import Phaser from 'phaser'
import { BootScene } from '../scenes/BootScene'
import { PlayScene } from '../scenes/PlayScene'

export const createGameConfig = (
  parent: string,
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  width: 1280,
  height: 720,
  backgroundColor: '#cceeff',
  transparent: false,
  antialias: true,
  pixelArt: false,
  roundPixels: false,
  scene: [BootScene, PlayScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  render: {
    antialias: true,
    roundPixels: false,
  },
})