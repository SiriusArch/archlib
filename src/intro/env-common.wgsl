export const PI: f32 = 3.141592653589793;

export fn equirect_uv(direction: vec3f) -> vec2f {
  let d = normalize(direction);
  return vec2f(atan2(d.z, d.x) / (2.0 * PI) + 0.5, acos(clamp(d.y, -1.0, 1.0)) / PI);
}

export fn direction_from_equirect(uv: vec2f) -> vec3f {
  let phi = (uv.x - 0.5) * 2.0 * PI;
  let theta = uv.y * PI;
  return vec3f(sin(theta) * cos(phi), cos(theta), sin(theta) * sin(phi));
}

export fn env_lod(cone: f32, ddx: vec3f, ddy: vec3f, texel_angle: f32) -> f32 {
  let footprint = max(length(ddx), length(ddy));
  return max(log2(max(cone, footprint) / texel_angle), 0.0);
}

export fn sample_env(env: texture_2d<f32>, env_samp: sampler, direction: vec3f, lod: f32, size: vec2f) -> vec3f {
  let level_size = max(size / exp2(lod), vec2f(2.0));
  let texel = equirect_uv(direction) * level_size - 0.5;
  let corner = floor(texel);
  let f = fract(texel);
  let uv = (corner + f * f * (3.0 - 2.0 * f) + 0.5) / level_size;
  return textureSampleLevel(env, env_samp, uv, lod).rgb;
}

export fn tonemap_aces(color: vec3f) -> vec3f {
  let x = max(color, vec3f(0.0));
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), vec3f(0.0), vec3f(1.0));
}

export fn linear_to_srgb(color: vec3f) -> vec3f {
  let x = max(color, vec3f(0.0));
  return select(1.055 * pow(x, vec3f(1.0 / 2.4)) - 0.055, x * 12.92, x <= vec3f(0.0031308));
}

/**
 * Piksel genisligine normalize edilmis izgara maskesi.
 * fwidth analitik turev verdigi icin cizgi kalinligi mesafeden bagimsiz
 * sabit kalir; uzakta moire yerine duzgun bir ton olusur.
 */
export fn grid_mask(p: vec2f, spacing: f32, width: f32) -> f32 {
  let g = p / spacing;
  let derivative = fwidth(g) + vec2f(1e-5);
  let distance_to_line = abs(fract(g - 0.5) - 0.5) / derivative;
  let nearest = min(distance_to_line.x, distance_to_line.y);
  return 1.0 - smoothstep(width - 0.5, width + 0.5, nearest);
}

export fn axis_mask(p: vec2f, width: f32) -> f32 {
  let derivative = fwidth(p) + vec2f(1e-5);
  let distance_to_axis = abs(p) / derivative;
  let nearest = min(distance_to_axis.x, distance_to_axis.y);
  return 1.0 - smoothstep(width - 0.5, width + 0.5, nearest);
}
