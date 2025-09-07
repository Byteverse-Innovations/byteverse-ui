import React, { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Float, Html } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
// import { SVGLoader } from "three-stdlib"

/** ---------- Spiral builder (your current version) ---------- */
function useSpiralCurve({ wraps = 10, radius = 1, latPadding = 0.08 }) {
  return useMemo(() => {
    const pts: THREE.Vector3[] = []
    const samples = 3500
    const latMin = -Math.PI / 2 + latPadding
    const latMax = Math.PI / 2 - latPadding
    for (let i = 0;i < samples;i++) {
      const u = i / (samples - 1)
      const e = THREE.MathUtils.smootherstep(u, 0, 1)
      const phi = THREE.MathUtils.lerp(latMin, latMax, e)
      const theta = wraps * 2 * Math.PI * u + Math.PI * 0.25
      const cp = Math.cos(phi)
      const sp = Math.sin(phi)
      const ct = Math.cos(theta)
      const st = Math.sin(theta)
      pts.push(new THREE.Vector3(radius * cp * ct, radius * sp, radius * cp * st))
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.0)
    curve.arcLengthDivisions = samples * 2
    return curve
  }, [wraps, radius, latPadding])
}

function SpiralTube({ curve, tubeRadius = 0.035, radialSegments = 16, tubularSegments = 1600 }) {
  const geom = useMemo(
    () => new THREE.TubeGeometry(curve, tubularSegments, tubeRadius, radialSegments, false),
    [curve, tubeRadius, radialSegments, tubularSegments]
  )
  useMemo(() => {
    const col: number[] = []
    const colorA = new THREE.Color("#8a2be2")
    const colorB = new THREE.Color("#55c1ff")
    const posCount = geom.attributes.position.count
    for (let i = 0;i < posCount;i++) {
      const t = i / (posCount - 1)
      const c = colorA.clone().lerp(colorB, Math.sin(t * Math.PI * 0.9) * 0.5 + 0.25)
      col.push(c.r, c.g, c.b)
    }
    geom.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(col), 3))
  }, [geom])

  return (
    <mesh geometry={geom} castShadow receiveShadow>
      <meshStandardMaterial
        vertexColors
        metalness={0.2}
        roughness={0.25}
        emissiveIntensity={1.2}
        emissive={new THREE.Color("#4f3cc9")}
      />
    </mesh>
  )
}

function Atom({ curve, offset = 0, speed = 0.06, size = 0.055 }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * speed + offset) % 1
    const p = curve.getPointAt(t)
    const next = curve.getPointAt((t + 0.001) % 1)
    const tangent = next.clone().sub(p).normalize()
    const normal = p.clone().normalize()
    const bitangent = new THREE.Vector3().crossVectors(tangent, normal).normalize()
    const wobble = Math.sin((t + offset) * Math.PI * 4) * 0.02
    ref.current.position.copy(p.clone().add(bitangent.multiplyScalar(wobble)))
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial emissive={new THREE.Color("white")} emissiveIntensity={2.2} roughness={0.1} metalness={0} />
    </mesh>
  )
}

function AtomSwarm({ curve, count = 14, speed = 0.06 }) {
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <Atom key={i} curve={curve} offset={i / count} speed={speed * (0.8 + (i % 5) * 0.05)} />
      ))}
    </group>
  )
}

/** ---------- Logo texture on sphere ---------- */
function LogoSphere({ logoUrl, radius = 1 }: { logoUrl?: string; radius?: number }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    if (!logoUrl) return

    const loader = new THREE.TextureLoader()
    loader.load(logoUrl, (loadedTexture) => {
      loadedTexture.flipY = false
      loadedTexture.wrapS = THREE.RepeatWrapping
      loadedTexture.wrapT = THREE.RepeatWrapping
      setTexture(loadedTexture)
    })
  }, [logoUrl])

  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0.9}
        emissive={new THREE.Color("#0956be")}
        emissiveIntensity={0.2}
        roughness={0.1}
        metalness={0.0}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/** ---------- Logo Globe with Circuit Effects ---------- */
type GlobeProps = {
  wraps?: number
  rotationSpeed?: number
  logoUrl?: string
  tubeRadius?: number
  atomCount?: number
}

function CircuitGlobe({
  wraps = 10,
  rotationSpeed = 0.08,
  logoUrl,
  tubeRadius = 0.035,
  atomCount = 14
}: GlobeProps) {
  const group = useRef<THREE.Group>(null!)
  const spiralCurve = useSpiralCurve({ wraps })

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * rotationSpeed
  })

  return (
    <group ref={group}>
      {/* Your logo as texture on sphere */}
      {logoUrl && <LogoSphere logoUrl={logoUrl} radius={0.98} />}

      {/* Subtle circuit spiral effects */}
      <SpiralTube curve={spiralCurve} tubeRadius={tubeRadius * 0.5} />
      <AtomSwarm curve={spiralCurve} count={atomCount * 0.5} />
    </group>
  )
}

/** ---------- Canvas wrapper (default export) ---------- */
export default function ByteverseCircuitGlobe(props: GlobeProps) {
  return (
    <div className="w-full h-[70vh] bg-[#0a0530] rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }} dpr={[1, 2]} shadows>
        <color attach="background" args={["#0a0530"]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow />

        <Float speed={0.4} rotationIntensity={0.2} floatIntensity={0.8}>
          <CircuitGlobe
            wraps={props.wraps}
            rotationSpeed={props.rotationSpeed}
            logoUrl={props.logoUrl}
            tubeRadius={props.tubeRadius}
            atomCount={props.atomCount}
          />
        </Float>

        <Environment preset="city" />
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} intensity={0.8} radius={0.7} />
        </EffectComposer>
        <OrbitControls enablePan={false} minDistance={2.6} maxDistance={6} />

      </Canvas>
    </div>
  )
}
