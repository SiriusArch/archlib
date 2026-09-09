import {
  draw,
  effect,
  frame,
  geometry,
  sampler,
  target,
  type Frame,
  type Gpu,
  type Target,
} from "vgpu";
import type { Texture } from "vgpu/core";
import blurWgsl from "./blur.wgsl";
import { buildArch } from "./arch";
import stoneWgsl from "./stone.wgsl";
import presentWgsl from "./present.wgsl";
import { spinMatrix, type CameraView } from "./camera";
import skyWgsl from "./sky.wgsl";

const HDR_FORMAT: GPUTextureFormat = "rgba16float";
const ENV_SIZE: readonly [number, number] = [2048, 1024];
const TEXEL_ANGLE = (2 * Math.PI) / ENV_SIZE[0];

/** Kemerin kaidesinin oturdugu kot — izgara duzlemi de burada. */
const ZEMIN_Y = -1.2;

const SKY = {
  sun_direction: [-0.62, 0.34, -0.71],
  sun_angular_size: 0.021,
  sun_color: [1.0, 0.95, 0.88],
  sun_intensity: 9,
  zenith_color: [0.10, 0.16, 0.29],
  cloud_coverage: 0.62,
  horizon_color: [0.23, 0.26, 0.32],
  cloud_scale: 0.72,
  // Kagit tonunda zemin, uzerinde CAD tel kafes izgarasi
  ground_color: [0.085, 0.09, 0.10],
  ground_scale: 3.0,
  grid_minor: [0.30, 0.33, 0.37],
  grid_major_step: 5.0,
  grid_major: [0.46, 0.54, 0.62],
  grid_axis_mix: 0.85,
} as const;

const STONE = {
  base_color: [0.95, 0.94, 0.92],
  roughness: 0.34,
  texel_angle: TEXEL_ANGLE,
  env_size: ENV_SIZE,
  sun_direction: SKY.sun_direction,
  sun_strength: 0.55,
  sun_tint: [1.0, 0.97, 0.93],
  ambient: 0.78,
} as const;

export async function createScene(gpu: Gpu, output: Target) {
  const owned = new Set<unknown>();
  try {
    const hdr = own(owned, createHdr(gpu, output.size));
    const envSampler = sampler(gpu, {
      minFilter: "linear",
      magFilter: "linear",
      mipmapFilter: "linear",
      addressModeU: "repeat",
      addressModeV: "clamp-to-edge",
    });
    const sceneSampler = sampler(gpu, {
      minFilter: "linear",
      magFilter: "linear",
    });
    const env = own(owned, await bakeEnvironment(gpu, envSampler));
    const mesh = buildArch();
    const archGeometry = own(
      owned,
      geometry(gpu, {
        buffers: [
          {
            attributes: { position: "float32x3", normal: "float32x3" },
            data: mesh.vertices,
          },
        ],
        indices: mesh.indices,
        label: "arch",
      })
    );

    const arch = draw(gpu, { shader: stoneWgsl, geometry: archGeometry });
    arch.set({ ...STONE, env_tex: env, env_samp: envSampler });
    const present = effect(gpu, presentWgsl);
    present.set({
      env_tex: env,
      env_samp: envSampler,
      scene_tex: hdr,
      scene_samp: sceneSampler,
    });
    await compileAll([
      () => arch.compile(hdr),
      () => present.compile({ colors: [output.format] }),
    ]);
    return { env, hdr, geometry: archGeometry, arch, present };
  } catch (error) {
    runCleanups(cleanupOwned(owned), { error });
  }
}

export type Scene = Awaited<ReturnType<typeof createScene>>;

async function bakeEnvironment(
  gpu: Gpu,
  samplerState: GPUSampler
): Promise<Texture> {
  const owned = new Set<unknown>();
  const makeTarget = (size: readonly [number, number]) =>
    own(owned, target(gpu, { size, format: HDR_FORMAT }));

  try {
    const env = own(
      owned,
      gpu.device.createTexture({
        size: [...ENV_SIZE],
        format: HDR_FORMAT,
        mipLevelCount: 8,
        usage: ["texture_binding", "copy_dst"],
      })
    );
    const sky = effect(gpu, skyWgsl);
    sky.set({ sky: SKY });
    const blur = effect(gpu, blurWgsl);
    const blurPass = (
      source: Target,
      output: Target,
      direction: readonly [number, number],
      equirectCompensation: number
    ) => {
      blur.set({
        src: source,
        src_samp: samplerState,
        blur: {
          texel: [1 / output.size[0], 1 / output.size[1]],
          direction,
          radius: 1.15,
          equirect_compensation: equirectCompensation,
        },
      });
      frame(gpu, (currentFrame) =>
        currentFrame.pass({ target: output }, (pass) => pass.draw(blur))
      );
    };
    let source = makeTarget(ENV_SIZE);

    await compileAll([() => sky.compile(source), () => blur.compile(source)]);
    frame(gpu, (currentFrame) =>
      currentFrame.pass({ target: source }, (pass) => pass.draw(sky))
    );
    copyIntoLevel(gpu, source, env, 0);

    for (let level = 1; level < 8; level++) {
      const size: [number, number] = [
        ENV_SIZE[0] >> level,
        ENV_SIZE[1] >> level,
      ];
      const horizontal = makeTarget(size);
      const vertical = makeTarget(size);
      blurPass(source, horizontal, [1, 0], 1);
      blurPass(horizontal, vertical, [0, 1], 0);
      copyIntoLevel(gpu, vertical, env, level);
      runCleanups([
        () => release(owned, horizontal),
        () => release(owned, source),
      ]);
      source = vertical;
    }
    release(owned, source);
    owned.delete(env);
    return env;
  } catch (error) {
    runCleanups(cleanupOwned(owned), { error });
  }
}

