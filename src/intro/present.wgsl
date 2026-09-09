import {
  axis_mask,
  env_lod,
  grid_mask,
  linear_to_srgb,
  sample_env,
  tonemap_aces,
} from "./env-common.wgsl";

struct Camera {
  position: vec3f,
  tan_half_fov: f32,
  forward: vec3f,
  aspect: f32,
  right: vec3f,
  exposure: f32,
  up: vec3f,
  background_intensity: f32,
  texel_angle: f32,
  env_size: vec2f,
  ground_color: vec3f,
  ground_y: f32,
  grid_minor: vec3f,
  grid_major_step: f32,
  grid_major: vec3f,
  grid_fade: f32,
};
@group(0) @binding(0) var<uniform> camera: Camera;
@group(0) @binding(1) var env_tex: texture_2d<f32>;
@group(0) @binding(2) var env_samp: sampler;
@group(0) @binding(3) var scene_tex: texture_2d<f32>;
@group(0) @binding(4) var scene_samp: sampler;

/**
 * Zemin izgarasi neden burada ciziliyor?
 *
 * Once cevre haritasina (2048x1024 equirect) pisiriliyordu. Ufka yaklastikca
 * bir teksel devasa bir zemin alanina karsilik geldigi icin cizgiler blok blok
 * kiriliyordu. Burada isin ekran uzayinda yapiliyor: her piksel icin gercek bir
 * isin-duzlem kesisimi hesaplaniyor ve fwidth ile kenar yumusatiliyor. Boylece
 * cizgi kalinligi mesafeden bagimsiz sabit, uzakta da net kaliyor.
 *
 * Cevre haritasindaki zemin yine duruyor ama artik yalnizca nesneyi
 * aydinlatmak ve yansimalari beslemek icin.
 */
fn ground_grid(origin: vec3f, direction: vec3f, arka_plan: vec3f) -> vec3f {
  // fwidth turevleri komsu fragmanlardan okundugu icin TEKDUZE AKISTA
  // cagrilmak zorunda: erken return kullanilamaz. Bu yuzden kesisim her
  // fragman icin hesaplanip sonucu maske ile karisiyoruz. Yukari bakan
  // isinlarda t sinira dayanir, gorunurluk sifira gider.
  let asagi = max(-direction.y, 1e-4);
  let t = clamp((origin.y - camera.ground_y) / asagi, 0.0, 5000.0);
  let hit = origin + direction * t;
  let p = clamp(hit.xz, vec2f(-5000.0), vec2f(5000.0));

  let minor = grid_mask(p, 1.0, 0.55) * 0.78;
  let major = grid_mask(p, camera.grid_major_step, 0.95);
  let axis = axis_mask(p, 1.2);

  // Mesafeye gore sonumleme: yakinda tam, ufka dogru gokyuzune karisir.
  let uzaklik = length(p);
  let gorunurluk = 1.0 / (1.0 + uzaklik * uzaklik * camera.grid_fade);

  var zemin = camera.ground_color;
  zemin = mix(zemin, camera.grid_minor, minor);
  zemin = mix(zemin, camera.grid_major, major);
  zemin = mix(zemin, camera.grid_major, axis * 0.85);

  // Ufuk cizgisinde sert bir dikis olmasin diye ayrica aci ile yumusat.
  let ufuk = smoothstep(0.0, 0.05, -direction.y);
  return mix(arka_plan, zemin, gorunurluk * ufuk);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let ndc = vec2f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0);
  let direction = normalize(
    camera.forward
      + camera.right * (ndc.x * camera.tan_half_fov * camera.aspect)
      + camera.up * (ndc.y * camera.tan_half_fov),
  );

  let lod = env_lod(0.0, dpdx(direction), dpdy(direction), camera.texel_angle);
  var background = sample_env(env_tex, env_samp, direction, lod, camera.env_size) * camera.background_intensity;
  background = ground_grid(camera.position, direction, background);

  let scene = textureSample(scene_tex, scene_samp, uv);
  let color = mix(background, scene.rgb, scene.a);

  return vec4f(linear_to_srgb(tonemap_aces(color * camera.exposure)), 1.0);
}
