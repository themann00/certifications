'use client'

export default function MondrianBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* Grid lines */}
      <div className="grid-line-h" style={{ top: '22%' }} />
      <div className="grid-line-h" style={{ bottom: '28%' }} />
      <div className="grid-line-v" style={{ left: '18%' }} />
      <div className="grid-line-v" style={{ right: '22%' }} />

      {/* Mondrian color blocks */}
      <div
        className="float-a absolute bg-mondrian-red"
        style={{ width: 140, height: 100, top: 60, right: 80 }}
      />
      <div
        className="float-b absolute bg-mondrian-blue"
        style={{ width: 90, height: 160, bottom: 80, left: 60 }}
      />
      <div
        className="float-c absolute bg-mondrian-yellow"
        style={{ width: 110, height: 110, top: '45%', left: 80 }}
      />
      <div
        className="float-a absolute bg-mondrian-red"
        style={{ width: 70, height: 120, bottom: 120, right: 140 }}
      />
      <div
        className="float-b absolute bg-mondrian-yellow"
        style={{ width: 150, height: 70, top: 120, left: '48%' }}
      />
      <div
        className="float-c absolute bg-mondrian-blue"
        style={{ width: 60, height: 90, top: '30%', right: '20%' }}
      />
      <div
        className="float-a absolute bg-mondrian-yellow"
        style={{ width: 80, height: 60, bottom: '15%', left: '35%' }}
      />
    </div>
  )
}
