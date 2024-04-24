import { Observable, Subject, interval, lastValueFrom, map, share, startWith, takeUntil, takeWhile, tap } from "rxjs";
import { CastBarComponent, CastBarData } from "../renderer/entities/cast-bar/cast-bar.component";
import { EnemyTokenComponent, EnemyTokenData } from "../renderer/entities/enemy-token/enemy-token.component";
import { Entity, TEntity } from "../renderer/entities/entity";
import { RendererComponent } from "../renderer/renderer.component";
import { BaseShapeCircleConfig, BaseShapeRectConfig, CastBarConfig, Encounter, EntityRef, FadeConfig, MoveEntityConfig, RunControl, RunFunc, Runnable, TransitionConfig } from "./p9s";
import { RectShapeComponent, RectShapeData } from "../renderer/entities/rect-shape/rect-shape.component";
import { CircleConfig, CircleShapeComponent } from "../renderer/entities/circle-shape/circle-shape.component";
import { LimitCutConfig, LimitCutIconComponent } from "../renderer/entities/limit-cut-icon/limit-cut-icon.component";

function completionPromiseOf<T>(o: Observable<T>): Promise<void> {
    return new Promise((resolve, reject) => {
        o.subscribe({
            complete: resolve,
            error: reject
        });
    });
}

export function getEntityByRef(entityRef: EntityRef) {
    return entityRef as Entity;
}

