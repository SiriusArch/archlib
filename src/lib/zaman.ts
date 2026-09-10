/** Forumda ve sohbette kullanilan goreli zaman metni ("3 dk once" gibi). */
export function goreliZaman(ms: number): string {
  if (!ms) return ''
  const fark = Date.now() - ms
  const dk = Math.floor(fark / 60000)
  if (dk < 1) return 'az önce'
  if (dk < 60) return `${dk} dk önce`
  const sa = Math.floor(dk / 60)
  if (sa < 24) return `${sa} sa önce`
  const gun = Math.floor(sa / 24)
  if (gun < 30) return `${gun} gün önce`
  return new Date(ms).toLocaleDateString('tr-TR')
}