function copyIntoLevel(
  gpu: Gpu,
  source: Target,
  env: Texture,
  level: number
): void {
  const encoder = gpu.gpu.createCommandEncoder();
  encoder.copyTextureToTexture(
    { texture: source.color.gpu },
    { texture: env.gpu, mipLevel: level },
    [source.size[0], source.size[1], 1]
  );
  gpu.gpu.queue.submit([encoder.finish()]);
}

export function render(
  currentFrame: Frame,
  scene: Scene,
  output: Target,
  view: CameraView,
  time: number
): void {
  scene.arch.set({
    view_projection: view.camera.viewProjection,
    model: spinMatrix(time),
    camera_position: view.position,
  });
  scene.present.set({
    camera: {
      position: view.position,
      tan_half_fov: view.tanHalfFov,
      forward: view.forward,
      aspect: view.aspect,
      right: view.right,
      exposure: 0.9,
      up: view.up,
      background_intensity: 1,
      texel_angle: TEXEL_ANGLE,
      env_size: ENV_SIZE,
      // Izgara artik cevre haritasindan degil, ekran uzayinda ciziliyor.
      ground_color: SKY.ground_color,
      ground_y: ZEMIN_Y,
      grid_minor: SKY.grid_minor,
      grid_major_step: SKY.grid_major_step,
      grid_major: SKY.grid_major,
      grid_fade: 0.004,
    },
  });

  currentFrame.pass({ target: scene.hdr, clear: [0, 0, 0, 0] }, (pass) =>
    pass.draw(scene.arch)
  );
  currentFrame.pass({ target: output }, (pass) => pass.draw(scene.present));
}

export function aspectOf(output: Target): number {
  return output.size[0] / Math.max(1, output.size[1]);
}

export function replaceHdr(
  gpu: Gpu,
  scene: Scene,
  size: readonly [number, number]
): void {
  const previous = scene.hdr;
  const next = createHdr(gpu, size);
  try {
    scene.present.set({ scene_tex: next });
  } catch (error) {
    runCleanups(
      [
        () => scene.present.set({ scene_tex: previous }),
        () => destroyOwned(next),
      ],
      { error }
    );
  }
  scene.hdr = next;
  destroyOwned(previous);
}

export function destroyScene(scene: Scene): void {
  runCleanups([
    () => scene.geometry.destroy(),
    () => destroyOwned(scene.hdr),
    () => scene.env.destroy(),
  ]);
}

function createHdr(gpu: Gpu, size: readonly [number, number]): Target {
  return target(gpu, { size, format: HDR_FORMAT, depth: true });
}

function own<T>(owned: Set<unknown>, value: T): T {
  owned.add(value);
  return value;
}

function release(owned: Set<unknown>, value: unknown): void {
  owned.delete(value);
  destroyOwned(value);
}

function cleanupOwned(owned: Set<unknown>): (() => void)[] {
  return [...owned].reverse().map((value) => () => release(owned, value));
}

function destroyOwned(value: unknown): void {
  (value as { destroy?: () => void }).destroy?.();
}

async function compileAll(attempts: readonly (() => Promise<unknown>)[]) {
  const results = await Promise.allSettled(
    attempts.map((attempt) => Promise.resolve().then(attempt))
  );
  for (const result of results) {
    if (result.status === "rejected") throw result.reason;
  }
}

export function runCleanups(
  cleanups: readonly (() => void)[],
  primary: { error: unknown }
): never;
export function runCleanups(cleanups: readonly (() => void)[]): void;
export function runCleanups(
  cleanups: readonly (() => void)[],
  primary?: { error: unknown }
): void {
  const errors: unknown[] = [];
  for (const cleanup of cleanups) {
    try {
      cleanup();
    } catch (error) {
      errors.push(error);
    }
  }
  if (primary) throw primary.error;
  if (errors.length) throw errors[0];
}
