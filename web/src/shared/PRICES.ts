import {toNano} from "ton";

const CREATE = toNano(0.01);
const VIEW = toNano(0.00005);
const LIKE = toNano(0.01);
const FIRE = toNano(0.1);
const DIAMOND = toNano(1);

const REACT = {
    like: LIKE,
    fire: FIRE,
    brilliant: DIAMOND
}

export default {
    CREATE,
    VIEW,
    REACT
}
