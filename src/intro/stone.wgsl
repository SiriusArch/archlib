import { env_lod, sample_env } from "./env-common.wgsl";

// --------------------------------------------------------------------------
// Mat beyaz tas / alci malzemesi.
//
// Ornekteki ayna-metal (iletken) modelinin yerine dielektrik bir model:
//   - Dagilmis (diffuse) bilesen, cevre haritasinin cok bulanik ust
//     mip seviyesinden normal yonunde ornekleniyor. Bu, cevre isiginin
//     yaklasik irradyansidir; alcinin yumusak govde isigini verir.
//   - Yansima bilesen zayif ve Fresnel'e bagli: dik bakista neredeyse yok,
//     siyirma acilarinda hafif parlaklik. Tas boyle davranir.
// Cevre haritasi altyapisi ve mip zinciri ornekteki gibi korunuyor.
// --------------------------------------------------------------------------

struct Uniforms {
  view_projection: mat4x4f,
  model: mat4x4f,
  camera_position: vec3f,
  roughness: f32,
  base_color: vec3f,
  texel_angle: f32,
  env_size: vec2f,
  sun_direction: vec3f,
  sun_strength: f32,
  sun_tint: vec3f,
  ambient: f32,
};
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var env_tex: texture_2d<f32>;
@group(0) @binding(2) var env_samp: sampler;

const DIFFUSE_LOD: f32 = 6.0;
const F0: f32 = 0.045;

struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) world_position: vec3f,
  @location(1) world_normal: vec3f,
};

@vertex
fn vs_main(@location(0) position: vec3f, @location(1) normal: vec3f) -> VertexOut {
  let world = uniforms.model * vec4f(position, 1.0);
  var out: VertexOut;
  out.position = uniforms.view_projection * world;
  out.world_position = world.xyz;
  out.world_normal = (uniforms.model * vec4f(normal, 0.0)).xyz;
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let normal = normalize(in.world_normal);
  let view = normalize(uniforms.camera_position - in.world_position);
  let facing = clamp(dot(view, normal), 0.0, 1.0);
  let reflected = reflect(-view, normal);

  // Yaklasik irradyans: en bulanik seviyeden normal yonu.
  let irradiance = sample_env(env_tex, env_samp, normal, DIFFUSE_LOD, uniforms.env_size);

  // Cevre isigi tek basina duz bir beyaz veriyor: forma golge girmiyor.
  // Uzerine yonlu bir ana isik ekleniyor — kademeler, yivler ve voussoir
  // derzleri ancak boyle okunuyor. Yarim Lambert, sert kesim yapmasin diye.
  let sun = normalize(uniforms.sun_direction);
  // Us degeri dusuk ve gok egilimi dar: kemerin ust bandi ile sutunlar
  // ayni malzeme gibi okunsun, aralarinda deger ucurumu olmasin.
  let half_lambert = pow(dot(normal, sun) * 0.5 + 0.5, 1.35);
  let sky_bias = 0.84 + 0.16 * (normal.y * 0.5 + 0.5);
  let lighting = irradiance * uniforms.ambient * sky_bias
               + uniforms.sun_tint * half_lambert * uniforms.sun_strength;
  let diffuse = uniforms.base_color * lighting;

  let lod = env_lod(uniforms.roughness, dpdx(reflected), dpdy(reflected), uniforms.texel_angle);
  let specular = sample_env(env_tex, env_samp, reflected, lod, uniforms.env_size);
  let fresnel = F0 + (1.0 - F0) * pow(1.0 - facing, 5.0);

  return vec4f(diffuse * (1.0 - fresnel) + specular * fresnel, 1.0);
}
