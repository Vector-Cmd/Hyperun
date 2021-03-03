import { MathUtils } from "../curve/util/MathUtils";

/**
 * author by JLTery
 */
export default class JLTween {
    public value: number;
    public mCompleteFunc: Function; //完成回调

    private mFrom: number;
    private mOffset: number;
    private mDuration: number; //持续时间
    private mDelay: number; //延迟时间
    private mTime: number;

    private mComplete: boolean;

    private mTweenFunc: Function; //缓动函数

    /**已完成动作 */
    get isComplete() {
        return this.mComplete;
    }
    /**延迟中... */
    get isDelaying() {
        return this.mDelay > 0;
    }

    get from() {
        return this.mFrom;
    }

    constructor(
        from: number,
        to: number,
        duration: number,
        easing: string = EASING.Linear,
        cb?: Function,
        delay?: number
    ) {
        this.reset(from, to, duration, easing, cb, delay);
    }
    public update(dt: number): void {
        if (this.mComplete) return;
        if (this.mDelay > 0) {
            this.mDelay -= dt;
            return;
        }
        this.mTime = MathUtils.clamp(this.mTime + dt, 0, this.mDuration);
        if (this.mTime == this.mDuration) {
            this.mComplete = true;
            if (this.mCompleteFunc) {
                this.mCompleteFunc();
                this.mCompleteFunc = null;
            }
        }
        this.value = this.mFrom + this.mOffset * this.mTweenFunc(this.mTime / this.mDuration);
    }
    /**重置 */
    public reset(
        from: number,
        to: number,
        duration: number,
        easing: string = EASING.Quadratic_In,
        cb?: Function,
        delay?: number
    ): void {
        this.value = from;
        this.mTime = 0;
        this.mFrom = from;
        this.mOffset = to - from;
        this.mDuration = duration;
        this.mDelay = delay || 0;

        this.mComplete = duration == 0 ? true : false;

        this.mTweenFunc = Easing[easing];
        this.mCompleteFunc = cb;
    }
    public getValueByT(t: number) {
        return this.mFrom + this.mOffset * this.mTweenFunc(t);
    }
    public destroy(): void {
        this.mTweenFunc = null;
    }
}

export enum EASING {
    Linear = "Linear",
    Quadratic_In = "Quadratic_In",
    Quadratic_Out = "Quadratic_Out",
    Quadratic_InOut = "Quadratic_InOut",
    Cubic_In = "Cubic_In",
    Cubic_Out = "Cubic_Out",
    Cubic_InOut = "Cubic_InOut",
    Quartic_In = "Quartic_In",
    Quartic_Out = "Quartic_Out",
    Quartic_InOut = "Quartic_InOut",
    Quintic_In = "Quintic_In",
    Quintic_Out = "Quintic_Out",
    Quintic_InOut = "Quintic_InOut",
    Sinusoidal_In = "Sinusoidal_In",
    Sinusoidal_Out = "Sinusoidal_Out",
    Sinusoidal_InOut = "Sinusoidal_InOut",
    Exponential_In = "Exponential_In",
    Exponential_Out = "Exponential_Out",
    Exponential_InOut = "Exponential_InOut",
    Circular_In = "Circular_In",
    Circular_Out = "Circular_Out",
    Circular_InOut = "Circular_InOut",
    Elastic_In = "Elastic_In",
    Elastic_Out = "Elastic_Out",
    Elastic_InOut = "Elastic_InOut",
    Back_In = "Back_In",
    Back_Out = "Back_Out",
    Back_InOut = "Back_InOut"
}
const Easing = {
    Linear: function (k) {
        return k;
    },
    Quadratic_In: function (k) {
        return k * k;
    },
    Quadratic_Out: function (k) {
        return k * (2 - k);
    },
    Quadratic_InOut: function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k;
        }

        return -0.5 * (--k * (k - 2) - 1);
    },
    Cubic_In: function (k) {
        return k * k * k;
    },
    Cubic_Out: function (k) {
        return --k * k * k + 1;
    },
    Cubic_InOut: function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k;
        }

        return 0.5 * ((k -= 2) * k * k + 2);
    },
    Quartic_In: function (k) {
        return k * k * k * k;
    },
    Quartic_Out: function (k) {
        return 1 - --k * k * k * k;
    },
    Quartic_InOut: function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k * k;
        }

        return -0.5 * ((k -= 2) * k * k * k - 2);
    },
    Quintic_In: function (k) {
        return k * k * k * k * k;
    },
    Quintic_Out: function (k) {
        return --k * k * k * k * k + 1;
    },
    Quintic_InOut: function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k * k * k;
        }

        return 0.5 * ((k -= 2) * k * k * k * k + 2);
    },
    Sinusoidal_In: function (k) {
        return 1 - Math.cos((k * Math.PI) / 2);
    },
    Sinusoidal_Out: function (k) {
        return Math.sin((k * Math.PI) / 2);
    },
    Sinusoidal_InOut: function (k) {
        return 0.5 * (1 - Math.cos(Math.PI * k));
    },
    Exponential_In: function (k) {
        return k === 0 ? 0 : Math.pow(1024, k - 1);
    },
    Exponential_Out: function (k) {
        return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
    },
    Exponential_InOut: function (k) {
        if (k === 0) {
            return 0;
        }

        if (k === 1) {
            return 1;
        }

        if ((k *= 2) < 1) {
            return 0.5 * Math.pow(1024, k - 1);
        }

        return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
    },
    Circular_In: function (k) {
        return 1 - Math.sqrt(1 - k * k);
    },
    Circular_Out: function (k) {
        return Math.sqrt(1 - --k * k);
    },
    Circular_InOut: function (k) {
        if ((k *= 2) < 1) {
            return -0.5 * (Math.sqrt(1 - k * k) - 1);
        }

        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    },
    Elastic_In: function (k) {
        if (k === 0) {
            return 0;
        }

        if (k === 1) {
            return 1;
        }

        return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
    },
    Elastic_Out: function (k) {
        if (k === 0) {
            return 0;
        }

        if (k === 1) {
            return 1;
        }

        return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;
    },
    Elastic_InOut: function (k) {
        if (k === 0) {
            return 0;
        }

        if (k === 1) {
            return 1;
        }

        k *= 2;

        if (k < 1) {
            return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
        }

        return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;
    },
    Back_In: function (k) {
        var s = 1.70158;

        return k * k * ((s + 1) * k - s);
    },
    Back_Out: function (k) {
        var s = 1.70158;

        return --k * k * ((s + 1) * k + s) + 1;
    },
    Back_InOut: function (k) {
        var s = 1.70158 * 1.525;

        if ((k *= 2) < 1) {
            return 0.5 * (k * k * ((s + 1) * k - s));
        }

        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    }
};