export async function runGameLoop(renderer: RendererComponent, encounter: Encounter, speed = 1) {
    const phases = [] as Runnable[];
    encounter.Setup({
        addPhase: (p) => phases.push(p),
        addEnemy: c => {
            const entity = {
                component: EnemyTokenComponent,
                x: 0,
                y: 0,
                data: c
            } as TEntity<EnemyTokenData>;
            renderer.entities.unshift(entity);
            return entity;
        }
    });
    
    const ticksPerSecond = 120;
    const loopDone = new Subject();
    const gameTicks = interval(1000 / ticksPerSecond).pipe(
        map(_ => void 0),
        takeUntil(loopDone),
        share({resetOnRefCountZero: false})
    );
    
    
    const runControl: RunControl = {
        gameTicks,
        wait: time => new Promise(resolve => setTimeout(resolve, time / speed)),
        getTime: () => new Date().getTime() * speed,
        castBar: castBar,
        createShapeRect: x => createShapeRect(x),
        createShapeCircle: x => createShapeCircle(x),
        placeEntity(e, c) {
            const entity = e as Entity;
            entity.x = c.x;
            entity.y = c.y;
            entity.rotation = c.rotation;
            renderer.entities.push(entity);
        },
        transitionObjectValues: transitionObjectValues,
        fadeIn: fadeIn,
        attachPlaceEntity(e, hostRef, c) {
            const entity = e as Entity;
            entity.x = c.x;
            entity.y = c.y;
            entity.rotation = c.rotation;
            const host = hostRef as Entity;
            if (!host.subEntities)
                host.subEntities = [];
            host.subEntities.push(entity);
        },
        removeEntity(entityRef) {
            const entity = entityRef as Entity;
            function rec(arr: Entity[]) {
                for (let i = 0; i < arr.length; i++) {
                    const x = arr[i];
                    if (x == entity) {
                        arr.splice(i, 1);
                        i--;
                        continue;
                    }
                    if (x.subEntities) {
                        rec(x.subEntities);
                    }
                }
                
            }
            rec(renderer.entities);
        },
        createLimitCutIcon: x => createLimitCutIcon(x),
        getEntitiesByTags(tags: string[]) {
            const found = [] as EntityRef[];
            function rec(arr: Entity[]) {
                for (let i = 0; i < arr.length; i++) {
                    const x = arr[i];
                    if (x.tags && tags.every(t => x.tags?.includes(t))) {
                        found.push(x);
                    }
                    if (x.subEntities) {
                        rec(x.subEntities);
                    }
                }
                
            }
            rec(renderer.entities);
            return found;
        },
        moveEntity: (entity, c) => moveEntity(entity, c)
    };
    
    function moveEntity(entityRef: EntityRef, c: MoveEntityConfig): Promise<void> {
        const startTime = runControl.getTime();
        const entity = getEntityByRef(entityRef);
        
        if (!c.duration || c.duration == 0) {
            entity.x = c.x;
            entity.y = c.y;
            return Promise.resolve();
        }
        
        const startPos = {
            x: entity.x,
            y: entity.y,
            rotation: entity.rotation
        };
        
        const o = gameTicks.pipe(
            map(() => Math.min(1, (runControl.getTime() - startTime) / c.duration!)),
            takeWhile(x => x < 1, true),
            tap(t => {
                entity.x = startPos.x + (c.x - startPos.x) * t;
                entity.y = startPos.y + (c.y - startPos.y) * t;
            })
        );
        
        return completionPromiseOf(o);
    }
    
    function transitionObjectValues<T>(obj: T, c: TransitionConfig<T>): Promise<void> {
        const startTime = runControl.getTime();
        
        const startValues = {} as any;
        for (const [key, value] of Object.entries(c.targetValues)) {
            const e = obj as any;
            (startValues as any)[key] = e[key];
        }
        
        
        const o = gameTicks.pipe(
            map(() => Math.min(1, (runControl.getTime() - startTime) / c.duration!)),
            takeWhile(x => x < 1, true),
            tap(t => {
                for (const [key, targetValue] of Object.entries(c.targetValues)) {
                    const o = obj as any;
                    const startValue = startValues[key];
                    o[key] = startValue + ((targetValue as number) - startValue) * t;
                }
            })
        );
        
        return completionPromiseOf(o);
    }
    
    function createLimitCutIcon(c: LimitCutConfig): EntityRef {
        const entity = {
            component: LimitCutIconComponent,
            x: 0,
            y: 0,
            data: c
        } as TEntity<LimitCutConfig>;
        return entity as EntityRef;
    }
    
    
    function createShapeRect(c: BaseShapeRectConfig): EntityRef {
        const entity = {
            component: RectShapeComponent,
            x: 0,
            y: 0,
            data: c
        } as TEntity<RectShapeData>;
        return entity as EntityRef;
    }
    
    function createShapeCircle(c: BaseShapeCircleConfig): EntityRef {
        const entity = {
            component: CircleShapeComponent,
            x: 0,
            y: 0,
            data: c
        } as TEntity<CircleConfig>;
        return entity as EntityRef;
    }
    
    function fadeIn(entityRef: EntityRef, config: FadeConfig): Promise<void> {
        const entity = entityRef as Entity;
        const startTime = runControl.getTime();
        const obs = gameTicks.pipe(
            map(() => Math.min(1, (runControl.getTime() - startTime) / config.duration)),
            startWith(0),
            takeWhile(x => x < 1, true),
            tap(x => {
                entity.opacity = x;
            }),
            map(x => void 0)
        );
        return completionPromiseOf(obs);
    }
       
    
    async function castBar(c: CastBarConfig): Promise<void> {
        const entity = c.entity as Entity;
        entity.subEntities = entity.subEntities ?? [];
        
        const castBarEntity = {
            component: CastBarComponent,
            x: 0,
            y: -0.2,
            data: {
                label: c.label,
                progress: 0.0
            }
        } as TEntity<CastBarData>;
        
        const startTime = runControl.getTime();
        interval(1000/60).pipe(
            map(x => Math.min(1, (runControl.getTime() - startTime) / c.duration)),
            takeWhile(x => x < 1, true)
        ).subscribe({
            next: x => {
                castBarEntity.data.progress = x;
            }
        });
        
        entity.subEntities.push(castBarEntity);
        await runControl.wait(c.duration);
        entity.subEntities = entity.subEntities?.filter(x => x !== castBarEntity);
    }
    
    
    async function run(runnables: Runnable[]) {
        for (const segment of runnables) {
            console.log('running', segment.name);
            if (Array.isArray(segment.run)) {
                await run(segment.run as Runnable[]);
            } else {
                const rf = segment.run as RunFunc;
                await rf(runControl);
            }
        }
    }
    console.log('encounter start!');
    await run(phases);
    console.log('encounter done!');
    
    loopDone.complete();
}

