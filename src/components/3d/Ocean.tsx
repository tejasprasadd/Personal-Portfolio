import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Quality } from "@/hooks/useSettings";
import type { TimeOfDay } from "@/lib/timeOfDay";

/** One draw call: small swells, moving surface normals, and tidal foam along the cliff. */
export function Ocean({
  quality,
  reduceMotion,
  timeOfDay,
}: {
  quality: Quality;
  reduceMotion: boolean;
  timeOfDay: TimeOfDay;
}) {
  const initialNight = useRef(timeOfDay === "night" ? 1 : 0);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          night: { value: initialNight.current },
          detail: { value: 1 },
        },
        vertexShader: `
      uniform float time;
      varying vec3 world;
      void main() {
        vec3 p=position;
        float tide=sin(time*.18)*.08;
        p.z+=sin(p.x*.19+time*.48)*.12+sin(p.y*.27+p.x*.09-time*.37)*.09+tide;
        vec4 wp=modelMatrix*vec4(p,1.);
        world=wp.xyz;
        gl_Position=projectionMatrix*viewMatrix*wp;
      }`,
        fragmentShader: `
      uniform float time;
      uniform float night;
      uniform float detail;
      varying vec3 world;
      void main() {
        vec2 p=world.xz;
        float distanceToShore=length(p)-46.1;
        float a=p.x*.65+p.y*.38+time*.7;
        float b=p.x*-.4+p.y*.75-time*.54;
        vec3 n=normalize(vec3(cos(a)*.075+cos(b)*.05,1.,sin(b)*.08));
        vec3 view=normalize(cameraPosition-world);
        float fresnel=pow(1.-max(dot(view,n),0.),3.);
        vec3 deep=mix(vec3(.055,.26,.32),vec3(.016,.053,.095),night);
        vec3 shallow=mix(vec3(.23,.55,.56),vec3(.035,.16,.21),night);
        vec3 sky=mix(vec3(.65,.79,.8),vec3(.08,.15,.23),night);
        float shore=1.-smoothstep(0.,20.,distanceToShore);
        vec3 color=mix(deep,shallow,shore*.8);
        color=mix(color,sky,fresnel*.65);
        vec3 light=normalize(vec3(-.3,.8,.5));
        float specular=pow(max(dot(n,normalize(light+view)),0.),120.);
        color+=mix(vec3(.65,.63,.47),vec3(.27,.37,.49),night)*specular*.45;
        float ripple=sin(a+sin(b)*.6)*sin(b)*.5+.5;
        color+=ripple*.025*detail;
        float tide=sin(time*.18)*.35;
        float foam=pow(max(0.,sin(distanceToShore*4.-time*.7+sin(atan(p.y,p.x)*18.)*.4)),12.);
        foam*=smoothstep(-.2,.2,distanceToShore)*(1.-smoothstep(.5+tide,3.2+tide,distanceToShore));
        color=mix(color,mix(vec3(.8,.89,.83),vec3(.28,.44,.49),night),foam*.5*detail);
        float haze=smoothstep(140.,320.,length(cameraPosition-world));
        color=mix(color,sky,haze);
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame((_, dt) => {
    if (!reduceMotion) material.uniforms["time"]!.value += Math.min(dt, 0.05);
    material.uniforms["night"]!.value = THREE.MathUtils.damp(
      material.uniforms["night"]!.value,
      timeOfDay === "night" ? 1 : 0,
      reduceMotion ? 1000 : 3,
      dt,
    );
    material.uniforms["detail"]!.value = quality === "low" ? 0.35 : 1;
  });
  const segments = quality === "high" ? 180 : quality === "medium" ? 110 : 40;
  return (
    <mesh
      position={[0, -2.75, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      frustumCulled={false}
    >
      <planeGeometry args={[800, 800, segments, segments]} />
    </mesh>
  );
}
