import { SetupControl } from "./SetupControl";
import { RunControl } from "./RunControl";


export interface EntityRef {
    attachedTo?: EntityRef;
    x: number;
    y: number;
    rotation?: number;
    opacity?: number;
    name?: string;
}

export type RunFunc = (rc: RunControl) => Promise<void>;

export interface Runnable {
    name: string;
    run: Runnable[] | RunFunc;
}

export interface Encounter {
    setup(c: SetupControl): void;
}

export interface EnemyConfig {
    name: string;
    stroke: string;
    fill: string;
    size: number;
}
