import { direction_from_equirect } from "./env-common.wgsl";

struct Sky {
  sun_direction: vec3f,
  sun_angular_size: f32,
  sun_color: vec3f,
  sun_intensity: f32,
  zenith_color: vec3f,
  cloud_coverage: f32,
  horizon_color: vec3f,
  cloud_scale: f32,
  ground_color: vec3f,
  ground_scale: f32,
  grid_minor: vec3f,
  grid_major_step: f32,
  grid_major: vec3f,
  grid_axis_mix: f32,
};
@group(0) @binding(0) var<uniform> sky: Sky;

fn hash(p: vec2f) -> f32 {
  var q = fract(vec3f(p.x, p.y, p.x) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

fn value_noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let w = f * f * (3.0 - 2.0 * f);
  let a = hash(i);
  let b = hash(i + vec2f(1.0, 0.0));
  let c = hash(i + vec2f(0.0, 1.0));
  let d = hash(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}

fn fbm(p: vec2f) -> f32 {
  var sum = 0.0;
  var amplitude = 0.5;
  var point = p;
  for (var octave = 0; octave < 5; octave++) {
    sum += amplitude * value_noise(point);
    point = point * 2.03 + vec2f(17.0, 9.0);
    amplitude *= 0.5;
  }
  return sum;
}

fn cloud_layer(direction: vec3f, sun: vec3f) -> vec2f {
  let height = max(direction.y, 0.035);
  let plane = direction.xz / height * sky.cloud_scale;
  let base = fbm(plane);
  let detail = fbm(plane * 3.1 + vec2f(base * 1.6));
  let density = smoothstep(sky.cloud_coverage, sky.cloud_coverage + 0.28, base * 0.75 + detail * 0.35);
  let horizon_fade = smoothstep(0.0, 0.12, direction.y);
  let lit = pow(clamp(dot(direction, sun) * 0.5 + 0.5, 0.0, 1.0), 3.0);
  return vec2f(density * horizon_fade, lit);
}

// --------------------------------------------------------------------------
// AutoCAD tarzi tel kafes zemin.
//
// Analitik turev (fwidth) ile piksel genisligine normalize edilmis cizgi:
// izgara uzaklastikca cizgi kalinligi sabit kalir, moire olusmaz. Cizgi
// yogunlugu mesafeye gore sonumlenir, boylece ufukta gri bir yuzeye donusur.
// --------------------------------------------------------------------------

fn grid_mask(p: vec2f, spacing: f32, width: f32) -> f32 {
  let g = p / spacing;
  let derivative = fwidth(g) + vec2f(1e-5);
  let distance_to_line = abs(fract(g - 0.5) - 0.5) / derivative;
  let nearest = min(distance_to_line.x, distance_to_line.y);
  return 1.0 - smoothstep(width - 0.5, width + 0.5, nearest);
}

fn axis_mask(p: vec2f, width: f32) -> f32 {
  let derivative = fwidth(p) + vec2f(1e-5);
  let distance_to_axis = abs(p) / derivative;
  let nearest = min(distance_to_axis.x, distance_to_axis.y);
  return 1.0 - smoothstep(width - 0.5, width + 0.5, nearest);
}

fn ground(direction: vec3f, sun: vec3f) -> vec3f {
  let depth = max(-direction.y, 0.001);
  let plane = direction.xz / depth * sky.ground_scale;

  // Uzakligina gore cizgileri soldur: yakinda net, ufukta zemin rengine karisir.
  let fade = 1.0 / (1.0 + dot(plane, plane) * 0.0016);

  var color = sky.ground_color;

  let minor = grid_mask(plane, 1.0, 0.55) * 0.72;
  let major = grid_mask(plane, sky.grid_major_step, 0.9);
  let axis = axis_mask(plane, 1.1);

  color = mix(color, sky.grid_minor, minor * fade);
  color = mix(color, sky.grid_major, major * fade);
  color = mix(color, sky.grid_major, axis * sky.grid_axis_mix * fade);

  // Gunesin zemine dusen cok hafif sicak sizintisi — kagit hissi icin.
  color += sky.sun_color * 0.02 * clamp(dot(normalize(vec3f(plane.x, 0.0, plane.y)), sun), 0.0, 1.0) * fade;

  return mix(sky.horizon_color * 0.42, color, fade);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let direction = direction_from_equirect(uv);
  let sun = normalize(sky.sun_direction);

  let up = clamp(direction.y, 0.0, 1.0);
  var color = mix(sky.horizon_color, sky.zenith_color, pow(up, 0.75));

  let sun_dot = clamp(dot(direction, sun), 0.0, 1.0);
  color += sky.sun_color * pow(sun_dot, 60.0) * 0.2;
  color += sky.sun_color * pow(sun_dot, 900.0) * 0.8;
  let disk = smoothstep(cos(sky.sun_angular_size * 2.2), cos(sky.sun_angular_size), sun_dot);
  color += sky.sun_color * sky.sun_intensity * disk;

  let cloud = cloud_layer(direction, sun);
  let cloud_color = mix(vec3f(0.44, 0.46, 0.51), sky.sun_color * 0.92, cloud.y);
  color = mix(color, cloud_color, cloud.x * (1.0 - disk));

  let horizon = smoothstep(-0.10, 0.015, direction.y);
  color = mix(ground(direction, sun), color, horizon);

  return vec4f(color, 1.0);
}
