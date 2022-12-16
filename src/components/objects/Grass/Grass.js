import { Group, ShaderMaterial, DoubleSide, Object3D, PlaneGeometry, InstancedMesh, Clock } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import * as constants from '../../../constants.js';


/**
 * ORIGINAL SOURCE: https://jsfiddle.net/felixmariotto/hvrg721n/
 *
 */

const box_width = constants.GRASS_BLADE_BOX_WIDTH;
const grid_width = constants.FIELD_WIDTH;
const blades_per_box = constants.GRASS_BLADES_PER_BOX;
const cut_box_width = constants.GRASS_CUT_BOX_WIDTH;
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
  	vec3 baseColor = vec3( 0.2, 0.8, 0.3 );
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

const geometry = new PlaneGeometry(0.1, 1, 1, 4);
geometry.translate(0, 0.5, 0); // move grass blade geometry lowest point at 0.
var dummy;

class Grass extends Group {

    constructor(parent, levelofdetail) {
        // Call parent Group() constructor
        super();
        this.grass = [];
        this.clock = new Clock();
        this.startingBlades = 0;
        this.grassMap = {};
        dummy = new Object3D();

        // Position and scale the grass blade instances randomly.
        console.log(levelofdetail)
        let index = 0;
        for (let x = -grid_width / 2 + (box_width / 2); x < grid_width / 2 - (box_width / 2); x += box_width) {
            for (let z = -grid_width / 2 + (box_width / 2); z < grid_width / 2 - (box_width / 2); z += box_width) {
                const instancedMesh = new InstancedMesh(geometry, leavesMaterial, blades_per_box * levelofdetail);
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
                var grassMapIndex = this.cutIndexFromXZ(x_pos, z_pos);
                this.addToGrassCutMap(grassMapIndex, [x_pos, z_pos, index])
                this.startingBlades += 1;
            }
        }
        parent.addToUpdateList(this);
    }

    addToGrassCutMap(key, value) {
        this.grassMap[key] = this.grassMap[key] || [];
        this.grassMap[key].push(value);
    }

    cutIndexFromXZ(x, z) {
        return Math.floor((x + (grid_width / 2)) / cut_box_width) * (grid_width / cut_box_width) + Math.floor((z + (grid_width / 2)) / cut_box_width);
    }

    cutIndicesFromXZ(x, z) {
        var indices = [];
        let baseIndex = this.cutIndexFromXZ(x, z);
        indices.push(baseIndex);
        let indicesInRow = grid_width / cut_box_width;
        if (baseIndex % indicesInRow != indicesInRow - 1) {
            // Top
            indices.push(baseIndex + 1);
        }
        if (baseIndex % indicesInRow != 0) {
            // Bottom
            indices.push(baseIndex - 1);
        }
        if (baseIndex >= indicesInRow) {
            // Left
            indices.push(baseIndex - indicesInRow);
        }
        if (baseIndex < indicesInRow * (indicesInRow - 1)) {
            // Right
            indices.push(baseIndex + indicesInRow);
        }
        if (baseIndex < indicesInRow * (indicesInRow - 1) && baseIndex % indicesInRow != 0) {
            // Bottom right
            indices.push(baseIndex + indicesInRow - 1);
        }
        if (baseIndex < indicesInRow * (indicesInRow - 1) && baseIndex % indicesInRow != indicesInRow - 1) {
            // Top right
            indices.push(baseIndex + indicesInRow + 1);
        }
        if (baseIndex >= indicesInRow && baseIndex % indicesInRow != 0) {
            // Bottom left
            indices.push(baseIndex - indicesInRow + 1);
        }
        if (baseIndex >= indicesInRow && baseIndex % indicesInRow != indicesInRow - 1) {
            // Top left
            indices.push(baseIndex - indicesInRow - 1);
        }
        if (indices.length < 9) {
            console.log("Problem: " + indices.length);
        }
        return indices;
    }

    cut(position, radius) {
        //console.log(position);
        let cutIndices = this.cutIndicesFromXZ(position.x, position.z);
        var cutIndicesBlades = [];
        for (let i = 0; i < cutIndices.length; i++) {
            let blades = this.grassMap[cutIndices[i]];
            cutIndicesBlades = cutIndicesBlades.concat(blades);
        }
        for (let i = 0; i < cutIndicesBlades.length; i++) {
            let [x, z, index] = [cutIndicesBlades[i][0], cutIndicesBlades[i][1], cutIndicesBlades[i][2]];
            let dist = Math.sqrt((x - position.x) * (x - position.x) + (z - position.z) * (z - position.z));
            if (dist < radius) {
                const instancedMesh = new InstancedMesh(geometry, leavesMaterial, blades_per_box);
                dummy.position.set(x, 0, z);
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


    update(timestamp) {
      // Hand a time variable to vertex shader for wind displacement.
      leavesMaterial.uniforms.time.value = timestamp;
      leavesMaterial.uniformsNeedUpdate = true;
      //debugger;
      //this.parent.requestAnimationFrame(this.parent.animate);
      //this.parent.renderer.render(this.parent.scene, this.parent.camera);
    };


}

export default Grass;
