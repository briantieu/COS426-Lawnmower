import { Clock, Group, ShaderMaterial, DoubleSide, Object3D, PlaneGeometry, InstancedMesh, FrontSide, Vector3, VertexColors} from 'three';
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

    float modI(float a,float b) {
        float m=a-floor((a+0.5)/b)*b;
        return floor(m+0.5);
    }

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


    vec2 fractionalPos = 0.5 + mvPosition.xz / 25.0;
    fractionalPos.x = 0.5 + (mvPosition.x + 25.0) / 25.0;
    fractionalPos.y = 0.5 + (mvPosition.z + 25.0) / 25.0;

    //To make it seamless, make it a multiple of 2*PI
    fractionalPos *= 2.0 * 3.14159;

    //Wind is sine waves in time.
    float index = (mvPosition.x + 25.0) + mvPosition.z;
    index = index - floor((index / 7.0)) * 7.0;
    float noise = 0.5 + 0.5 * sin(index + time);
    float halfAngle = -noise * 0.1;
    noise = 0.5 + 0.5 * cos(index / 3.0 + time);
    halfAngle -= noise * 0.05 + 1.0;

	vec4 direction = normalize(vec4(sin(halfAngle), 0.0, -sin(halfAngle), cos(halfAngle)));

    index = float(int(((mvPosition.x + (50.0 / 2.0)) / 1.0) * (50.0 / 1.0) + (mvPosition.z + (50.0 / 2.0)) / 1.0)) / 300.0;

    float random = (mvPosition.x + mvPosition.y) - floor((mvPosition.x + mvPosition.y) / 0.4) * 0.4;

    index = index - floor((index / 5.0)) * 5.0;
    index = index / 15.0;
    mvPosition.z += random / 2.5 * sin(time + random * 3.0) * direction.z * ( 0.3 * dispPower );
    mvPosition.x += random / 2.5 * sin(time + random * 3.0) * direction.x * ( 0.3 * dispPower );

    //

    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;

	}
`;

const fragmentShader = `
  varying vec2 vUv;

  void main() {
  	vec3 baseColor = vec3( 0.23, 0.9, 0.23 );
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


const box_width = constants.GRASS_BLADE_BOX_WIDTH;
const grid_width = constants.FIELD_WIDTH;
const blades_per_box = constants.GRASS_BLADES_PER_BOX;
const numWeedPatches = constants.NUM_WEED_PATCHES;
const weedPatchSize = constants.WEED_PATCH_SIZE;
const geometry = new PlaneGeometry(0.1, 8, 1, 4);
geometry.translate(0, 0.5, 0); // move grass blade geometry lowest point at 0.
var dummy;

class Weeds extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();
        this.clock = new Clock();
        this.grass = [];
        dummy = new Object3D();
        this.powerupaudio = new Audio('src/audio/powerup.mp3')

        // Position and scale the grass blade instances randomly.

        this.weedPositions = []
        for (let i = 0; i < numWeedPatches; i++) {
            const xRand = (Math.random() - 0.5) * grid_width
            const zRand = (Math.random() - 0.5) * grid_width
            if (Math.sqrt(xRand ** 2 + zRand ** 2) < 3) {
                i--;
            } else {
                this.weedPositions.push(new Vector3(xRand, 0, zRand))
            }
        }


        let index = 0;
        for (let x = -grid_width / 2; x < grid_width / 2; x += box_width) {
            for (let z = -grid_width / 2; z < grid_width / 2; z += box_width) {

                let x_pos = x + (Math.random() - 0.5) * box_width;
                    let z_pos = z + (Math.random() - 0.5) * box_width;
                    const pos = new Vector3(x_pos, 0, z_pos)
                this.weedPositions.every(weedPosition => {
                    if (weedPosition.distanceTo(pos) <= weedPatchSize) {
                        const instancedMesh = new InstancedMesh(geometry, leavesMaterial, blades_per_box);

                        dummy.position.set(x_pos, 0, z_pos);
                        dummy.scale.setScalar(0.2 + Math.random() * 0.5);
                        dummy.rotation.y = Math.random() * Math.PI;
                        dummy.updateMatrix();
                        instancedMesh.setMatrixAt(0, dummy.matrix);
                        this.grass.push([x_pos, z_pos, index])
                        super.add(instancedMesh);
                        index += 1;
                        return false;
                    }
                    return true;
                })

            }
        }
        parent.addToUpdateList(this);
    }

    cut(position, radius) {
        //console.log(position);
        for (let i = 0; i < this.grass.length; i++) {
            let [x, z, index] = [this.grass[i][0], this.grass[i][1],  this.grass[i][2]];
            let dist = Math.sqrt((x - position.x) * (x - position.x) + (z - position.z) * (z - position.z));
            if (dist < radius) {
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

        // enlargen lawnmower on hit
        this.weedPositions.forEach((weedPosition) => {
            // console.log(this.parent.children[4].state.cutRadius)
            if (position.distanceTo(weedPosition) <= 2) {
                this.parent.children[constants.LAWNMOWER_INDEX].scale.addScalar(0.2)
                this.parent.children[constants.LAWNMOWER_INDEX].state.cutRadius += 0.2
                this.powerupaudio.play()

                setTimeout(() => {
                    this.parent.children[constants.LAWNMOWER_INDEX].scale.subScalar(0.2)
                    this.parent.children[constants.LAWNMOWER_INDEX].state.cutRadius -= 0.2
                }, 10000)
                this.weedPositions = this.weedPositions.filter((weedPos) => position.distanceTo(weedPos) > 2.1)

            }
        })
    }
    update(timestamp) {
        // Hand a time variable to vertex shader for wind displacement.
        leavesMaterial.uniforms.time.value = timestamp;
        leavesMaterial.uniformsNeedUpdate = true;
        //debugger;
        //this.parent.requestAnimationFrame(this.parent.animate);
        //this.parent.renderer.render(this.parent.scene, this.parent.camera);
    };
}

export default Weeds;
