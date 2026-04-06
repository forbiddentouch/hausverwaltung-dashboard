'use client'

export default function FloatingGreta() {
  return (
    <div className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-30">
      <img
        src="/greta-avatar.png"
        alt="ImmoGreta"
        className="w-11 h-11 lg:w-14 lg:h-14 rounded-full shadow-lg border-2 border-white hover:scale-105 transition-transform cursor-pointer"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    </div>
  )
}
