'use client'

export default function FloatingGreta() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <img
        src="/greta-avatar.png"
        alt="ImmoGreta"
        className="w-14 h-14 rounded-full shadow-lg border-2 border-white hover:scale-105 transition-transform cursor-pointer"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    </div>
  )
}
