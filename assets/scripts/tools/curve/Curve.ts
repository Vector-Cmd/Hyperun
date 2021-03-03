import { MathUtils, Matrix4x4, Vector3 } from "./util/MathUtils";

export class Curve<T extends Vector3> {
    public type = "Curve";
    public arcLengthDivisions = 200;
    public cacheArcLengths: Array<number>;
    public needsUpdate: boolean;

    // Virtual base class method to overwrite and implement in subclasses
    //	- t [0 .. 1]

    public getPoint(t: number, optionalTarget?: T): T {
        console.warn("Curve: .getPoint() not implemented.");
        return null;
    }

    // Get point at relative position in curve according to arc length
    // - u [0 .. 1]

    public getPointAt(u: number, optionalTarget?: T): T {
        let t = this.getUtoTmapping(u);
        return this.getPoint(t, optionalTarget);
    }

    // Get sequence of points using getPoint( t )

    public getPoints(divisions?: number): T[] {
        if (divisions === undefined) divisions = 5;

        let points = new Array<T>();

        for (let d = 0; d <= divisions; d++) {
            points.push(this.getPoint(d / divisions));
        }

        return points;
    }

    // Get sequence of points using getPointAt( u )

    public getSpacedPoints(divisions?: number): T[] {
        if (divisions === undefined) divisions = 5;

        let points = new Array<T>();

        for (let d = 0; d <= divisions; d++) {
            points.push(this.getPointAt(d / divisions));
        }

        return points;
    }

    // Get total curve arc length

    public getLength(): number {
        let lengths = this.getLengths();
        return lengths[lengths.length - 1];
    }

    // Get list of cumulative segment lengths

    public getLengths(divisions?: number): number[] {
        if (divisions === undefined) divisions = this.arcLengthDivisions;

        if (this.cacheArcLengths && this.cacheArcLengths.length === divisions + 1 && !this.needsUpdate) {
            return this.cacheArcLengths;
        }

        this.needsUpdate = false;

        let cache = new Array<number>();
        let current,
            last = this.getPoint(0);
        let p,
            sum = 0;

        cache.push(0);

        for (p = 1; p <= divisions; p++) {
            current = this.getPoint(p / divisions);
            sum += Vector3.distance(current, last);
            cache.push(sum);
            last = current;
        }

        this.cacheArcLengths = cache;

        return cache; // { sums: cache, sum: sum }; Sum is in the last element.
    }

    public updateArcLengths(): void {
        this.needsUpdate = true;
        this.getLengths();
    }

    // Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equidistant

    public getUtoTmapping(u: number, distance?: number): number {
        let arcLengths = this.getLengths();

        let i = 0,
            il = arcLengths.length;

        let targetArcLength; // The targeted u distance value to get

        if (distance) {
            targetArcLength = distance;
        } else {
            targetArcLength = u * arcLengths[il - 1];
        }

        // binary search for the index with largest value smaller than target u distance

        let low = 0,
            high = il - 1,
            comparison;

        while (low <= high) {
            i = Math.floor(low + (high - low) / 2); // less likely to overflow, though probably not issue here, JS doesn't really have integers, all numbers are floats

            comparison = arcLengths[i] - targetArcLength;

            if (comparison < 0) {
                low = i + 1;
            } else if (comparison > 0) {
                high = i - 1;
            } else {
                high = i;
                break;

                // DONE
            }
        }

        i = high;

        if (arcLengths[i] === targetArcLength) {
            return i / (il - 1);
        }

        // we could get finer grain at lengths, or use simple interpolation between two points

        let lengthBefore = arcLengths[i];
        let lengthAfter = arcLengths[i + 1];

        let segmentLength = lengthAfter - lengthBefore;

        // determine where we are between the 'before' and 'after' points

        let segmentFraction = (targetArcLength - lengthBefore) / segmentLength;

        // add that fractional amount to t

        let t = (i + segmentFraction) / (il - 1);

        return t;
    }

    // Returns a unit vector tangent at t
    // In case any sub curve does not implement its tangent derivation,
    // 2 points a small delta apart will be used to find its gradient
    // which seems to give a reasonable approximation

    public getTangent(t: number, optionalTarget?: T): T {
        let delta = 0.0001;
        let t1 = t - delta;
        let t2 = t + delta;

        // Capping in case of danger

        if (t1 < 0) t1 = 0;
        if (t2 > 1) t2 = 1;

        let pt1 = this.getPoint(t1);
        let pt2 = this.getPoint(t2);

        let vec = optionalTarget || new Vector3();
        Vector3.subtract(pt2, pt1, vec);
        Vector3.normalize(vec, vec);
        //@ts-ignore
        return vec;
    }

