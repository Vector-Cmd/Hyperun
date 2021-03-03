import { Curve } from "./Curve";
import { Vector3 } from "./util/MathUtils";

function CubicPoly() {
    let c0 = 0,
        c1 = 0,
        c2 = 0,
        c3 = 0;

    /*
     * Compute coefficients for a cubic polynomial
     *   p(s) = c0 + c1*s + c2*s^2 + c3*s^3
     * such that
     *   p(0) = x0, p(1) = x1
     *  and
     *   p'(0) = t0, p'(1) = t1.
     */
    function init(x0, x1, t0, t1) {
        c0 = x0;
        c1 = t0;
        c2 = -3 * x0 + 3 * x1 - 2 * t0 - t1;
        c3 = 2 * x0 - 2 * x1 + t0 + t1;
    }

    return {
        initCatmullRom: function (x0, x1, x2, x3, tension) {
            init(x1, x2, tension * (x2 - x0), tension * (x3 - x1));
        },

        initNonuniformCatmullRom: function (x0, x1, x2, x3, dt0, dt1, dt2) {
            // compute tangents when parameterized in [t1,t2]
            let t1 = (x1 - x0) / dt0 - (x2 - x0) / (dt0 + dt1) + (x2 - x1) / dt1;
            let t2 = (x2 - x1) / dt1 - (x3 - x1) / (dt1 + dt2) + (x3 - x2) / dt2;

            // rescale tangents for parametrization in [0,1]
            t1 *= dt1;
            t2 *= dt1;

            init(x1, x2, t1, t2);
        },

        calc: function (t) {
            let t2 = t * t;
            let t3 = t2 * t;
            return c0 + c1 * t + c2 * t2 + c3 * t3;
        }
    };
}

let tmp = new Vector3();
let px = CubicPoly(),
    py = CubicPoly(),
    pz = CubicPoly();

export class CatmullRomCurve3 extends Curve<Vector3> {
    public points: Array<Vector3>;
    public closed: boolean;
    public curveType: string;
    public tension: number;
    public isCatmullRomCurve3: boolean;
    constructor(points?: Array<Vector3>, closed?: boolean, curveType?: string, tension?: number) {
        super();

        this.type = "CatmullRomCurve3";

        this.points = points || new Array<Vector3>();
        this.closed = closed || false;
        this.curveType = curveType || "centripetal";
        this.tension = tension || 0.5;
        this.isCatmullRomCurve3 = true;
    }

    public getPoint(t: number, optionalTarget?: Vector3): Vector3 {
        let point = optionalTarget || new Vector3();

        let points = this.points;
        let l = points.length;

        let p = (l - (this.closed ? 0 : 1)) * t;
        let intPoint = Math.floor(p);
        let weight = p - intPoint;

        if (this.closed) {
            intPoint += intPoint > 0 ? 0 : (Math.floor(Math.abs(intPoint) / l) + 1) * l;
        } else if (weight === 0 && intPoint === l - 1) {
            intPoint = l - 2;
            weight = 1;
        }

        let p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3; // 4 points

        if (this.closed || intPoint > 0) {
            p0 = points[(intPoint - 1) % l];
        } else {
            // extrapolate first point
            Vector3.subtract(points[0], points[1], tmp);
            Vector3.add(tmp, points[0], tmp);
            // tmp.subVectors(points[0], points[1]).add(points[0]);
            p0 = tmp;
        }

        p1 = points[intPoint % l];
        p2 = points[(intPoint + 1) % l];

        if (this.closed || intPoint + 2 < l) {
            p3 = points[(intPoint + 2) % l];
        } else {
            // extrapolate last point
            Vector3.subtract(points[l - 1], points[l - 2], tmp);
            Vector3.add(tmp, points[l - 1], tmp);
            // tmp.subVectors(points[l - 1], points[l - 2]).add(points[l - 1]);
            p3 = tmp;
        }

        if (this.curveType === "centripetal" || this.curveType === "chordal") {
            // init Centripetal / Chordal Catmull-Rom
            let pow = this.curveType === "chordal" ? 0.5 : 0.25;
            let dt0 = Math.pow(Vector3.distanceSquared(p0, p1), pow);
            let dt1 = Math.pow(Vector3.distanceSquared(p1, p2), pow);
            let dt2 = Math.pow(Vector3.distanceSquared(p2, p3), pow);
            // let dt0 = Math.pow(p0.distanceToSquared(p1), pow);
            // let dt1 = Math.pow(p1.distanceToSquared(p2), pow);
            // let dt2 = Math.pow(p2.distanceToSquared(p3), pow);

            // safety check for repeated points
            if (dt1 < 1e-4) dt1 = 1.0;
            if (dt0 < 1e-4) dt0 = dt1;
            if (dt2 < 1e-4) dt2 = dt1;

            px.initNonuniformCatmullRom(p0.x, p1.x, p2.x, p3.x, dt0, dt1, dt2);
            py.initNonuniformCatmullRom(p0.y, p1.y, p2.y, p3.y, dt0, dt1, dt2);
            pz.initNonuniformCatmullRom(p0.z, p1.z, p2.z, p3.z, dt0, dt1, dt2);
        } else if (this.curveType === "catmullrom") {
            px.initCatmullRom(p0.x, p1.x, p2.x, p3.x, this.tension);
            py.initCatmullRom(p0.y, p1.y, p2.y, p3.y, this.tension);
            pz.initCatmullRom(p0.z, p1.z, p2.z, p3.z, this.tension);
        }

        point.setValue(px.calc(weight), py.calc(weight), pz.calc(weight));

        return point;
    }

    /**
     * 销毁曲线
     * @param clearPath 是否清除路径点，如果清楚则外部引用的路径点也会被清除
     */
    public destroy(clearPath?: boolean) {
        super.destroy();
        clearPath && (this.points.length = 0);
        this.points = null;
        this.closed = null;
        this.curveType = null;
        this.tension = null;
        this.isCatmullRomCurve3 = null;
    }
}
