import { Euler, Group, Object3D, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// Model from https://sketchfab.com/3d-models/lawn-mower-low-poly-be7ab00cce174ef1b6045017493591c6
import MODEL from './lawnMower_2.gltf';

class LawnMower extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        this.state = {
            scale: 0.01,
            maxSpeed: 0.3,
            velocity: 0,
            forward: new Vector3(0, 0, 1).normalize(),
        };

        // Adds goal for camera offset to create chase camera
        // Inspired by https://jsfiddle.net/Fyrestar/6519yedL/
        const cameraOffset = new Object3D();
        cameraOffset.position.set(0, 11, -18);
        cameraOffset.name = 'cameraOffset';
        this.add(cameraOffset);

        const loader = new GLTFLoader();

        this.name = 'lawnMower';
        this.position.y = 0.21;

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });

        parent.addToUpdateList(this);
    }

    update(timestamp) {
        if (this.state.velocity !== 0) {
            let movement = this.state.forward
                .clone()
                .multiplyScalar(this.state.velocity);
            this.position.add(movement);
            this.parent.children[3].cut(this.position, 5);
        }
    }

    move(event) {
        const accelMap = {
            ArrowUp: 1,
            ArrowDown: -1,
        };
        const rotMap = {
            ArrowLeft: 1,
            ArrowRight: -1,
        };

        if (event.key in accelMap) {
            this.state.velocity += accelMap[event.key] * this.state.scale;
            if (this.state.velocity > this.state.maxSpeed) {
                this.state.velocity = this.state.maxSpeed;
            } else if (this.state.velocity < -this.state.maxSpeed) {
                this.state.velocity = -this.state.maxSpeed;
            }
        } else if (event.key in rotMap) {
            this.rotation.y += rotMap[event.key] * 0.02 * Math.PI;
            this.state.forward.applyEuler(
                new Euler(0, rotMap[event.key] * 0.02 * Math.PI, 0)
            );
        }
    }
}

export default LawnMower;
