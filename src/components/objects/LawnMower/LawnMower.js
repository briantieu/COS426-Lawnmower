import { Group, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './lawnMower.gltf';

class LawnMower extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'lawnMower';
        this.position.y = 0.21;

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });

        parent.addToUpdateList(this);
    }

    update(timestamp) {
        return;
    }

    move(event) {
        const keyMap = {
            ArrowUp: new Vector3(0, 1, 0),
            ArrowDown: new Vector3(0, -1, 0),
            ArrowLeft: new Vector3(-1, 0, 0),
            ArrowRight: new Vector3(1, 0, 0),
        };

        const scale = 1;

        if (event.key in keyMap) {
            this.position.add(keyMap[event.key].clone().multiplyScalar(scale));
        }
    }
}

export default LawnMower;
