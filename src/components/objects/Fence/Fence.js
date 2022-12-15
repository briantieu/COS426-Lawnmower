import { Group,
    AnimationMixer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import MODEL from './fence.gltf';
import * as constants from '../../../constants.js';

require('./fence.bin');
require('./wood.jpg');

class Fence extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        // Load object
        const loader = new GLTFLoader();

        this.name = 'fences';

        // Fence model created by Silas
        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
            gltf.scene.scale.setScalar(0.55)
        });

        this.position.x = -(constants.FIELD_WIDTH / 2) - 1;
        this.position.z = (constants.FIELD_WIDTH / 2) + 1;
    }

    collide(position) {
        if (position.z > 25) {
            this.parent.children[constants.LAWNMOWER_INDEX].z = 24;
            this.parent.children[constants.LAWNMOWER_INDEX].state.velocity = 0;
        }
        if (position.z < -25) {
            this.parent.children[constants.LAWNMOWER_INDEX].z = -24;
            this.parent.children[constants.LAWNMOWER_INDEX].state.velocity = 0;
        }
        if (position.x > 25) {
            this.parent.children[constants.LAWNMOWER_INDEX].x = 24;
            this.parent.children[constants.LAWNMOWER_INDEX].state.velocity = 0;
        }
        if (position.x < -25) {
            this.parent.children[constants.LAWNMOWER_INDEX].x = -24;
            this.parent.children[constants.LAWNMOWER_INDEX].state.velocity = 0;
        }
    }
}

export default Fence;
