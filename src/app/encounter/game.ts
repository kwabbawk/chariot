import { Observable, Subject, interval, lastValueFrom, map, of, share, startWith, switchMap, take, takeUntil, takeWhile, tap, timer } from "rxjs";
import { CastBarComponent, CastBarData } from "../renderer/entities/cast-bar/cast-bar.component";
import { EnemyTokenComponent, EnemyTokenData } from "../renderer/entities/enemy-token/enemy-token.component";
import { Entity, TEntity } from "../renderer/entities/entity";
import { RendererComponent } from "../renderer/renderer.component";
import { Encounter, EntityRef, RunFunc, Runnable } from "./interface/Encounter";
import { RunControl } from "./interface/RunControl";
import { EntityPlacementConfig } from "./interface/EntityPlacementConfig";
import { TransitionConfig } from "./interface/TransitionConfig";
import { MoveEntityConfig } from "./interface/MoveEntityConfig";
import { FadeConfig } from "./interface/FadeConfig";
import { BaseShapeCircleConfig } from "./interface/BaseShapeCircleConfig";
import { BaseShapeRectConfig } from "./interface/BaseShapeRectConfig";
import { CastBarConfig } from "./interface/CastBarConfig";
import { SetupControl } from "./interface/SetupControl";
import { RectShapeComponent, RectShapeData } from "../renderer/entities/rect-shape/rect-shape.component";
import { CircleConfig, CircleShapeComponent } from "../renderer/entities/circle-shape/circle-shape.component";
import { LimitCutConfig, LimitCutIconComponent } from "../renderer/entities/limit-cut-icon/limit-cut-icon.component";
import { AiControl, CastBarEvent, CastBarEventType, EntityEvent, EntityEventType, MoveConfig, NpcAi } from "./encounters/p9s.ai";
import { vectorLen } from "../lib/vector";
import { PlayerTokenData } from "../renderer/entities/player-token/player-token.component";

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

export enum EntityLayers {
    Background,
    Enemy,
    Effect,
    Player,
}

export function insertLayered(arr: Entity[], element: Entity) {
    const i = arr.findIndex(x => element.layer < x.layer);
    
    if (i < 0) {
        arr.push(element);
    } else {
        arr.splice(i, 0, element);
    }
}

export interface PlaybackControl {
    stop(): void;
    resume(): void;
    pause(): void;
    get isRunning(): boolean;
    setPlaybackspeed(speed: number): void;
}

export interface RunningEncounterContext {
    
    passedEncounterTime: number;
    currentTimeSegmentStartedAt: number;
    isCurrentTimeSegmentRunning: boolean;
    playbackResume$: any;
    playbackPause$: any;
    playbackStop$: Subject<void>;
    speed: number;
    phases: Runnable[];
    renderer: RendererComponent;
    encounterEnd: Subject<void>;
    gameTicks: Observable<void>;
    castBarEvents$: Subject<CastBarEvent>;
    entityEvents$: Subject<EntityEvent>;
}

class GameSetupControl implements SetupControl {
    
    constructor(private ctx: RunningEncounterContext) {
    }
    
    addPhase(p: Runnable) {
        this.ctx.phases.push(p)
    }
    
    addEnemy(c: EnemyTokenData) {
        const entity = {
            component: EnemyTokenComponent,
            x: 0,
            y: 0,
            data: c,
            tags: [],
            layer: EntityLayers.Enemy
        } as TEntity<EnemyTokenData>;
        insertLayered(this.ctx.renderer.entities, entity);
        // renderer.entities.unshift(entity);
        return entity;
    }
}

class GameRunControl implements RunControl {
    
    constructor(private ctx: RunningEncounterContext) {
    }
    
    get gameTicks() {
        return this.ctx.gameTicks;
    } 
    
    public wait(time: number, keyword?: string): Promise<void> {
        
        
        
        
        
        
        
        return new Promise((resolve, reject) => {
            const resolveAfterWait = (waitTime: number) => {
                const startTime = this.getTime();
                const finished = new Subject<void>();
                const done = () => {
                    finished.next();
                    resolve();
                };
                const stop = () => {
                    finished.next();
                    reject();
                }
                
                const timeoutHandle = setTimeout(done, waitTime / this.ctx.speed);
                
                this.ctx.playbackPause$.pipe(takeUntil(finished), take(1)).subscribe({
                    next: () => {
                        clearTimeout(timeoutHandle);
                        const pauseTime = this.getTime();
                        const remainingTime = waitTime - (pauseTime - startTime);
                        this.ctx.playbackResume$.pipe(takeUntil(finished), take(1)).subscribe({
                            next: () => {
                                resolveAfterWait(remainingTime);
                            }
                        });
                    }
                });
                
            };
            
            resolveAfterWait(time);
        });
    }
    
    public getTime() {
        const currentPassedEncounterTime = this.ctx.isCurrentTimeSegmentRunning 
            ? (new Date().getTime() - this.ctx.currentTimeSegmentStartedAt) * this.ctx.speed 
            : 0;
        return this.ctx.passedEncounterTime + currentPassedEncounterTime;
    }
    
