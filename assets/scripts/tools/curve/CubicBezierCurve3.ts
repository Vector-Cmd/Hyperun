import { Curve } from "./Curve";
import { CubicBezier } from "./util/Interpolations";
import { Vector3 } from "./util/MathUtils";

export class CubicBezierCurve3 extends Curve<Vector3> {
    public v0: Vector3;
    public v1: Vector3;
    public v2: Vector3;
    public v3: Vector3;

    public isCubicBezierCurve3 = true;

    constructor(v0?: Vector3, v1?: Vector3, v2?: Vector3, v3?: Vector3) {
        super();

        this.type = "CubicBezierCurve3";

        this.v0 = v0 || new Vector3();
        this.v1 = v1 || new Vector3();
        this.v2 = v2 || new Vector3();
        this.v3 = v3 || new Vector3();
    }

    public getPoint(t: number, optionalTarget?: Vector3): Vector3 {
        var point = optionalTarget || new Vector3();

        var v0 = this.v0,
            v1 = this.v1,
            v2 = this.v2,
            v3 = this.v3;

        point.setValue(CubicBezier(t, v0.x, v1.x, v2.x, v3.x), CubicBezier(t, v0.y, v1.y, v2.y, v3.y), CubicBezier(t, v0.z, v1.z, v2.z, v3.z));

        return point;
    }
}
