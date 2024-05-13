import { Observable, combineLatest, filter, first, map, skip, take, toArray } from "rxjs";
import { EntityRef } from "../interface/Encounter";
import { Vector, vectorAdd, vectorMult, vectorSubs } from "../../lib/vector";

export interface NpcAi {
    setup(c: AiControl): void;
}

export enum CastBarEventType {
    Start,
    End
}

export enum EntityEventType {
    Placed,
    Removed
}

export interface CastBarEvent {
    caster: EntityRef;
    castLabel: string;
    eventType: CastBarEventType;
}

export interface EntityEvent {
    entity: EntityRef;
    eventType: EntityEventType;
}

export interface MoveConfig {
    x: number,
    y: number,
    duration?: number
}

export interface AiControl {
    wait(duration: number): Promise<void>;
    moveNpc(entityRef: EntityRef, c: MoveConfig): Promise<void>;
    getPlayers(): EntityRef[];
    getNpcs(): EntityRef[];
    get castBarEvents(): Observable<CastBarEvent>;
    get entityEvents(): Observable<EntityEvent>;
    get gameTicks(): Observable<void>;
    
    hasControl(entity: EntityRef): boolean;
}


export class P9sHectorJpAi implements NpcAi {
    
    setup(c: AiControl) {
        
        const clockRoleOrder = ["MT", "R2", "H2", "M2", "OT", "M1", "H1", "R1"];
        function getClockOrderedPlayers() {
            const posDict = {} as {[i: string]: number};
            for (const [key, value] of clockRoleOrder.entries()) {
                posDict[value] = key;
            }
            const orderedPlayers = [] as EntityRef[];
            const players = c.getPlayers();
            for (const player of players) {
                orderedPlayers[posDict[player.name!]] = player;
            }
            return orderedPlayers;
        }
        const clockOrderedPlayers = getClockOrderedPlayers();
        
        let boss: EntityRef;
        
        let standyByLocation1: Vector;
        let standyByLocation2: Vector;
        let lcBalls = [] as EntityRef[];
        let lcPlayers = [] as EntityRef[];
        let defamationPlayers = [] as EntityRef[];
        
        const newLimitCuts = c.entityEvents.pipe(
            filter(x => x.eventType == EntityEventType.Placed && (x.entity.name?.startsWith("lc") ?? false)),
            map(x => {
                const [_, strNum] = x.entity.name!.split(" ");
                const n = +strNum;
                return {enitity: x.entity, n};
            })
        );
        
        newLimitCuts
        .pipe(
            filter(x => x.n % 2 == 0),
            take(4),
            toArray()
        )
        .subscribe({
            next: arr => {
                arr.sort((a, b) => a.n - b.n);
                lcPlayers = arr.map(x => x.enitity.attachedTo!);
            }
        });
        
        newLimitCuts
        .pipe(
            filter(x => x.n % 2 == 1),
            take(4),
            toArray()
        )
        .subscribe({
            next: arr => {
                arr.sort((a, b) => a.n - b.n);
                lcBalls = arr.map(x => x.enitity.attachedTo!);
            }
        });
        
        
        
        
        const newDefamationTargets = c.entityEvents.pipe(
            filter(x => x.eventType == EntityEventType.Placed && x.entity.name == "defamation"),
            map(x => x.entity.attachedTo!)
        );
        
        newDefamationTargets.pipe(take(4)).subscribe({
            next: x => {
                defamationPlayers.push(x);
            }
        });
        
        
            
        combineLatest([newLimitCuts.pipe(filter(x => x.n == 1)), newLimitCuts.pipe(filter(x => x.n == 3))])
        .pipe(take(1))
        .subscribe({
            next: async x => {
                const lc1 = x[0].enitity.attachedTo!;
                const lc3 = x[1].enitity.attachedTo!;
                const between = vectorAdd(lc1, vectorMult(vectorSubs(lc3, lc1), 0.5));
                console.log(between);
                standyByLocation1 = vectorMult(between, -0.8);
                standyByLocation2 = vectorMult(standyByLocation1, -1);
                
                await c.wait(500);
                resolveScrambledSuccessionIteration(0);
            }
        });
        
        const towerExplosions = c.entityEvents.pipe(
            filter(x => x.eventType == EntityEventType.Removed && x.entity.name == "tower"),
            map(x => x.entity)
        );
        
        const towerSpawn = c.entityEvents.pipe(
            filter(x => x.eventType == EntityEventType.Placed && x.entity.name == "tower"),
            map(x => x.entity)
        );
        
        towerExplosions
        .pipe(
            take(3),
            map((_, i) => i)
        )
        .subscribe({
            next: async x => {
                await c.wait(500);
                resolveScrambledSuccessionIteration(x + 1);
            }
        });
            
        
        async function resolveScrambledSuccessionIteration(i : number) {
            const standByLocation = i < 2 ? standyByLocation1 : standyByLocation2;
            
            const baitPlayer = lcPlayers[i];
            const towerPlayer = lcPlayers[(i+2) % 4];
            
            
            c.moveNpc(baitPlayer, vectorMult(standByLocation, 2.2));
            c.moveNpc(towerPlayer, vectorMult(lcBalls[i], -0.8));
            
            const keyPlayers = [baitPlayer, towerPlayer];
            
            if (i > 0) {
                const defPlayer = defamationPlayers[i];
                c.moveNpc(defPlayer, vectorMult(standByLocation, -2.2));
                keyPlayers.push(defPlayer);
            } else {
                newDefamationTargets.pipe(take(1)).subscribe({
                    next: defPlayer => {
                        c.moveNpc(defPlayer, vectorMult(standByLocation, -2.2));
                    }
                });
            }
            
            const others = c.getPlayers().filter(x => !keyPlayers.includes(x));
            const offsetDirs = clockPositions(others.length);
            for (const [i, player] of others.entries()) {
                const pos = vectorAdd(standByLocation, vectorMult(offsetDirs[i], 0.04));
                c.moveNpc(player, pos);
            }
            
            towerSpawn.pipe(take(1)).subscribe({
                next: async x => {
                    await c.wait(200);
                    c.moveNpc(towerPlayer, x);
                }
            });
            
            
        }
        
        
        c.castBarEvents
        .pipe(
            filter(x => x.castLabel == "Ravening" && x.eventType == CastBarEventType.Start)
        )
        .subscribe({
            next: _ => {
                moveClockToClockPosition();
            }
        });
        
        towerExplosions.pipe(
            take(4),
            skip(3)
        )
        .subscribe({
            next: async () => {
                await c.wait(1000);
                moveClockToClockPosition();
            }
        });
        
        async function moveClockToClockPosition() {
            const dist = 0.2;
            const n = clockOrderedPlayers.length;
            
            
            for (const [i, player] of clockOrderedPlayers.entries()) {
                if (!c.hasControl(player))
                    continue;
                
                const angle = Math.PI * 2 * (i / n);
                
                c.moveNpc(player, {
                    x: Math.sin(angle) * dist,
                    y: -Math.cos(angle) * dist
                });
            }
        }
    }
    
}

function clockPositions(n : number) {
    const arr = [];
    for (let i = 0; i < n; i++) {
        const angle = Math.PI * 2 * (i / n);
        const pos = {
            x: Math.sin(angle) * 1,
            y: -Math.cos(angle) * 1
        } as Vector;
        arr.push(pos);
    }
    return arr;
}