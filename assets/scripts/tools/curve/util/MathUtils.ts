import { Mat4, Vec3 } from "cc";

var _lut = [];

for (var i = 0; i < 256; i++) {
    _lut[i] = (i < 16 ? "0" : "") + i.toString(16);
}

//<=============> 换引擎的时候直接换 Vector3 Matrix4x4 里面的实现方法即可 <=============>
class Vector3 {
    private v3: Vec3;

    get x() {
        return this.v3.x;
    }
    get y() {
        return this.v3.y;
    }
    get z() {
        return this.v3.z;
    }
    set x(val: number) {
        this.v3.x = val;
    }
    set y(val: number) {
        this.v3.y = val;
    }
    set z(val: number) {
        this.v3.z = val;
    }

    get vec3() {
        return this.v3;
    }

    constructor(x?: number | Vec3, y?: number, z?: number) {
        if (typeof x == "object") {
            this.v3 = x;
            return;
        }
        this.v3 = new Vec3(x, y, z);
    }

    public static subtract(p1: Vector3, p2: Vector3, out: Vector3) {
        Vec3.subtract(out.vec3, p1.vec3, p2.vec3);
    }
    public static add(p1: Vector3, p2: Vector3, out: Vector3) {
        Vec3.add(out.vec3, p1.vec3, p2.vec3);
    }
    public static distanceSquared(p1: Vector3, p2: Vector3) {
        return Vec3.squaredDistance(p1.vec3, p2.vec3);
    }
    public static distance(p1: Vector3, p2: Vector3) {
        return Vec3.distance(p1.vec3, p2.vec3);
    }
    public static normalize(v: Vector3, out: Vector3) {
        Vec3.normalize(out.vec3, v);
    }
    public static cross(p1: Vector3, p2: Vector3, out: Vector3) {
        Vec3.cross(out.vec3, p1.vec3, p2.vec3);
    }
    public static dot(p1: Vector3, p2: Vector3) {
        return Vec3.dot(p1.vec3, p2.vec3);
    }
    public static transformV3ToV3(v: Vector3, m: Matrix4x4, out: Vector3) {
        Vec3.transformMat4(out.vec3, v.vec3, m.mat4);
    }

    public setValue(x: number, y: number, z: number) {
        this.v3.set(x, y, z);
    }
    public clone() {
        let newVec3 = new Vector3();
        newVec3.setValue(this.x, this.y, this.z);
        return newVec3;
    }
}
class Matrix4x4 {
    private mMat4: Mat4;

    get mat4() {
        return this.mat4;
    }

    constructor() {
        this.mMat4 = new Mat4();
    }

    public static createRotationAxis(axis: Vector3, rad: number, out: Matrix4x4) {
        Mat4.fromRotation(out.mat4, rad, axis);
    }
}

