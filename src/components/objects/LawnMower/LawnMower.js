import { BoxGeometry, Euler, Group, Mesh, Object3D, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// Model from https://sketchfab.com/3d-models/lawn-mower-low-poly-be7ab00cce174ef1b6045017493591c6
import MODEL from './lawnMower_2_no_bag.gltf';
import * as constants from '../../../constants.js';

class LawnMower extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        this.state = {
            velocityScale: 0.01,
            maxSpeed: 0.24,
            velocity: 0,
            forward: new Vector3(0, 0, 1).normalize(),
            cutRadius: 1
        };

        this.soundeffect = new Audio('src/audio/lawnmower.mp3');
        this.soundeffect.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);

        // Adds goal for camera offset to create chase camera
        // Inspired by https://jsfiddle.net/Fyrestar/6519yedL/
        const cameraOffset = new Object3D();
        cameraOffset.position.set(0, 11, -18);
        cameraOffset.name = 'cameraOffset';
        this.add(cameraOffset);

        // Bounding box
        const bBox = new BoxGeometry(1.2, 1, 2.6);
        const bBoxMesh = new Mesh(bBox);
        bBoxMesh.position.set(0, 0.21, 0.1)
        bBoxMesh.material.visible = false;
        this.add(bBoxMesh);
        this.boundingBox = bBoxMesh

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
            this.parent.children[constants.GRASS_INDEX].cut(this.position, this.state.cutRadius); // cut grass
            this.parent.children[constants.ROCKS_INDEX].collide(this.boundingBox); // collide with rocks
            this.parent.children[constants.WEEDS_INDEX].cut(this.position, this.state.cutRadius) // cut weeds
            this.parent.children[constants.FENCE_INDEX].collide(this.position);
        }
    }

    move(event) {
        const accelMap = {
            ArrowUp: 1,
            ArrowDown: -1,
            w: 1,
            s: -1,
        };
        const rotMap = {
            ArrowLeft: 1,
            ArrowRight: -1,
            a: 1,
            d: -1,
        };

        if (event.key in accelMap) {
            if (Math.abs(this.state.velocity) > 0.05) {
                this.soundeffect.volume = 0.2;
                this.soundeffect.play();
            }
            this.state.velocity += accelMap[event.key] * this.state.velocityScale;
            if (this.state.velocity > this.state.maxSpeed) {
                this.state.velocity = this.state.maxSpeed;
            } else if (this.state.velocity < -this.state.maxSpeed) {
                this.state.velocity = -this.state.maxSpeed;
            }
            if (Math.abs(this.state.velocity) <= 0.05) {
                this.soundeffect.volume = 0;
            } else {
                this.soundeffect.volume = 0.2 * Math.abs((this.state.velocity / this.state.maxSpeed));
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
