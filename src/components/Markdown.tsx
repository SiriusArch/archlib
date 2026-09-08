/**
 * Kucuk, bagimsiz Markdown render edici.
 * Kasitli olarak sinirli: baslik, liste, tablo, kalin, kod, yatay cizgi.
 * HTML enjeksiyonu olmasin diye dangerouslySetInnerHTML KULLANILMAZ.
 */
import { Fragment, type ReactNode } from 'react'

function satirIci(metin: string, anahtar: string): ReactNode[] {
  const parcalar: ReactNode[] = []
  // **kalin** ve kod (ters tirnak) parcalarini yakalar
  const desen = new RegExp('(\\*\\*[^*]+\\*\\*|`[^`]+`)', 'g')
  let son = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = desen.exec(metin)) !== null) {
    if (m.index > son) parcalar.push(metin.slice(son, m.index))
    const p = m[0]
    if (p.startsWith('**')) {
      parcalar.push(<strong key={`${anahtar}-b${i}`}>{p.slice(2, -2)}</strong>)
    } else {
      parcalar.push(<code key={`${anahtar}-c${i}`}>{p.slice(1, -1)}</code>)
    }
    son = m.index + p.length
    i++
  }
  if (son < metin.length) parcalar.push(metin.slice(son))
  return parcalar
}

function tabloSatiri(satir: string): string[] {
  return satir
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((h) => h.trim())
}

export default function Markdown({ metin }: { metin: string }) {
  const satirlar = metin.split('\n')
  const cikti: ReactNode[] = []
  let i = 0
  let anahtar = 0

  while (i < satirlar.length) {
    const satir = satirlar[i]
    const kirp = satir.trim()

    if (!kirp) {
      i++
      continue
    }

    // Yatay cizgi
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(kirp)) {
      cikti.push(<hr key={`hr${anahtar++}`} />)
      i++
      continue
    }

    // Basliklar
    const bas = /^(#{1,6})\s+(.*)$/.exec(kirp)
    if (bas) {
      const seviye = bas[1].length
      const icerik = satirIci(bas[2], `h${anahtar}`)
      if (seviye <= 2) cikti.push(<h2 key={`h${anahtar++}`}>{icerik}</h2>)
      else cikti.push(<h3 key={`h${anahtar++}`}>{icerik}</h3>)
      i++
      continue
    }

    // Tablo
    if (kirp.startsWith('|') && i + 1 < satirlar.length && /^\s*\|[\s:|-]+\|\s*$/.test(satirlar[i + 1])) {
      const basliklar = tabloSatiri(kirp)
      i += 2
      const govde: string[][] = []
      while (i < satirlar.length && satirlar[i].trim().startsWith('|')) {
        govde.push(tabloSatiri(satirlar[i].trim()))
        i++
      }
      cikti.push(
        <div key={`t${anahtar++}`} className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {basliklar.map((h, k) => (
                  <th key={k}>{satirIci(h, `th${k}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {govde.map((r, rk) => (
                <tr key={rk}>
                  {r.map((h, ck) => (
                    <td key={ck}>{satirIci(h, `td${rk}-${ck}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    // Numarali liste
    if (/^\d+[.)]\s+/.test(kirp)) {
      const ogeler: string[] = []
      while (i < satirlar.length && /^\s*\d+[.)]\s+/.test(satirlar[i])) {
        ogeler.push(satirlar[i].trim().replace(/^\d+[.)]\s+/, ''))
        i++
      }
      cikti.push(
        <ol key={`ol${anahtar++}`}>
          {ogeler.map((o, k) => (
            <li key={k}>{satirIci(o, `oli${k}`)}</li>
          ))}
        </ol>,
      )
      continue
    }

    // Madde listesi
    if (/^[-*+]\s+/.test(kirp)) {
      const ogeler: string[] = []
      while (i < satirlar.length && /^\s*[-*+]\s+/.test(satirlar[i])) {
        ogeler.push(satirlar[i].trim().replace(/^[-*+]\s+/, ''))
        i++
      }
      cikti.push(
        <ul key={`ul${anahtar++}`}>
          {ogeler.map((o, k) => (
            <li key={k}>{satirIci(o, `uli${k}`)}</li>
          ))}
        </ul>,
      )
      continue
    }

    // Paragraf
    const paragraf: string[] = []
    while (
      i < satirlar.length &&
      satirlar[i].trim() &&
      !/^(#{1,6}\s|[-*+]\s|\d+[.)]\s|\|)/.test(satirlar[i].trim())
    ) {
      paragraf.push(satirlar[i].trim())
      i++
    }
    cikti.push(<p key={`p${anahtar++}`}>{satirIci(paragraf.join(' '), `pi${anahtar}`)}</p>)
  }

  return (
    <div className="kritik">
      {cikti.map((c, k) => (
        <Fragment key={k}>{c}</Fragment>
      ))}
    </div>
  )
}