var MathUtils = {
    DEG2RAD: Math.PI / 180,
    RAD2DEG: 180 / Math.PI,
    baseUp: new Vector3(0, 1, 0),
    right: new Vector3(),
    forward: new Vector3(),
    up: new Vector3(),
    vA: new Vector3(),
    vB: new Vector3(),
    vC: new Vector3(),
    vD: new Vector3(),

    generateUUID: function () {
        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136

        var d0 = (Math.random() * 0xffffffff) | 0;
        var d1 = (Math.random() * 0xffffffff) | 0;
        var d2 = (Math.random() * 0xffffffff) | 0;
        var d3 = (Math.random() * 0xffffffff) | 0;
        var uuid =
            _lut[d0 & 0xff] +
            _lut[(d0 >> 8) & 0xff] +
            _lut[(d0 >> 16) & 0xff] +
            _lut[(d0 >> 24) & 0xff] +
            "-" +
            _lut[d1 & 0xff] +
            _lut[(d1 >> 8) & 0xff] +
            "-" +
            _lut[((d1 >> 16) & 0x0f) | 0x40] +
            _lut[(d1 >> 24) & 0xff] +
            "-" +
            _lut[(d2 & 0x3f) | 0x80] +
            _lut[(d2 >> 8) & 0xff] +
            "-" +
            _lut[(d2 >> 16) & 0xff] +
            _lut[(d2 >> 24) & 0xff] +
            _lut[d3 & 0xff] +
            _lut[(d3 >> 8) & 0xff] +
            _lut[(d3 >> 16) & 0xff] +
            _lut[(d3 >> 24) & 0xff];

        // .toUpperCase() here flattens concatenated strings to save heap memory space.
        return uuid.toUpperCase();
    },

    clamp: function (value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    // compute euclidian modulo of m % n
    // https://en.wikipedia.org/wiki/Modulo_operation

    euclideanModulo: function (n, m) {
        return ((n % m) + m) % m;
    },

    // Linear mapping from range <a1, a2> to range <b1, b2>

    mapLinear: function (x, a1, a2, b1, b2) {
        return b1 + ((x - a1) * (b2 - b1)) / (a2 - a1);
    },

    // https://en.wikipedia.org/wiki/Linear_interpolation

    lerp: function (x, y, t) {
        return (1 - t) * x + t * y;
    },

    // http://en.wikipedia.org/wiki/Smoothstep

    smoothstep: function (x, min, max) {
        if (x <= min) return 0;
        if (x >= max) return 1;

        x = (x - min) / (max - min);

        return x * x * (3 - 2 * x);
    },

    smootherstep: function (x, min, max) {
        if (x <= min) return 0;
        if (x >= max) return 1;

        x = (x - min) / (max - min);

        return x * x * x * (x * (x * 6 - 15) + 10);
    },

    // Random integer from <low, high> interval

    randInt: function (low, high) {
        return low + Math.floor(Math.random() * (high - low + 1));
    },

    // Random float from <low, high> interval

    randFloat: function (low, high) {
        return low + Math.random() * (high - low);
    },

    // Random float from <-range/2, range/2> interval

    randFloatSpread: function (range) {
        return range * (0.5 - Math.random());
    },

    degToRad: function (degrees) {
        return degrees * MathUtils.DEG2RAD;
    },

    radToDeg: function (radians) {
        return radians * MathUtils.RAD2DEG;
    },

    isPowerOfTwo: function (value) {
        return (value & (value - 1)) === 0 && value !== 0;
    },

    ceilPowerOfTwo: function (value) {
        return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
    },

    floorPowerOfTwo: function (value) {
        return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
    },

    setQuaternionFromProperEuler: function (q, a, b, c, order) {
        // Intrinsic Proper Euler Angles - see https://en.wikipedia.org/wiki/Euler_angles

        // rotations are applied to the axes in the order specified by 'order'
        // rotation by angle 'a' is applied first, then by angle 'b', then by angle 'c'
        // angles are in radians

        var cos = Math.cos;
        var sin = Math.sin;

        var c2 = cos(b / 2);
        var s2 = sin(b / 2);

        var c13 = cos((a + c) / 2);
        var s13 = sin((a + c) / 2);

        var c1_3 = cos((a - c) / 2);
        var s1_3 = sin((a - c) / 2);

        var c3_1 = cos((c - a) / 2);
        var s3_1 = sin((c - a) / 2);

        if (order === "XYX") {
            q.set(c2 * s13, s2 * c1_3, s2 * s1_3, c2 * c13);
        } else if (order === "YZY") {
            q.set(s2 * s1_3, c2 * s13, s2 * c1_3, c2 * c13);
        } else if (order === "ZXZ") {
            q.set(s2 * c1_3, s2 * s1_3, c2 * s13, c2 * c13);
        } else if (order === "XZX") {
            q.set(c2 * s13, s2 * s3_1, s2 * c3_1, c2 * c13);
        } else if (order === "YXY") {
            q.set(s2 * c3_1, c2 * s13, s2 * s3_1, c2 * c13);
        } else if (order === "ZYZ") {
            q.set(s2 * s3_1, s2 * c3_1, c2 * s13, c2 * c13);
        } else {
            console.warn("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order.");
        }
    }
};

export { MathUtils, Vector3, Matrix4x4 };
