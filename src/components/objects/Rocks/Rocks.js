import { Group, Mesh, ShaderMaterial, DoubleSide, Vector3, Object3D, Geometry, PlaneGeometry, SphereGeometry, InstancedMesh, ConeGeometry, CylinderGeometry, Sphere, Vector2} from 'three';
// import * as THREE from 'three';
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import * as constants from '../../../constants.js';

/**
 * SOURCE: https://jsfiddle.net/felixmariotto/hvrg721n/
 *
 */
const vertexShader = `
  varying vec2 vUv;
  uniform float time;

	void main() {

    vUv = uv;

    // VERTEX POSITION

    vec4 mvPosition = vec4( position, 1.0 );
    #ifdef USE_INSTANCING
    	mvPosition = instanceMatrix * mvPosition;
    #endif

    // DISPLACEMENT

    // here the displacement is made stronger on the blades tips.
    float dispPower = 1.0 - cos( uv.y * 3.1416 / 2.0 );

    float displacement = sin( mvPosition.z + time * 10.0 ) * ( 0.1 * dispPower );
    mvPosition.z += displacement;

    //

    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;

	}
`;

const fragmentShader = `
  varying vec2 vUv;

  void main() {
  	vec3 baseColor = vec3(0.12, 0.14, 0.13);
    float clarity = ( vUv.y * 3.0 ) + 0.2;
    gl_FragColor = vec4( baseColor * clarity, 1 );
  }
`;

const uniforms = {
	time: { value: 0 }
}

const leavesMaterial = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    side: DoubleSide
});

const size = constants.FIELD_WIDTH
const instanceMultiplier = constants.ROCKS_INSTANCE_MULTIPLIER;

class Rocks extends Group {
    constructor(difficulty, levelofdetail) {
        // Call parent Group() constructor
        super();

        // const dummy = new Object3D();

        // const instancedMesh = new InstancedMesh(geometry, leavesMaterial, instanceNumber);
        this.rock1audio = new Audio('src/audio/rock1.mp3');
        this.rock2audio = new Audio('src/audio/rock2.mp3');
        this.collisionCount = 0
        this.centerPoints = []
        this.radii = []

        // remap value from the range of [smin,smax] to [emin,emax]
        const map = (val, smin, smax, emin, emax) => (emax-emin)*(val-smin)/(smax-smin) + emin

        //randomly displace the x,y,z coords by the `per` value
        const jitter = (geo,per) => geo.vertices.forEach(v => {
            v.x += map(Math.random(),0,1,-per,per)
            v.y += map(Math.random(),0,1,-per,per)
            v.z += map(Math.random(),0,1,-per,per)
        })

        const instanceNumber = difficulty * instanceMultiplier;

        for (let i = 0; i < instanceNumber; i++) {
            const posX = (Math.random() - 0.5) * size
            const posY = 0
            const posZ = (Math.random() - 0.5) * size
            if (Math.sqrt(posX ** 2 + posZ ** 2) < 3) {
              i--;
              continue;
            }

            const geometry = new Geometry()
            const rad1 = Math.random()*0.3+0.5;
            const rad2 = Math.random()*0.4+0.3;
            const rad3 = Math.random()*0.6+0.5;
            const offset1x = (Math.random()-0.5)*2
            const offset1z = (Math.random()-0.5)*2
            const offset2x = (Math.random()-0.5)*2
            const offset2z = (Math.random()-0.5)*2
            const sphere1 = new SphereGeometry(rad1,levelofdetail*3,levelofdetail*4)
            sphere1.translate(offset1x,0,offset1z)
            geometry.merge(sphere1)
            const sphere2 = new SphereGeometry(rad2,levelofdetail*3,levelofdetail*4)
            sphere2.translate(offset2x,0,offset2z)
            geometry.merge(sphere2)
            const sphere3 = new SphereGeometry(rad3,levelofdetail*3,levelofdetail*4)
            sphere3.translate(0,0,0)
            geometry.merge(sphere3)

            jitter(geometry, 0.15)

            const mesh = new Mesh(geometry, leavesMaterial);
            mesh.position.set(posX, posY, posZ);

            this.centerPoints.push(new Vector3(posX, posY, posZ))
            this.centerPoints.push(new Vector3(posX+offset1x, posY, posZ+offset1z))
            this.centerPoints.push(new Vector3(posX+offset2x, posY, posZ+offset2z))
            this.radii.push(rad1)
            this.radii.push(rad2)
            this.radii.push(rad3)

            // console.log(this.centerPoints)

            mesh.scale.setScalar(1 + Math.random() * 0.2);
            // dummy.rotation.y = Math.random() * Math.PI;
            // dummy.updateMatrix();
            // instancedMesh.setMatrixAt(i, dummy.matrix);
            super.add(mesh);
        }

    }

    collide(boundingBox) {
      const lawnmower = this.parent.children[constants.LAWNMOWER_INDEX]
      const bBoxGeo = boundingBox.geometry
      const mWorld = boundingBox.matrixWorld
      const corners = [bBoxGeo.vertices[0].clone().applyMatrix4(mWorld), bBoxGeo.vertices[1].clone().applyMatrix4(mWorld), bBoxGeo.vertices[4].clone().applyMatrix4(mWorld), bBoxGeo.vertices[5].clone().applyMatrix4(mWorld)]

      // console.log(corners)
      for (let i = 0; i < this.centerPoints.length; i++) {
        corners.every(corner => {
          // console.log(corner)
          if (this.centerPoints[i].distanceTo(new Vector3(corner.x, 0, corner.z)) <= this.radii[i]) {

            const cornerOffset = corner.clone().sub(this.centerPoints[i]).normalize().multiplyScalar(this.radii[i] /* + constants.LAWNMOWER_RADIUS */)
            lawnmower.position.set(lawnmower.position.x + cornerOffset.x, lawnmower.position.y, lawnmower.position.z + cornerOffset.z)
            // const newPositionFlat = new Vector3(newPosition.x, 0, newPosition.z)
            // lawnmower.position.set(newPos.x, newPos.y, newPos.z);
            if (Math.random() > 0.5) this.rock1audio.play()
            else this.rock2audio.play()
            lawnmower.state.velocity = 0
            this.collisionCount += 1
            return false;
          }
          return true;
        })
      }
    }

    getRockPenalty() {
      return this.collisionCount * 10;
    }

}

export default Rocks;