    public async castBar(c: CastBarConfig): Promise<void> {
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
        
        const startTime = this.getTime();
        interval(1000/60).pipe(
            map(x => Math.min(1, (this.getTime() - startTime) / c.duration)),
            takeWhile(x => x < 1, true)
        ).subscribe({
            next: x => {
                castBarEntity.data.progress = x;
            }
        });
        
        entity.subEntities.push(castBarEntity);
        
        this.ctx.castBarEvents$.next({
            caster: entity,
            castLabel: c.label,
            eventType: CastBarEventType.Start
        });
        
        await this.wait(c.duration);
        entity.subEntities = entity.subEntities?.filter(x => x !== castBarEntity);
        
        this.ctx.castBarEvents$.next({
            caster: entity,
            castLabel: c.label,
            eventType: CastBarEventType.End
        });
    }
    
    public moveEntity(entityRef: EntityRef, c: MoveEntityConfig): Promise<void> {
        const startTime = this.getTime();
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
        
        const o = this.gameTicks.pipe(
            map(() => Math.min(1, (this.getTime() - startTime) / c.duration!)),
            takeWhile(x => x < 1, true),
            tap(t => {
                entity.x = startPos.x + (c.x - startPos.x) * t;
                entity.y = startPos.y + (c.y - startPos.y) * t;
            })
        );
        
        return completionPromiseOf(o);
    }
    
