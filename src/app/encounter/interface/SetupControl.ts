import { EnemyConfig, EntityRef, Runnable } from "./Encounter";


export interface SetupControl {
    addEnemy(c: EnemyConfig): EntityRef;
    addPhase(p: Runnable): void;
}
