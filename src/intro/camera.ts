import { perspectiveCamera } from "vgpu/scene";

export const FOV_DEGREES = 42;
// Kemer ~2.4 birim yuksekliginde; 3.35'te kadraja sigmiyordu, nefes payi birakildi.
export const ORBIT_RADIUS = 3.8;

export function cameraView(yaw: number, pitch: number, aspect: number) {
  const clampedPitch = Math.max(-1.2, Math.min(1.2, pitch));
  const cosPitch = Math.cos(clampedPitch);
  const position: [number, number, number] = [
    Math.sin(yaw) * cosPitch * ORBIT_RADIUS,
    Math.sin(clampedPitch) * ORBIT_RADIUS,
    Math.cos(yaw) * cosPitch * ORBIT_RADIUS,
  ];
  const forward = normalize([-position[0], -position[1], -position[2]]);
  const right = normalize(cross(forward, [0, 1, 0]));
  const up = cross(right, forward);

  return {
    camera: perspectiveCamera({
      fov: FOV_DEGREES,
      aspect,
      near: 0.1,
      far: 40,
      position,
      target: [0, 0, 0],
    }),
    position,
    forward,
    right,
    up,
    tanHalfFov: Math.tan((FOV_DEGREES * Math.PI) / 360),
    aspect,
  };
}

export type CameraView = ReturnType<typeof cameraView>;

/**
 * Kemer mimari bir nesne: dik durmali. Ornekteki kup icin kullanilan
 * yaw + pitch savrulmasi yerine yalnizca Y ekseninde yavas donus.
 * Dusey bakis acisini zaten orbit denetimi veriyor.
 */
export function spinMatrix(time: number): Float32Array {
  const yaw = 0.35 + time * 0.16;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  // prettier-ignore
  return new Float32Array([
    cy, 0, -sy, 0,
     0, 1,   0, 0,
    sy, 0,  cy, 0,
     0, 0,   0, 1,
  ]);
}

type Vec3 = readonly [number, number, number];

function cross(a: Vec3, b: Vec3): [number, number, number] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function normalize(v: Vec3): [number, number, number] {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
}
