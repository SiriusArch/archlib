import type { Saglayici, EkGorsel } from '../types'

export interface SaglayiciBilgi {
  id: Saglayici
  ad: string
  anahtarAdresi: string
  anahtarOnEk: string
  modeller: string[]
  varsayilanModel: string
  gorselDestegi: boolean
  not: string
}

export const SAGLAYICILAR: SaglayiciBilgi[] = [
  {
    id: 'anthropic',
    ad: 'Anthropic (Claude)',
    anahtarAdresi: 'https://console.anthropic.com/settings/keys',
    anahtarOnEk: 'sk-ant-',
    modeller: ['claude-sonnet-5', 'claude-opus-5', 'claude-haiku-4-5-20251001'],
    varsayilanModel: 'claude-sonnet-5',
    gorselDestegi: true,
    not: 'Uzun ve yapılı metin kritiği ile görsel okumada güçlü. Tarayıcıdan çağrı için özel başlık otomatik ekleniyor.',
  },
  {
    id: 'openai',
    ad: 'OpenAI (GPT)',
    anahtarAdresi: 'https://platform.openai.com/api-keys',
    anahtarOnEk: 'sk-',
    modeller: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini'],
    varsayilanModel: 'gpt-4o',
    gorselDestegi: true,
    not: 'Model adı zamanla değişebilir; listeden seçebilir ya da elle yazabilirsin.',
  },
  {
    id: 'gemini',
    ad: 'Google (Gemini)',
    anahtarAdresi: 'https://aistudio.google.com/app/apikey',
    anahtarOnEk: '',
    modeller: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
    varsayilanModel: 'gemini-2.5-flash',
    gorselDestegi: true,
    not: 'Ücretsiz kotası olan tek sağlayıcı. Yüksek çözünürlüklü pafta görsellerinde iyi çalışır.',
  },
]

export function saglayiciBul(id: Saglayici): SaglayiciBilgi {
  const s = SAGLAYICILAR.find((x) => x.id === id)
  if (!s) throw new Error(`Bilinmeyen sağlayıcı: ${id}`)
  return s
}

export interface IstekParam {
  saglayici: Saglayici
  anahtar: string
  model: string
  sistem: string
  kullanici: string
  gorseller: EkGorsel[]
  maxToken?: number
  signal?: AbortSignal
  onParca: (parca: string) => void
}

/** SSE akisini satir satir okur ve her "data:" satirini isler. */
async function sseOku(
  yanit: Response,
  isle: (veri: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const okuyucu = yanit.body?.getReader()
  if (!okuyucu) throw new Error('Yanıt gövdesi okunamadı.')
  const cozucu = new TextDecoder()
  let tampon = ''

  while (true) {
    if (signal?.aborted) {
      await okuyucu.cancel().catch(() => {})
      throw new DOMException('İptal edildi', 'AbortError')
    }
    const { done, value } = await okuyucu.read()
    if (done) break
    tampon += cozucu.decode(value, { stream: true })

    let sinir: number
    while ((sinir = tampon.indexOf('\n')) >= 0) {
      const satir = tampon.slice(0, sinir).trim()
      tampon = tampon.slice(sinir + 1)
      if (!satir.startsWith('data:')) continue
      const veri = satir.slice(5).trim()
      if (!veri || veri === '[DONE]') continue
      isle(veri)
    }
  }
}

async function hataMetni(yanit: Response): Promise<string> {
  let ayrinti = ''
  try {
    const govde = await yanit.text()
    try {
      const j = JSON.parse(govde)
      ayrinti = j?.error?.message || j?.message || govde
    } catch {
      ayrinti = govde
    }
  } catch {
    /* yoksay */
  }
  const kisa = ayrinti.slice(0, 400)
  if (yanit.status === 401 || yanit.status === 403)
    return `Anahtar reddedildi (${yanit.status}). API anahtarını kontrol et. ${kisa}`
  if (yanit.status === 404)
    return `Model bulunamadı (404). Model adını kontrol et. ${kisa}`
  if (yanit.status === 429)
    return `Kota veya hız sınırı aşıldı (429). Biraz bekleyip tekrar dene. ${kisa}`
  return `İstek başarısız (${yanit.status}). ${kisa}`
}

async function anthropicCagir(p: IstekParam): Promise<void> {
  const icerik: unknown[] = p.gorseller.map((g) => ({
    type: 'image',
    source: { type: 'base64', media_type: g.mediaType, data: g.veri },
  }))
  icerik.push({ type: 'text', text: p.kullanici })

  const yanit = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal: p.signal,
    headers: {
      'content-type': 'application/json',
      'x-api-key': p.anahtar,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: p.model,
      max_tokens: p.maxToken ?? 4000,
      stream: true,
      system: p.sistem,
      messages: [{ role: 'user', content: icerik }],
    }),
  })
  if (!yanit.ok) throw new Error(await hataMetni(yanit))

  await sseOku(
    yanit,
    (veri) => {
      try {
        const o = JSON.parse(veri)
        if (o.type === 'content_block_delta' && o.delta?.type === 'text_delta') {
          p.onParca(o.delta.text as string)
        } else if (o.type === 'error') {
          throw new Error(o.error?.message || 'Anthropic akış hatası')
        }
      } catch (e) {
        if (e instanceof SyntaxError) return
        throw e
      }
    },
    p.signal,
  )
}

