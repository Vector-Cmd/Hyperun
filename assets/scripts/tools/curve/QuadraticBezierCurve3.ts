import { Curve } from "./Curve";
import { QuadraticBezier } from "./util/Interpolations";
import { Vector3 } from "./util/MathUtils";

export class QuadraticBezierCurve3 extends Curve<Vector3> {
    public v0: Vector3;
    public v1: Vector3;
    public v2: Vector3;

    public isQuadraticBezierCurve3 = true;

    constructor(v0?: Vector3, v1?: Vector3, v2?: Vector3) {
        super();

        this.type = "QuadraticBezierCurve3";

        this.v0 = v0 || new Vector3();
        this.v1 = v1 || new Vector3();
        this.v2 = v2 || new Vector3();
    }

    public getPoint(t: number, optionalTarget?: Vector3): Vector3 {
        let point = optionalTarget || new Vector3();

        let v0 = this.v0,
            v1 = this.v1,
            v2 = this.v2;

        point.setValue(
            QuadraticBezier(t, v0.x, v1.x, v2.x),
            QuadraticBezier(t, v0.y, v1.y, v2.y),
            QuadraticBezier(t, v0.z, v1.z, v2.z)
        );

        return point;
    }
}
