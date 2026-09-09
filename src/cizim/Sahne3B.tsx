/**
 * 3B sahne.
 *
 * Kat plani her degistiginde model bastan kuruluyor. Duvarlar acikliklara
 * gore parcalara boluyor: dolu parcalar tam yukseklikte, aciklik ustune lento,
 * pencere altina parapet konuyor. Boylece CSG'ye gerek kalmadan gercek kapi ve
 * pencere bosluklari cikiyor.
 *
 * Eksen donusumu: plan (x, y) -> sahne (x, z) = (x, -y); yukseklik Y ekseni.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Kat, Proje } from './tipler'
import { duvarParcalari, duvarUzunluk, odalariBul, poligonAlan } from './geometri'

export type SahneTemasi = 'studyo' | 'maket' | 'tel'

interface Props {
  proje: Proje
  aktifKatId: string
  /** Tum katlari ust uste goster */
  tumKatlar: boolean
  tema: SahneTemasi
  golge: boolean
  izgara: boolean
  /** Gunes yonu, derece */
  gunesAcisi: number
  tavan: boolean
}

interface Malzemeler {
  duvar: THREE.MeshStandardMaterial
  bolme: THREE.MeshStandardMaterial
  doseme: THREE.MeshStandardMaterial
  tavan: THREE.MeshStandardMaterial
  cam: THREE.MeshPhysicalMaterial
  dograma: THREE.MeshStandardMaterial
  kolon: THREE.MeshStandardMaterial
  cizgi: THREE.LineBasicMaterial
}

function malzemeKur(tema: SahneTemasi): Malzemeler {
  const maket = tema === 'maket'
  return {
    duvar: new THREE.MeshStandardMaterial({
      color: maket ? 0xe8e2d4 : 0xf1eee6,
      roughness: 0.92,
      metalness: 0,
      flatShading: false,
    }),
    bolme: new THREE.MeshStandardMaterial({ color: maket ? 0xded7c6 : 0xe6e2d8, roughness: 0.95 }),
    doseme: new THREE.MeshStandardMaterial({ color: maket ? 0xd8d1bf : 0xe3ded1, roughness: 0.96 }),
    tavan: new THREE.MeshStandardMaterial({ color: 0xf5f2ea, roughness: 0.98 }),
    cam: new THREE.MeshPhysicalMaterial({
      color: 0x9dc0d2,
      transparent: true,
      opacity: 0.28,
      roughness: 0.05,
      metalness: 0,
      transmission: 0.6,
    }),
    dograma: new THREE.MeshStandardMaterial({ color: 0x5c7c92, roughness: 0.7 }),
    kolon: new THREE.MeshStandardMaterial({ color: 0xb9573e, roughness: 0.85 }),
    cizgi: new THREE.LineBasicMaterial({ color: 0x30332d, transparent: true, opacity: 0.35 }),
  }
}

function kutuEkle(
  grup: THREE.Group,
  malzeme: THREE.Material,
  merkez: THREE.Vector3,
  boyut: THREE.Vector3,
  aci: number,
  telKafes: boolean,
): void {
  const geo = new THREE.BoxGeometry(boyut.x, boyut.y, boyut.z)
  const mesh = new THREE.Mesh(geo, malzeme)
  mesh.position.copy(merkez)
  mesh.rotation.y = aci
  mesh.castShadow = true
  mesh.receiveShadow = true
  grup.add(mesh)
  if (telKafes) {
    const kenar = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo, 20),
      new THREE.LineBasicMaterial({ color: 0x30332d, transparent: true, opacity: 0.28 }),
    )
    kenar.position.copy(merkez)
    kenar.rotation.y = aci
    grup.add(kenar)
  }
}

