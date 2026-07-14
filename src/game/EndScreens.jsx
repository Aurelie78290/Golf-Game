function Panel({ children }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        fontFamily: 'sans-serif',
        color: '#fff',
      }}
    >
      <div
        style={{
          background: 'rgba(20,50,30,0.95)',
          borderRadius: 16,
          padding: '28px 34px',
          minWidth: 300,
          textAlign: 'center',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export function HoleSummary({ hole, holeNumber, players, onNext, isLastHole }) {
  const sorted = [...players].sort((a, b) => a.strokesThisHole - b.strokesThisHole)
  return (
    <Panel>
      <h2 style={{ marginTop: 0 }}>Trou {holeNumber} terminé !</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '16px 0' }}>
        {sorted.map((p) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
            <span>{p.name}</span>
            <span>
              {p.strokesThisHole} coups (par {hole.par})
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={onNext}
        style={{
          padding: '10px 24px',
          borderRadius: 10,
          border: 'none',
          background: '#ffd24d',
          color: '#1b5e3a',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {isLastHole ? 'Voir les résultats finaux' : 'Trou suivant ▶'}
      </button>
    </Panel>
  )
}

export function GameOver({ players, onRestart }) {
  const ranking = [...players].sort((a, b) => a.totalStrokes - b.totalStrokes)
  return (
    <Panel>
      <h2 style={{ marginTop: 0 }}>🏆 Résultats finaux</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0' }}>
        {ranking.map((p, i) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 24,
              fontWeight: i === 0 ? 700 : 400,
              fontSize: i === 0 ? 17 : 15,
            }}
          >
            <span>
              {i === 0 ? '🥇 ' : `${i + 1}. `}
              {p.name}
            </span>
            <span>{p.totalStrokes} coups</span>
          </div>
        ))}
      </div>
      <button
        onClick={onRestart}
        style={{
          padding: '10px 24px',
          borderRadius: 10,
          border: 'none',
          background: '#ffd24d',
          color: '#1b5e3a',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Nouvelle partie
      </button>
    </Panel>
  )
}
