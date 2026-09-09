import { useEffect, useRef, useState } from 'react'
import { createRenderer } from './renderer'

interface Props {
  /** Kullanici siteye gecmek istedi. */
  gir: () => void
}

type Durum = 'yukleniyor' | 'hazir' | 'desteklenmiyor'

const SERIF = '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif'
const PALET = ['#b03e3e', '#519976', '#be8144', '#517a95', '#5c5992']

export default function Intro({ gir }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [durum, setDurum] = useState<Durum>('yukleniyor')
  const [ipucu, setIpucu] = useState(true)
  const [cikiyor, setCikiyor] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
      setDurum('desteklenmiyor')
      return
    }

    let iptal = false
    const renderer = createRenderer({ canvas })
    renderer.ready.then(
      () => {
        if (!iptal) setDurum('hazir')
      },
      () => {
        if (!iptal) setDurum('desteklenmiyor')
      },
    )

    return () => {
      iptal = true
      renderer.dispose()
    }
  }, [])

  function girisBaslat() {
    if (cikiyor) return
    setCikiyor(true)
    window.setTimeout(gir, 620)
  }

  return (
    <div
      className={`fixed inset-0 z-[60] overflow-hidden bg-[#0d0f13] transition-all duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        cikiyor ? 'scale-[1.03] opacity-0' : 'scale-100 opacity-100'
      }`}
    >
      {/* WebGPU sahnesi */}
      <canvas
        ref={canvasRef}
        onPointerDown={() => setIpucu(false)}
        className={`block h-full w-full touch-none transition-opacity duration-[1400ms] ${
          durum === 'hazir' ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* WebGPU yoksa: ayni dilde sessiz bir CAD izgarasi */}
      {durum === 'desteklenmiyor' && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#12151b',
            backgroundImage:
              'linear-gradient(rgba(150,168,190,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(150,168,190,0.13) 1px, transparent 1px), linear-gradient(rgba(150,168,190,0.30) 1px, transparent 1px), linear-gradient(90deg, rgba(150,168,190,0.30) 1px, transparent 1px)',
            backgroundSize: '30px 30px, 30px 30px, 150px 150px, 150px 150px',
          }}
        />
      )}

      {/* Kenar vinyeti + alt okunabilirlik perdesi */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(130% 90% at 50% 38%, transparent 42%, rgba(6,8,11,0.55) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%]"
        style={{
          background: 'linear-gradient(to top, rgba(6,8,11,0.86) 4%, transparent 100%)',
        }}
      />

      {/* Ust kunye */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between px-6 py-5 sm:px-12 sm:py-9">
        <div>
          <div
            className="text-[21px] leading-none tracking-[-0.01em] text-[#ece8e0] sm:text-[26px]"
            style={{ fontFamily: SERIF }}
          >
            ArchLib
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="block h-px w-9 bg-[#ece8e0]/30" />
            <span className="text-[9px] tracking-[0.24em] text-[#ece8e0]/45 uppercase sm:text-[10px]">
              Mimarlik
            </span>
          </div>
        </div>

        <div className="hidden text-right sm:block">
          <div className="text-[10px] tracking-[0.22em] text-[#ece8e0]/70 uppercase">
            Kemer / Yarim Daire
          </div>
          <div className="mt-1 text-[10px] tracking-[0.16em] text-[#ece8e0]/45 uppercase">
            Prosedurel &nbsp;·&nbsp; WebGPU
          </div>
        </div>
      </header>

      {/* Alt blok */}
      <div className="absolute inset-x-0 bottom-0 px-6 pb-7 sm:px-12 sm:pb-11">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
          <div className="max-w-md">
            <h1
              className="text-[26px] leading-[1.1] tracking-[-0.015em] text-[#f2eee6] sm:text-[40px]"
              style={{ fontFamily: SERIF }}
            >
              Once <span className="text-[#d1685f]">olcu</span>,
              <br />
              sonra <span className="text-[#7ea9c4]">bicim</span>.
            </h1>
            <p className="mt-3 max-w-sm text-[12.5px] leading-relaxed text-[#ece8e0]/60 sm:mt-4 sm:text-[13.5px]">
              Arac kitapligi, olcu bankasi ve pafta kritigi. Temel Tasar, Neufert ve TS/DIN
              standartlari uzerine kurulu.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
            <div
              className={`text-[9px] tracking-[0.2em] text-[#ece8e0]/40 uppercase transition-opacity duration-500 sm:text-[10px] ${
                ipucu && durum === 'hazir' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Surukleyerek cevir
            </div>

            <button
              onClick={girisBaslat}
              className="group relative overflow-hidden border border-[#ece8e0]/30 px-7 py-3.5 text-[10px] tracking-[0.2em] text-[#f2eee6] uppercase transition-colors duration-500 hover:border-[#b03e3e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b03e3e]/60 sm:px-9 sm:py-4 sm:text-[11px]"
            >
              <span
                className="absolute inset-0 -translate-y-full bg-[#b03e3e] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                aria-hidden="true"
              />
              <span className="relative">Kitapliga gir</span>
            </button>
          </div>
        </div>

        {/* Palet seridi */}
        <div className="mx-auto mt-6 flex max-w-5xl sm:mt-8">
          {PALET.map((c) => (
            <span key={c} className="h-[3px] flex-1" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Yukleniyor */}
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
          durum === 'yukleniyor' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-[10px] tracking-[0.28em] text-[#ece8e0]/35 uppercase">
          Sahne hazirlaniyor
        </span>
      </div>
    </div>
  )
}
