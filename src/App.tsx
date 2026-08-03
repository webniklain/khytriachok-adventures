import { useEffect, useRef } from 'react'
import type Phaser from 'phaser'
import { createGame } from './game/Game'
import './App.css'

const GAME_CONTAINER_ID = 'hedgehog-game'

function App() {
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (gameRef.current !== null) {
      return
    }

    gameRef.current = createGame(GAME_CONTAINER_ID)

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return (
    <main className="app">
      <section className="game-shell">
        <div
          id={GAME_CONTAINER_ID}
          className="game-container"
          aria-label="Калькулятор їжачків"
        />
      </section>
    </main>
  )
}

export default App