async function openaiCagir(p: IstekParam): Promise<void> {
  const parcalar: unknown[] = [{ type: 'text', text: p.kullanici }]
  for (const g of p.gorseller) {
    parcalar.push({
      type: 'image_url',
      image_url: { url: `data:${g.mediaType};base64,${g.veri}` },
    })
  }

  const yanit = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal: p.signal,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${p.anahtar}`,
    },
    body: JSON.stringify({
      model: p.model,
      stream: true,
      max_tokens: p.maxToken ?? 4000,
      messages: [
        { role: 'system', content: p.sistem },
        { role: 'user', content: parcalar },
      ],
    }),
  })
  if (!yanit.ok) throw new Error(await hataMetni(yanit))

  await sseOku(
    yanit,
    (veri) => {
      try {
        const o = JSON.parse(veri)
        const t = o?.choices?.[0]?.delta?.content
        if (typeof t === 'string' && t) p.onParca(t)
      } catch {
        /* parcali JSON, yoksay */
      }
    },
    p.signal,
  )
}

async function geminiCagir(p: IstekParam): Promise<void> {
  const parts: unknown[] = [{ text: p.kullanici }]
  for (const g of p.gorseller) {
    parts.push({ inline_data: { mime_type: g.mediaType, data: g.veri } })
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(p.model)}` +
    `:streamGenerateContent?alt=sse&key=${encodeURIComponent(p.anahtar)}`

  const yanit = await fetch(url, {
    method: 'POST',
    signal: p.signal,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: p.sistem }] },
      contents: [{ role: 'user', parts }],
      generationConfig: { maxOutputTokens: p.maxToken ?? 4000, temperature: 0.6 },
    }),
  })
  if (!yanit.ok) throw new Error(await hataMetni(yanit))

  await sseOku(
    yanit,
    (veri) => {
      try {
        const o = JSON.parse(veri)
        const pl = o?.candidates?.[0]?.content?.parts
        if (Array.isArray(pl)) {
          for (const par of pl) {
            if (typeof par?.text === 'string' && par.text) p.onParca(par.text)
          }
        }
      } catch {
        /* yoksay */
      }
    },
    p.signal,
  )
}

export async function analizCagir(p: IstekParam): Promise<void> {
  if (!p.anahtar.trim()) throw new Error('Önce API anahtarını gir.')
  switch (p.saglayici) {
    case 'anthropic':
      return anthropicCagir(p)
    case 'openai':
      return openaiCagir(p)
    case 'gemini':
      return geminiCagir(p)
    default:
      throw new Error('Desteklenmeyen sağlayıcı.')
  }
}

/** Dosyayi base64 e cevirir (data: on eki olmadan). */
export function dosyayiOku(dosya: File): Promise<{ veri: string; onizleme: string }> {
  return new Promise((coz, reddet) => {
    const okuyucu = new FileReader()
    okuyucu.onerror = () => reddet(new Error('Dosya okunamadı.'))
    okuyucu.onload = () => {
      const sonuc = String(okuyucu.result || '')
      const virgul = sonuc.indexOf(',')
      coz({ veri: virgul >= 0 ? sonuc.slice(virgul + 1) : sonuc, onizleme: sonuc })
    }
    okuyucu.readAsDataURL(dosya)
  })
}

export const IZINLI_GORSEL_TURLERI = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
/**
 * 3,5 MB ham dosya siniri. Base64 kodlamasi boyutu ~%33 buyuttugu icin bu deger,
 * saglayicilarin 5 MB'lik gorsel siniri altinda kalmayi garanti eder.
 */
export const MAKS_GORSEL_BOYUT = 3.5 * 1024 * 1024
