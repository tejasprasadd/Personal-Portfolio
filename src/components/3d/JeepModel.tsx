/** Original procedural rover. No external model, textures, or asset proxy required. */
export const MODEL_SCALE = 1.8;
export const WHEEL_SCALE = 1.32;
export const MODEL_WHEEL_RADIUS = 0.62;
export const MODEL_WHEEL_HALF_WIDTH = 0.28;
export const MODEL_HALF_TRACK = 1.18;
export const MODEL_HALF_BASE = 1.25;

type WheelCorner = "front-left" | "front-right" | "back-left" | "back-right";
function Part({
  position,
  size,
  color,
  metalness = 0,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  metalness?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={metalness} />
    </mesh>
  );
}
export function JeepBody() {
  return (
    <group>
      <Part position={[0, 0.6, 0]} size={[1.95, 0.55, 3.5]} color="#dc633e" />
      <Part position={[0, 0.96, 1.1]} size={[1.92, 0.32, 1.3]} color="#f17b51" />
      <Part position={[0, 1.27, -0.32]} size={[1.7, 0.85, 1.5]} color="#334e50" />
      <Part position={[0, 1.76, -0.32]} size={[1.98, 0.18, 1.75]} color="#f9e9bf" />
      <Part position={[0, 1.35, 0.46]} size={[1.52, 0.6, 0.04]} color="#a4d3cf" metalness={0.35} />
      {[-0.89, 0.89].map((x) => (
        <Part
          key={x}
          position={[x, 1.35, -0.3]}
          size={[0.05, 0.58, 1.1]}
          color="#a4d3cf"
          metalness={0.3}
        />
      ))}
      <Part position={[0, 0.53, 1.8]} size={[2.15, 0.2, 0.23]} color="#344444" />
      <Part position={[0, 0.55, -1.8]} size={[2.15, 0.2, 0.23]} color="#344444" />
      <Part position={[0, 0.84, 1.77]} size={[0.68, 0.27, 0.06]} color="#293d3b" />
      {[-0.69, 0.69].map((x) => (
        <mesh key={x} position={[x, 0.9, 1.79]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.06, 12]} />
          <meshStandardMaterial color="#fff3c3" emissive="#ffe6a3" emissiveIntensity={0.7} />
        </mesh>
      ))}
      <Part position={[0, 1.94, -0.3]} size={[1.4, 0.18, 1.2]} color="#4e6862" />
      <Part position={[0, 2.12, -0.3]} size={[0.9, 0.2, 0.65]} color="#e8b356" />
      <mesh position={[0.75, 2.12, -0.9]}>
        <cylinderGeometry args={[0.025, 0.025, 1.3, 5]} />
        <meshStandardMaterial color="#2b4847" />
      </mesh>
    </group>
  );
}
export function JeepWheelMesh({ corner }: { corner: WheelCorner }) {
  const side = corner.includes("left") ? -1 : 1;
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[MODEL_WHEEL_RADIUS, MODEL_WHEEL_RADIUS, 0.48, 12]} />
        <meshStandardMaterial color="#293b39" roughness={0.95} />
      </mesh>
      <mesh position={[0, -side * 0.25, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.06, 8]} />
        <meshStandardMaterial color="#efe2ba" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[0, -side * 0.29, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 8]} />
        <meshStandardMaterial color="#68847a" />
      </mesh>
    </group>
  );
}