    public getTangentAt(u: number, optionalTarget?: T): T {
        let t = this.getUtoTmapping(u);
        return this.getTangent(t, optionalTarget);
    }

    public computeFrenetFrames(segments, closed) {
        // see http://www.cs.indiana.edu/pub/techreports/TR425.pdf

        let normal = new Vector3();

        let tangents = new Array<Vector3>();
        let normals = new Array<Vector3>();
        let binormals = new Array<Vector3>();

        let vec = new Vector3();
        let mat = new Matrix4x4();

        let i, u, theta;

        // compute the tangent vectors for each segment on the curve

        for (i = 0; i <= segments; i++) {
            u = i / segments;

            tangents[i] = this.getTangentAt(u);
            Vector3.normalize(tangents[i], tangents[i]);
        }

        // select an initial normal vector perpendicular to the first tangent vector,
        // and in the direction of the minimum tangent xyz component

        normals[0] = new Vector3();
        binormals[0] = new Vector3();
        let min = Number.MAX_VALUE;
        let tx = Math.abs(tangents[0].x);
        let ty = Math.abs(tangents[0].y);
        let tz = Math.abs(tangents[0].z);

        if (tx <= min) {
            min = tx;
            normal.setValue(1, 0, 0);
        }

        if (ty <= min) {
            min = ty;
            normal.setValue(0, 1, 0);
        }

        if (tz <= min) {
            normal.setValue(0, 0, 1);
        }

        // vec.crossVectors(tangents[0], normal).normalize();
        Vector3.cross(tangents[0], normal, vec);
        Vector3.normalize(vec, vec);

        Vector3.cross(tangents[0], vec, normals[0]);
        Vector3.cross(tangents[0], normals[0], binormals[0]);
        // normals[0].crossVectors(tangents[0], vec);
        // binormals[0].crossVectors(tangents[0], normals[0]);

        // compute the slowly-varying normal and binormal vectors for each segment on the curve

        for (i = 1; i <= segments; i++) {
            normals[i] = normals[i - 1].clone();

            binormals[i] = binormals[i - 1].clone();

            // vec.crossVectors(tangents[i - 1], tangents[i]);
            Vector3.cross(tangents[i - 1], tangents[i], vec);

            let len = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
            if (len > Number.EPSILON) {
                // vec.normalize();
                Vector3.normalize(vec, vec);

                let dot = Vector3.dot(tangents[i - 1], tangents[i]);
                theta = Math.acos(MathUtils.clamp(dot, -1, 1)); // clamp for floating pt errors

                Matrix4x4.createRotationAxis(vec, theta, mat);
                Vector3.transformV3ToV3(normals[i], mat, normals[i]);
                // normals[i].applyMatrix4(mat);
            }

            Vector3.cross(tangents[i], normals[i], binormals[i]);
            // binormals[i].crossVectors(tangents[i], normals[i]);
        }

        // if the curve is closed, postprocess the vectors so the first and last normal vectors are the same

        if (closed === true) {
            let dot = Vector3.dot(normals[0], normals[segments]);
            theta = Math.acos(MathUtils.clamp(dot, -1, 1));
            theta /= segments;

            Vector3.cross(normals[0], normals[segments], vec);
            dot = Vector3.dot(tangents[0], vec);
            if (dot > 0) {
                theta = -theta;
            }

            for (i = 1; i <= segments; i++) {
                // twist a little...
                Matrix4x4.createRotationAxis(tangents[i], theta * i, mat);
                Vector3.transformV3ToV3(normals[i], mat, normals[i]);
                // normals[i].applyMatrix4(mat.makeRotationAxis(tangents[i], theta * i));
                Vector3.cross(tangents[i], normals[i], binormals[i]);
                // binormals[i].crossVectors(tangents[i], normals[i]);
            }
        }

        return {
            tangents: tangents,
            normals: normals,
            binormals: binormals
        };
    }

    public clone() {
        return new Curve().copy(this);
    }

    public copy(source) {
        this.arcLengthDivisions = source.arcLengthDivisions;

        return this;
    }

    public toJSON() {
        let data = {
            metadata: {
                version: 4.5,
                type: "Curve",
                generator: "Curve.toJSON"
            },
            arcLengthDivisions: this.arcLengthDivisions,
            type: this.type
        };

        return data;
    }

    public fromJSON(json) {
        this.arcLengthDivisions = json.arcLengthDivisions;

        return this;
    }

    /**
     * 销毁曲线
     * @param clearPath 是否清除路径点，如果清楚则外部引用的路径点也会被清除
     */
    public destroy(clearPath?: boolean) {
        this.cacheArcLengths.length = 0;
        this.type = null;
        this.arcLengthDivisions = null;
        this.needsUpdate = null;
        this.cacheArcLengths = null;
    }
}
