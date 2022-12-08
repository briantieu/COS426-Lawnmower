import { Group, ShaderMaterial, DoubleSide, Object3D, PlaneGeometry, InstancedMesh} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

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
  	vec3 baseColor = vec3( 0.41, 1.0, 0.5 );
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

class Grass extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        const instanceNumber = 5000;
        const dummy = new Object3D();
        const geometry = new PlaneGeometry(0.1, 1, 1, 4);

        geometry.translate(0, 0.5, 0); // move grass blade geometry lowest point at 0.
        const instancedMesh = new InstancedMesh(geometry, leavesMaterial, instanceNumber);
        super.add(instancedMesh);

        // Position and scale the grass blade instances randomly.

        for (let i = 0; i < instanceNumber; i++) {
            dummy.position.set((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10);
            dummy.scale.setScalar(0.5 + Math.random() * 0.5);
            dummy.rotation.y = Math.random() * Math.PI;
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, dummy.matrix);
        }
    }
}

export default Grass;
