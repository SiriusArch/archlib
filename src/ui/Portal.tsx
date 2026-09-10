import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Tam ekran modallari dogrudan document.body'ye tasir. Bunsuz, modal bir
 * animasyonlu (transform'lu) atanin icinde kalirsa — ki sayfa gecis
 * animasyonlari sirasinda kisa sureligine boyle olur — "position: fixed"
 * artik viewport'a degil o atanin kutusuna gore konumlanir; sonuc: modal
 * kucuk ve kirpilmis, altinda da devasa bos alan gorunur. Portal bu sinifin
 * tum hatalarini kokten ortadan kaldirir.
 */
export function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body)
}