function katiKur(
  grup: THREE.Group,
  kat: Kat,
  m: Malzemeler,
  secenek: { tavan: boolean; tel: boolean; soluk: boolean },
): void {
  const taban = kat.kot
  const katY = kat.yukseklik

  // ------------------------------------------------------------- doseme
  const odalar = odalariBul(kat.duvarlar)
  for (const oda of odalar) {
    const sekil = new THREE.Shape()
    const noktalar = poligonAlan(oda.poligon) < 0 ? [...oda.poligon].reverse() : oda.poligon
    noktalar.forEach((p, i) => {
      if (i === 0) sekil.moveTo(p.x, -p.y)
      else sekil.lineTo(p.x, -p.y)
    })
    const geo = new THREE.ExtrudeGeometry(sekil, { depth: 0.12, bevelEnabled: false })
    geo.rotateX(Math.PI / 2)
    const mesh = new THREE.Mesh(geo, m.doseme)
    mesh.position.y = taban
    mesh.receiveShadow = true
    grup.add(mesh)

    if (secenek.tavan) {
      const tavanGeo = new THREE.ExtrudeGeometry(sekil, { depth: 0.1, bevelEnabled: false })
      tavanGeo.rotateX(Math.PI / 2)
      const t = new THREE.Mesh(tavanGeo, m.tavan)
      t.position.y = taban + katY + 0.1
      grup.add(t)
    }
  }

  // ------------------------------------------------------------- duvarlar
  for (const w of kat.duvarlar) {
    const boy = duvarUzunluk(w)
    if (boy < 0.02) continue
    const h = w.yukseklik > 0 ? w.yukseklik : katY
    const aci = Math.atan2(-(w.b.y - w.a.y), w.b.x - w.a.x)
    const malzeme = w.tur === 'bolme' ? m.bolme : w.tur === 'cam' ? m.cam : m.duvar
    const ux = (w.b.x - w.a.x) / boy
    const uy = (w.b.y - w.a.y) / boy

    const noktaAt = (mesafe: number) =>
      new THREE.Vector3(w.a.x + ux * mesafe, 0, -(w.a.y + uy * mesafe))

    const { dolu, delik } = duvarParcalari(w, kat.aciklikar)

    for (const [s, e] of dolu) {
      const uzun = e - s
      if (uzun < 0.005) continue
      const merkez = noktaAt((s + e) / 2)
      merkez.y = taban + h / 2
      kutuEkle(grup, malzeme, merkez, new THREE.Vector3(uzun, h, w.kalinlik), aci, secenek.tel)
    }

    for (const a of delik) {
      const ustBoy = h - (a.esik + a.yukseklik)
      if (ustBoy > 0.01) {
        const merkez = noktaAt(a.mesafe)
        merkez.y = taban + a.esik + a.yukseklik + ustBoy / 2
        kutuEkle(
          grup,
          malzeme,
          merkez,
          new THREE.Vector3(a.genislik, ustBoy, w.kalinlik),
          aci,
          secenek.tel,
        )
      }
      if (a.esik > 0.01) {
        const merkez = noktaAt(a.mesafe)
        merkez.y = taban + a.esik / 2
        kutuEkle(
          grup,
          malzeme,
          merkez,
          new THREE.Vector3(a.genislik, a.esik, w.kalinlik),
          aci,
          secenek.tel,
        )
      }
      // dograma + cam
      const camMerkez = noktaAt(a.mesafe)
      camMerkez.y = taban + a.esik + a.yukseklik / 2
      if (a.tur === 'pencere') {
        kutuEkle(
          grup,
          m.cam,
          camMerkez,
          new THREE.Vector3(a.genislik - 0.08, a.yukseklik - 0.08, 0.04),
          aci,
          false,
        )
        kutuEkle(
          grup,
          m.dograma,
          camMerkez,
          new THREE.Vector3(a.genislik, a.yukseklik, 0.05),
          aci,
          false,
        )
      } else {
        // kapi kasasi: yalnizca ince cerceve, kanat acik birakilir
        const kasa = 0.06
        const solMerkez = noktaAt(a.mesafe - a.genislik / 2 + kasa / 2)
        solMerkez.y = taban + a.yukseklik / 2
        kutuEkle(grup, m.dograma, solMerkez, new THREE.Vector3(kasa, a.yukseklik, w.kalinlik + 0.01), aci, false)
        const sagMerkez = noktaAt(a.mesafe + a.genislik / 2 - kasa / 2)
        sagMerkez.y = taban + a.yukseklik / 2
        kutuEkle(grup, m.dograma, sagMerkez, new THREE.Vector3(kasa, a.yukseklik, w.kalinlik + 0.01), aci, false)
      }
    }
  }

  // -------------------------------------------------------------- kolonlar
  for (const c of kat.kolonlar) {
    kutuEkle(
      grup,
      m.kolon,
      new THREE.Vector3(c.konum.x, taban + katY / 2, -c.konum.y),
      new THREE.Vector3(c.genislik, katY, c.derinlik),
      (-c.aci * Math.PI) / 180,
      secenek.tel,
    )
  }

  // ------------------------------------------------------------ mobilyalar
  for (const f of kat.mobilyalar) {
    const malzeme = new THREE.MeshStandardMaterial({
      color: new THREE.Color(f.renk),
      roughness: 0.85,
    })
    kutuEkle(
      grup,
      malzeme,
      new THREE.Vector3(f.konum.x, taban + f.yukseklik / 2 + 0.06, -f.konum.y),
      new THREE.Vector3(f.genislik, f.yukseklik, f.derinlik),
      (-f.aci * Math.PI) / 180,
      secenek.tel,
    )
  }

  if (secenek.soluk) {
    grup.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const mat = mesh.material as THREE.Material
      mat.transparent = true
      mat.opacity = 0.35
    })
  }
}

