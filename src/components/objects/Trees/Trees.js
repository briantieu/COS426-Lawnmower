import { Group, ShaderMaterial, DoubleSide, Object3D, Geometry, PlaneGeometry, SphereGeometry, InstancedMesh, ConeGeometry, CylinderGeometry} from 'three';
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
  	vec3 baseColor = vec3(1.0, 0.0, 0.0);
    float clarity = ( vUv.y * 0.5 ) + 0.5;
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

const outer_size = constants.TREES_OUTER_EDGE;
const inner_size = constants.TREES_INNER_EDGE;
const instanceNumber = constants.NUM_TREES;

class Trees extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        const dummy = new Object3D();

        const geometry = new Geometry()
        const cylinder = new CylinderGeometry(0.5, 0.5, 3, 10, 1)
        geometry.merge(cylinder)
        const cone1 = new ConeGeometry(2.4, 5, 10, 1, false)
        cone1.translate(0,4,0)
        geometry.merge(cone1)
        const cone2 = new ConeGeometry(2.1, 4, 10, 1, false)
        cone2.translate(0,5,0)
        geometry.merge(cone2)
        const cone3 = new ConeGeometry(2, 3, 10, 1, false)
        cone3.translate(0,5.5,0)
        geometry.merge(cone3)

        // geometry.translate(0, 0, 0); // move grass blade geometry lowest point at 0.
        const instancedMesh = new InstancedMesh(geometry, leavesMaterial, instanceNumber);

        // Position and scale the grass blade instances randomly.
        for (let i = 0; i < instanceNumber; i++) {
          let [x, z] = [(Math.random() - 0.5) * 2 * outer_size, (Math.random() - 0.5) * 2 * outer_size];
          if (x <= inner_size && x >= -inner_size && z <= inner_size + 40 && z >= -inner_size) {
            i--;
            continue;
          }
          dummy.position.set(x, 0, z);
          dummy.scale.setScalar(2 + Math.random());
          dummy.rotation.y = Math.random() * Math.PI;
          dummy.updateMatrix();
          instancedMesh.setMatrixAt(i, dummy.matrix);
        }
        super.add(instancedMesh);
    }
}

export default Trees;
