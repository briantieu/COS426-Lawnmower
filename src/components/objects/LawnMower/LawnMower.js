import { Euler, Group, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './lawnMower.gltf';

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
            this.rotation.y += rotMap[event.key] * 0.05 * Math.PI;
            this.state.forward.applyEuler(
                new Euler(0, rotMap[event.key] * 0.05 * Math.PI, 0)
            );
        }
    }
}

export default LawnMower;