export default function Sahne3B(props: Props) {
  const kutuRef = useRef<HTMLDivElement>(null)
  const cizerRef = useRef<THREE.WebGLRenderer | null>(null)
  const sahneRef = useRef<THREE.Scene | null>(null)
  const kameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const kontrolRef = useRef<OrbitControls | null>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const gunesRef = useRef<THREE.DirectionalLight | null>(null)
  const izgaraRef = useRef<THREE.GridHelper | null>(null)
  const pRef = useRef(props)
  pRef.current = props

  // ---------------------------------------------------------------- kurulum
  useEffect(() => {
    const kutu = kutuRef.current
    if (!kutu) return

    const sahne = new THREE.Scene()
    sahne.background = new THREE.Color(0xf4f2ec)
    sahne.fog = new THREE.Fog(0xf4f2ec, 60, 190)

    const kamera = new THREE.PerspectiveCamera(45, 1, 0.1, 800)
    kamera.position.set(14, 12, 16)

    const cizer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    cizer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
    cizer.shadowMap.enabled = true
    cizer.shadowMap.type = THREE.PCFSoftShadowMap
    cizer.toneMapping = THREE.ACESFilmicToneMapping
    cizer.toneMappingExposure = 1.05
    kutu.appendChild(cizer.domElement)
    cizer.domElement.style.display = 'block'
    cizer.domElement.style.width = '100%'
    cizer.domElement.style.height = '100%'

    const kontrol = new OrbitControls(kamera, cizer.domElement)
    kontrol.enableDamping = true
    kontrol.dampingFactor = 0.08
    kontrol.maxPolarAngle = Math.PI / 2 - 0.02
    kontrol.minDistance = 1.5
    kontrol.maxDistance = 260
    kontrol.target.set(0, 1.2, 0)

    const ortam = new THREE.HemisphereLight(0xf6f4ee, 0xcfcabb, 2.1)
    sahne.add(ortam)
    const gunes = new THREE.DirectionalLight(0xfff4e2, 2.3)
    gunes.castShadow = true
    gunes.shadow.mapSize.set(2048, 2048)
    gunes.shadow.camera.near = 1
    gunes.shadow.camera.far = 160
    gunes.shadow.camera.left = -40
    gunes.shadow.camera.right = 40
    gunes.shadow.camera.top = 40
    gunes.shadow.camera.bottom = -40
    gunes.shadow.bias = -0.0006
    sahne.add(gunes)
    sahne.add(gunes.target)

    const zemin = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.ShadowMaterial({ opacity: 0.16 }),
    )
    zemin.rotation.x = -Math.PI / 2
    zemin.position.y = -0.002
    zemin.receiveShadow = true
    sahne.add(zemin)

    const izgara = new THREE.GridHelper(200, 200, 0xd6d2c5, 0xe6e3da)
    ;(izgara.material as THREE.Material).transparent = true
    ;(izgara.material as THREE.Material).opacity = 0.55
    sahne.add(izgara)

    const model = new THREE.Group()
    sahne.add(model)

    cizerRef.current = cizer
    sahneRef.current = sahne
    kameraRef.current = kamera
    kontrolRef.current = kontrol
    modelRef.current = model
    gunesRef.current = gunes
    izgaraRef.current = izgara

    let calisiyor = true
    const dongu = () => {
      if (!calisiyor) return
      kontrol.update()
      cizer.render(sahne, kamera)
      requestAnimationFrame(dongu)
    }
    dongu()

    const goz = new ResizeObserver(() => {
      const g = kutu.clientWidth
      const y = kutu.clientHeight
      if (!g || !y) return
      kamera.aspect = g / y
      kamera.updateProjectionMatrix()
      cizer.setSize(g, y, false)
    })
    goz.observe(kutu)

    return () => {
      calisiyor = false
      goz.disconnect()
      kontrol.dispose()
      sahne.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose()
      })
      cizer.dispose()
      if (cizer.domElement.parentElement === kutu) kutu.removeChild(cizer.domElement)
      cizerRef.current = null
    }
  }, [])

  // ------------------------------------------------------------ model kur
  useEffect(() => {
    const model = modelRef.current
    if (!model) return
    // eski icerigi bosalt
    for (let i = model.children.length - 1; i >= 0; i--) {
      const c = model.children[i]
      model.remove(c)
      c.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
      })
    }

    const m = malzemeKur(props.tema)
    const tel = props.tema === 'tel'
    const katlar = props.tumKatlar
      ? props.proje.katlar
      : props.proje.katlar.filter((k) => k.id === props.aktifKatId)

    for (const kat of katlar) {
      if (!kat.gorunur) continue
      const grup = new THREE.Group()
      katiKur(grup, kat, m, {
        tavan: props.tavan,
        tel,
        soluk: props.tumKatlar && kat.id !== props.aktifKatId,
      })
      model.add(grup)
    }

    // kamerayi ilk kurulumda modele ayarla
    const kutu = new THREE.Box3().setFromObject(model)
    if (kutu.isEmpty()) return
    const merkez = kutu.getCenter(new THREE.Vector3())
    kontrolRef.current?.target.set(merkez.x, Math.max(1, merkez.y), merkez.z)
  }, [props.proje, props.aktifKatId, props.tumKatlar, props.tema, props.tavan])

  // -------------------------------------------------------- isik / izgara
  useEffect(() => {
    const gunes = gunesRef.current
    if (!gunes) return
    const r = (props.gunesAcisi * Math.PI) / 180
    gunes.position.set(Math.cos(r) * 40, 34, Math.sin(r) * 40)
    gunes.castShadow = props.golge
    gunes.intensity = props.golge ? 2.3 : 1.5
  }, [props.gunesAcisi, props.golge])

  useEffect(() => {
    if (izgaraRef.current) izgaraRef.current.visible = props.izgara
  }, [props.izgara])

  return <div ref={kutuRef} className="h-full w-full" />
}
