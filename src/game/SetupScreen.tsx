import { useState, type ChangeEvent } from 'react'

interface SetupScreenProps {
  onStart: (names: string[]) => void
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [names, setNames] = useState(['Joueur 1', 'Joueur 2'])

  const updateName = (i: number, value: string) => {
    setNames((prev) => prev.map((n, idx) => (idx === i ? value : n)))
  }

  const addPlayer = () => {
    if (names.length >= 6) return
    setNames((prev) => [...prev, `Joueur ${prev.length + 1}`])
  }

  const removePlayer = (i: number) => {
    if (names.length <= 1) return
    setNames((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleStart = () => {
    const cleaned = names.map((n) => n.trim()).filter(Boolean)
    if (cleaned.length === 0) return
    onStart(cleaned)
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #1b5e3a, #0d3620)',
        fontFamily: 'sans-serif',
        color: '#fff',
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.35)',
          borderRadius: 16,
          padding: '32px 36px',
          minWidth: 320,
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 4, fontSize: 26 }}>⛳ Mini Golf 3D</h1>
        <p style={{ marginTop: 0, opacity: 0.75, fontSize: 14 }}>
          Multijoueur local — à tour de rôle sur le même écran
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
          {names.map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <input
                value={n}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateName(i, e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 14,
                }}
              />
              <button
                onClick={() => removePlayer(i)}
                disabled={names.length <= 1}
                style={{
                  border: 'none',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  padding: '0 12px',
                  cursor: names.length <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addPlayer}
          disabled={names.length >= 6}
          style={{
            marginTop: 12,
            width: '100%',
            padding: '8px 0',
            borderRadius: 8,
            border: '1px dashed rgba(255,255,255,0.4)',
            background: 'transparent',
            color: '#fff',
            cursor: names.length >= 6 ? 'not-allowed' : 'pointer',
          }}
        >
          + Ajouter un joueur
        </button>

        <button
          onClick={handleStart}
          style={{
            marginTop: 20,
            width: '100%',
            padding: '12px 0',
            borderRadius: 10,
            border: 'none',
            background: '#ffd24d',
            color: '#1b5e3a',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Commencer la partie
        </button>
      </div>
    </div>
  )
}
