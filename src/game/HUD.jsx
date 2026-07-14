export default function HUD({ hole, holeNumber, totalHoles, players, currentPlayerIndex }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        pointerEvents: 'none',
        fontFamily: 'sans-serif',
        color: '#fff',
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.5)',
          borderRadius: 10,
          padding: '10px 16px',
          minWidth: 160,
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.75 }}>
          Trou {holeNumber} / {totalHoles} — Par {hole.par}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{hole.name}</div>
      </div>

      <div
        style={{
          background: 'rgba(0,0,0,0.5)',
          borderRadius: 10,
          padding: '10px 16px',
          minWidth: 200,
        }}
      >
        {players.map((p, i) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '3px 0',
              fontWeight: i === currentPlayerIndex ? 700 : 400,
              opacity: p.holed ? 0.55 : 1,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: p.color,
                  display: 'inline-block',
                }}
              />
              {i === currentPlayerIndex && !p.holed ? '▶ ' : ''}
              {p.name}
              {p.holed ? ' ✓' : ''}
            </span>
            <span style={{ fontSize: 13 }}>
              {p.strokesThisHole} coups · total {p.totalStrokes}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
