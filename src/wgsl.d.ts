/// <reference types="@webgpu/types" />

/**
 * `.wgsl` dosyalarini @vgpu/wgsl loader-vite eklentisi bir ShaderSource
 * nesnesine cevirir; draw() ve effect() bu tipi bekliyor.
 */
declare module '*.wgsl' {
  import type { ShaderSource } from '@vgpu/wgsl'
  const kaynak: ShaderSource
  export default kaynak
}