    public transitionObjectValues<T>(obj: T, c: TransitionConfig<T>): Promise<void> {
        const startTime = this.getTime();
        
        const startValues = {} as any;
        for (const [key, value] of Object.entries(c.targetValues)) {
            const e = obj as any;
            (startValues as any)[key] = e[key];
        }
        
        
        const o = this.gameTicks.pipe(
            map(() => Math.min(1, (this.getTime() - startTime) / c.duration!)),
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
    
    public createLimitCutIcon(c: LimitCutConfig): EntityRef {
        const entity = {
            component: LimitCutIconComponent,
            x: 0,
            y: 0,
            data: c,
            name: "lc " + c.number,
            tags: [],
            layer: EntityLayers.Effect
        } as TEntity<LimitCutConfig>;
        return entity as EntityRef;
    }
    
    public createShapeRect(c: BaseShapeRectConfig): EntityRef {
        const entity = {
            component: RectShapeComponent,
            x: 0,
            y: 0,
            data: c,
            tags: [],
            layer: EntityLayers.Effect
        } as TEntity<RectShapeData>;
        return entity as EntityRef;
    }
    
    public createShapeCircle(c: BaseShapeCircleConfig): EntityRef {
        const entity = {
            component: CircleShapeComponent,
            x: 0,
            y: 0,
            data: c,
            tags: [],
            layer: EntityLayers.Effect
        } as TEntity<CircleConfig>;
        return entity as EntityRef;
    }
    
    public fadeIn(entityRef: EntityRef, config: FadeConfig): Promise<void> {
        const entity = entityRef as Entity;
        const startTime = this.getTime();
        const obs = this.gameTicks.pipe(
            map(() => Math.min(1, (this.getTime() - startTime) / config.duration)),
            startWith(0),
            takeWhile(x => x < 1, true),
            tap(x => {
                entity.opacity = x;
            }),
            map(x => void 0)
        );
        return completionPromiseOf(obs);
    }
    
    public placeEntity(e: EntityRef, c: EntityPlacementConfig) {
        const entity = e as Entity;
        entity.x = c.x;
        entity.y = c.y;
        entity.rotation = c.rotation;
        // renderer.entities.unshift(entity);
        insertLayered(this.ctx.renderer.entities, entity);
        this.ctx.entityEvents$.next({
            entity: entity,
            eventType: EntityEventType.Placed
        });
    }
    
    public attachPlaceEntity(e: EntityRef, hostRef: EntityRef, c: EntityPlacementConfig) {
        const entity = e as Entity;
        entity.x = c.x;
        entity.y = c.y;
        entity.rotation = c.rotation;
        const host = hostRef as Entity;
        if (!host.subEntities)
            host.subEntities = [];
        // host.subEntities.unshift(entity);
        insertLayered(host.subEntities, entity);
        entity.attachedTo = host;
        this.ctx.entityEvents$.next({
            entity: entity,
            eventType: EntityEventType.Placed
        });
    }
    
    public removeEntity(entityRef: EntityRef) {
        const entity = entityRef as Entity;
        const removeRecursive = (arr: Entity[]) => {
            for (let i = 0; i < arr.length; i++) {
                const x = arr[i];
                if (x == entity) {
                    arr.splice(i, 1);
                    i--;
                    this.ctx.entityEvents$.next({
                        entity: x,
                        eventType: EntityEventType.Removed
                    });
                    continue;
                }
                if (x.subEntities) {
                    removeRecursive(x.subEntities);
                }
            }
            
        }
        removeRecursive(this.ctx.renderer.entities);
    }
    
    public getEntitiesByTags(tags: string[]) {
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
        rec(this.ctx.renderer.entities);
        return found;
    }
}

class GameAiControl implements AiControl {
    constructor(private ctx: RunningEncounterContext, private runControl: RunControl) {
    }
    
    wait(duration: number) {
        return this.runControl.wait(duration);
    }
    
    public get castBarEvents(): Observable<CastBarEvent> {
        return this.ctx.castBarEvents$.pipe(takeUntil(this.ctx.encounterEnd));
    }
    
    public get entityEvents() {
        return this.ctx.entityEvents$.pipe(takeUntil(this.ctx.encounterEnd));
    }
    
    public get gameTicks() {
        return this.ctx.gameTicks;
    }
    
    public getPlayers() {
        return this.runControl.getEntitiesByTags(["player"]);
    }
    
    public getNpcs() {
        return this.runControl.getEntitiesByTags(["player", "npc"]);
    }
    
    public hasControl(entity: EntityRef) {
        return getEntityByRef(entity).tags.includes("npc");
    }
    
    async moveNpc(entityRef: EntityRef, c: MoveConfig) {
        // console.log("moving", entityRef, c);
        if (!this.hasControl(entityRef)) {
            console.log('ai tried to move non-npc', entityRef);
            return;
        }
        
        const distance = vectorLen({
            x: c.x - entityRef.x,
            y: c.y - entityRef.y
        });
        const maxSpeed = 0.75;
        let duration = 1000 * distance / maxSpeed;
        if (c.duration && c.duration < duration) {
            duration = c.duration;
        }
        
        
        await this.runControl.transitionObjectValues(entityRef, {
            duration,
            targetValues: {
                x: c.x,
                y: c.y
            }
        });
    }
}

class GamePlaybackControl implements PlaybackControl {
    
    constructor(private ctx: RunningEncounterContext, private runControl: RunControl) {
    }
    
    resume() {
        if (this.ctx.isCurrentTimeSegmentRunning)
            return;
        this.ctx.isCurrentTimeSegmentRunning = true;
        this.ctx.currentTimeSegmentStartedAt = new Date().getTime();
        this.ctx.playbackResume$.next();
    }
    
    pause() {
        if (!this.ctx.isCurrentTimeSegmentRunning)
            return;
        this.ctx.passedEncounterTime = this.runControl.getTime();
        this.ctx.isCurrentTimeSegmentRunning = false;
        this.ctx.playbackPause$.next();
    }
    
    stop() {
        this.ctx.playbackStop$.next();
    }
    
    get isRunning() {
        return this.ctx.isCurrentTimeSegmentRunning;
    }
    
    setPlaybackspeed(newSpeed: number) {
        if (this.ctx.isCurrentTimeSegmentRunning)
            throw new Error('can\'t change playback speed while running!');
        this.ctx.speed = newSpeed;
    }
    
}


export function setupEncouter(renderer: RendererComponent, encounter: Encounter, ai: NpcAi, speed = 1) {
    
    
    
    const makeCtx = () => {
        
        const encounterEnd = new Subject();
    
        const ticksPerSecond = 120;
        const gameTicks = interval(1000 / ticksPerSecond).pipe(
            map(_ => void 0),
            takeUntil(encounterEnd),
            share({resetOnRefCountZero: false})
        );
        
        let currentTimeSegmentStartedAt = new Date().getTime();
        let passedEncounterTime = 0;
        let isCurrentTimeSegmentRunning = true;
        
        const playbackResume$ = new Subject<void>();
        const playbackStop$ = new Subject<void>();
        const playbackPause$ = new Subject<void>();
        
        const castBarEvents$ = new Subject<CastBarEvent>();
        const entityEvents$ = new Subject<EntityEvent>();
        
        const ctx = {
            phases: [],
            renderer,
            encounterEnd,
            gameTicks,
            currentTimeSegmentStartedAt,
            passedEncounterTime,
            isCurrentTimeSegmentRunning,
            playbackPause$,
            playbackResume$,
            speed,
            castBarEvents$,
            entityEvents$,
            playbackStop$
        } as RunningEncounterContext;
        return ctx;
    };
    
    const ctx = makeCtx();
    
    
    encounter.setup(new GameSetupControl(ctx));
    
    const runControl: RunControl = new GameRunControl(ctx);
    
    const aiControl: AiControl = new GameAiControl(ctx, runControl);
    
    const playbackControl = new GamePlaybackControl(ctx, runControl);
    
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
    
    function setupPlayerControl() {
        console.log("control setup");
        const players = runControl.getEntitiesByTags(["player"]);
        for (const [i, player] of players.entries()) {
            if (player.name != "MT") {
                getEntityByRef(player).tags.push("npc");
                console.log("npc", player);
            } else {
                console.log("player controlled", player);
                const token = player as TEntity<PlayerTokenData>;
                token.data.draggable = true;
            }
        }
    }
    
    setupPlayerControl();
    
    ai.setup(aiControl);
    
    
    
    const runningEncounter = (async () => {
        console.log('encounter start!');
        await run(ctx.phases);
        ctx.encounterEnd.complete();
        console.log('encounter done!');
    })();
    
    return {
        runningEncounter,
        playbackControl
    };
    
    
    
    
    
}

