
export interface Vector {
    x: number;
    y: number;
}

export function vectorAdd(a: Vector, b: Vector) {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    } as Vector;
}

export function vectorLen2(v: Vector) {
    return v.x * v.x + v.y * v.y;
}

export function vectorLen(v: Vector) {
    return Math.sqrt(vectorLen2(v));
}

export function vectorSubs(a: Vector, b: Vector) {
    return {
        x: a.x - b.x,
        y: a.y - b.y
    } as Vector;
}

export function vectorMult(v: Vector, factor: number) {
    return {
        x: v.x * factor,
        y: v.y * factor
    } as Vector;
}
