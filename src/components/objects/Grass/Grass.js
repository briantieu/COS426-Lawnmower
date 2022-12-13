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


const box_width = 0.25;
const grid_width = 50;
const blades_per_box = 1;
const geometry = new PlaneGeometry(0.1, 1, 1, 4);
geometry.translate(0, 0.5, 0); // move grass blade geometry lowest point at 0.
var dummy;

class Grass extends Group {

    constructor(parent) {
        // Call parent Group() constructor
        super();
        this.grass = [];
        this.startingBlades = 0;
        dummy = new Object3D();

        // Position and scale the grass blade instances randomly.

        let index = 0;
        for (let x = -grid_width / 2; x < grid_width / 2; x += box_width) {
            for (let z = -grid_width / 2; z < grid_width / 2; z += box_width) {
                const instancedMesh = new InstancedMesh(geometry, leavesMaterial, blades_per_box);
                let x_pos = x + (Math.random() - 0.5) * box_width;
                let z_pos = z + (Math.random() - 0.5) * box_width;
                dummy.position.set(x_pos, 0, z_pos);
                dummy.scale.setScalar(0.2 + Math.random() * 0.5);
                dummy.rotation.y = Math.random() * Math.PI;
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(0, dummy.matrix);
                this.grass.push([x_pos, z_pos, index])
                super.add(instancedMesh);
                index += 1;
                this.startingBlades += 1;
            }
        }
    }

    cut(position, radius) {
        //console.log(position);
        for (let i = 0; i < this.grass.length; i++) {
            let [x, z, index] = [this.grass[i][0], this.grass[i][1],  this.grass[i][2]];
            let dist = Math.sqrt((x - position.x) * (x - position.x) + (z - position.z) * (z - position.z));
            if (dist < 0.5) {
                const instancedMesh = new InstancedMesh(geometry, leavesMaterial, blades_per_box);
                dummy.position.set(position.x, 0, position.z);
                dummy.scale.setScalar(0);
                dummy.rotation.y = Math.random() * Math.PI;
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(0, dummy.matrix);
                this.children[index] = instancedMesh;
                this.grass.splice(i, 1);
            }
        }
        /*let index = Math.floor((position.x + (grid_width / 2)) / box_width) * (grid_width / box_width) + Math.floor((position.z + (grid_width / 2)) / box_width);
        const instancedMesh = new InstancedMesh(geometry, leavesMaterial, blades_per_box);
        for (let j = 0; j < 1; j++) {
            dummy.position.set(position.x, 0, position.z);
            dummy.scale.setScalar(0);
            dummy.rotation.y = Math.random() * Math.PI;
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(j, dummy.matrix);
        }
        if (index < this.children.length) {
            this.children[index] = instancedMesh;
        }
        */
    }

    getScore() {
        let percentCut = (1 - (this.grass.length / this.startingBlades));
        return Math.round(percentCut * 1000);
    }
}

export default Grass;
