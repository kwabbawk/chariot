import { Observable } from "rxjs";
import { LimitCutConfig } from "../renderer/entities/limit-cut-icon/limit-cut-icon.component";
import { getEntityByRef } from "./game";
import { TEntity } from "../renderer/entities/entity";
import { CircleConfig } from "../renderer/entities/circle-shape/circle-shape.component";
import { RectShapeData } from "../renderer/entities/rect-shape/rect-shape.component";
import { vectorSubs, vectorLen, vectorAdd, vectorMult } from "./vector";

export interface CastBarConfig {
    entity: EntityRef;
    label: string;
    duration: number;
}

export interface EntityConfig<TData> {
    x: number;
    y: number;
    rotation?: number;
    data: TData;
}

export interface BaseShapeRectConfig {
    x: number; 
    y: number; 
    width: number; 
    height: number; 
    fill: string;
    stroke?: string
}

export interface BaseShapeCircleConfig {
    radius: number; 
    fill: string;
    stroke: string;
}

export interface FadeConfig {
    duration: number
}

export interface MoveEntityConfig {
    x: number; 
    y: number; 
    rotation?: number; 
    duration?: number; 
}

export interface TransitionConfig<T> {
    duration: number;
    targetValues: Partial<T>;
}

export interface RunControl {
    moveEntity(entityRef: EntityRef, c: MoveEntityConfig): Promise<void>;
    getEntitiesByTags(tags: string[]): EntityRef[];
    fadeIn(entity: EntityRef, config: FadeConfig): Promise<void>;
    
    transitionObjectValues<T>(entity: T, config: TransitionConfig<T>): Promise<void>;
    
    getTime(): number;
    castBar(c: CastBarConfig): Promise<void>;
    wait(time: number): Promise<void>;
    
    gameTicks: Observable<void>;
    
    createShapeRect(c: BaseShapeRectConfig): EntityRef;
    createShapeCircle(c: BaseShapeCircleConfig): EntityRef;
    createLimitCutIcon(c: LimitCutConfig): EntityRef;
    placeEntity(entity: EntityRef, c: {x: number, y: number, rotation?: number}): void;
    attachPlaceEntity(entity: EntityRef, host: EntityRef, c: {x: number, y: number, rotation?: number}): void;
    removeEntity(entity: EntityRef): void;
}

export interface EntityRef {
    attachedTo?: EntityRef;
    x: number;
    y: number;
    rotation?: number;
    opacity?: number;
    name?: string;
}

export interface SetupControl {
    addEnemy(c: EnemyConfig): EntityRef;
    addPhase(p: Runnable): void;
}

export type RunFunc = (rc: RunControl) => Promise<void>;

export interface Runnable {
    name: string;
    run: Runnable[] | RunFunc
}

export interface Encounter {
    Setup(c: SetupControl): void;
}

export function GetEncounter() {
    return new p9s() as Encounter;
}

export interface EnemyConfig {
     name: string;
     stroke: string;
     fill: string;
     size: number;
}

function shuffle<T>(array: T[]) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
};

export class p9s implements Encounter {
    
    Setup(c: SetupControl): void {
        
        const boss = c.addEnemy({
            name: "Boss",
            stroke: "grey",
            fill: "lightgrey",
            size: 0.15
        } as EnemyConfig);
        
        
        const chimera1: Runnable = {
            name: 'Chimera 1',
            run: rc => this.chimera1(boss, rc)
        };
        
        c.addPhase(chimera1);
    }
    
    
    private async chimera1(boss: EntityRef, rc: RunControl) {
        
        const cheat = true;
        
                
        await rc.wait(1000);
        await rc.castBar({
            entity: boss, 
            label: 'Ravening', 
            duration: 2500
        });
        
        const iceBlockConfig = {
            x: -.1, 
            y: -.025, 
            width: 0.2, 
            height: 0.05, 
            fill: "deepskyblue"
        };
        
        const iceBlocks = [] as EntityRef[];
        
        const circleOffset = Math.random() < 0.5 ? 0.0 : 0.5;
        const clockDirFactor = Math.random() < 0.5 ? 1 : -1;
        
        
        for (let i = 0; i < 4; i++) {
            const iceBlock = rc.createShapeRect(iceBlockConfig);
            const rad = Math.PI * 2 * (((i * clockDirFactor)+circleOffset) / 4);
            const dist = 0.46;
            rc.placeEntity(iceBlock, {
                x: Math.sin(rad) * dist,
                y: -Math.cos(rad) * dist,
                rotation: rad / Math.PI * 180
            });
            rc.fadeIn(iceBlock, {duration: 500});
            iceBlocks.push(iceBlock);
        }
        
        await rc.wait(1000);
        await rc.castBar({
            entity: boss, 
            label: 'Levinstrike Summoning', 
            duration: 2500
        });
        
        const scrambledSuccessionCast = (async() => {
            await rc.wait(1000);
            await rc.castBar({
                entity: boss, 
                label: 'Scrambled Succession', 
                duration: 2500
            })
        })();
        
        const levinStrikeFinished = (async () => {
            await scrambledSuccessionCast;
            await rc.wait((3500) * 4);
            await rc.wait(1000);
        })();
        
        const ballCircleConfig = {
            radius: 0.02,
            fill: "mediumpurple",
            stroke: "purple",
        };
        
        const lightningBalls = [] as EntityRef[];
        
        for (let i = 0; i < 4; i++) {
            const ball = rc.createShapeCircle(ballCircleConfig);
            const rad = Math.PI * 2 * (((i*clockDirFactor)+circleOffset) / 4);
            const dist = 0.36;
            rc.placeEntity(ball, {
                x: Math.sin(rad) * dist,
                y: -Math.cos(rad) * dist
            });
            rc.fadeIn(ball, {duration: 500});
            lightningBalls.push(ball);
            
            (async () => {
                await rc.wait(500);
                //await rc.wait(i * 200);
                
                const lc = rc.createLimitCutIcon({
                    number: i * 2 + 1
                });
                rc.attachPlaceEntity(lc, ball, {
                    x: 0,
                    y: -0.07
                });
                rc.fadeIn(lc, {duration: 200});
                
                await scrambledSuccessionCast;
                if (!cheat) {
                    rc.removeEntity(lc); 
                } else {
                    lc.opacity = 0.2;
                    await levinStrikeFinished;
                    rc.removeEntity(lc);
                }
            })();
            
        }
        
        const players: EntityRef[] = rc.getEntitiesByTags(['player']);
        shuffle(players);
        console.log(players);
        const lcPlayers = players.slice(0,4);
        const defPlayers = players.slice(4);
        console.log(lcPlayers, defPlayers);
        
        for (const [i, player] of lcPlayers.entries()) {
            (async () => {
                await rc.wait(500);
                
                const lc = rc.createLimitCutIcon({
                    number: i * 2 + 2
                });
                rc.attachPlaceEntity(lc, player, {
                    x: 0,
                    y: -0.07
                });
                rc.fadeIn(lc, {duration: 200});
                
                await scrambledSuccessionCast;
                if (!cheat) {
                    rc.removeEntity(lc); 
                } else {
                    lc.opacity = 0.2;
                    await levinStrikeFinished;
                    rc.removeEntity(lc);
                }
            })();
        }
        
        const defamationMarks = [] as EntityRef[];
        
        function addDefamationMark(player: EntityRef) {
            const mark = rc.createShapeCircle({
                fill: "blue",
                radius: 0.02,
                stroke: "none"
            });
            mark.name = "defamation";
            mark.opacity = 0.8;
            rc.attachPlaceEntity(mark, player, {
                x: 0,
                y: -0.07
            });
            defamationMarks.push(mark);
        }
        
        (async () => {
            await rc.wait(3000);
            addDefamationMark(defPlayers[0]);
        })();
        
        await scrambledSuccessionCast;
        
        await rc.wait(1000);
        
        for (let i = 0; i < 4; i++) {
            const timeline = {
                showNextDefamation: rc.wait(750),
                kickoff: rc.wait(1000),
                ballCollision: rc.wait(1500),
                jumpToPlayer: rc.wait(2400),
                syncedExplosions: rc.wait(2750),
                done: rc.wait(3500),
            };
            async function jumpPlayer(player: EntityRef) {
                await timeline.jumpToPlayer
                const target = {
                    x: player.x,
                    y: player.y
                };
                rc.moveEntity(boss, {
                    x: target.x,
                    y: target.y,
                    duration: 250
                });
                await timeline.syncedExplosions;
                
                // await rc.wait(500);
                const playerJumpExplosion = rc.createShapeCircle({
                    radius: 0.15,
                    fill: "orange",
                    stroke: "darkorange"
                });
                playerJumpExplosion.opacity = 0.5;
                rc.placeEntity(playerJumpExplosion, {
                    x: target.x,
                    y: target.y 
                });
                await rc.wait(500);
                rc.removeEntity(playerJumpExplosion);
            }
            
            async function kickBall(ball: EntityRef, targetWall: EntityRef) {
                // const ball = lightningBalls[0];
                
                // boss positioning and teleport animation
                (async () => {
                    boss.opacity = 1;
                    await rc.transitionObjectValues(boss, {
                        duration: 200,
                        targetValues: {
                            opacity: 0
                        }
                    });
                    boss.x = ball.x * 1.2;
                    boss.y = ball.y * 1.2;
                    await rc.transitionObjectValues(boss, {
                        duration: 200,
                        targetValues: {
                            opacity: 1
                        }
                    });
                })();
                
                await timeline.kickoff;
                
                // kickoff
                const path = vectorSubs(targetWall, ball);
                const len = vectorLen(path);
                const newLen = len - ballCircleConfig.radius - iceBlockConfig.height * 0.5;
                const targetPos = vectorAdd(ball, vectorMult(path, newLen / len));
                rc.moveEntity(ball, {
                    x: targetPos.x,
                    y: targetPos.y,
                    duration: 500
                });
                
                await timeline.ballCollision;
                
                const ballExplosion = rc.createShapeCircle({
                    radius: 0.1,
                    fill: "mediumpurple",
                    stroke: "purple"
                });
                ballExplosion.opacity = 0.5;
                rc.placeEntity(ballExplosion, {
                    x: ball.x,
                    y: ball.y 
                });
                rc.removeEntity(ball);
                await rc.wait(500);
                rc.removeEntity(ballExplosion);
                const tower = spawnTower();
                tower.name = "tower";
                rc.placeEntity(tower, {
                    x: ball.x,
                    y: ball.y
                });
                await timeline.syncedExplosions;
                const towerExplosion = rc.createShapeCircle({
                    radius: 2,
                    fill: "orange",
                    stroke: "orange"
                });
                towerExplosion.opacity = 0.5;
                rc.placeEntity(towerExplosion, {
                    x: tower.x,
                    y: tower.y 
                });
                rc.removeEntity(tower);
                await rc.wait(500);
                rc.removeEntity(towerExplosion);
            }
            
            async function defamation(player: EntityRef) {
                await timeline.syncedExplosions;
                const defamationExplosion = rc.createShapeCircle({
                    radius: 0.45,
                    fill: "blue",
                    stroke: "darkblue"
                });
                defamationExplosion.opacity = 0.5;
                rc.placeEntity(defamationExplosion, {
                    x: player.x,
                    y: player.y 
                });
                rc.removeEntity(defamationMarks[i]);
                await rc.wait(500);
                rc.removeEntity(defamationExplosion);
            }
            
            async function nextDefamationMark(player: EntityRef) {
                await timeline.showNextDefamation;
                addDefamationMark(player);
            }
            
            kickBall(lightningBalls[i], iceBlocks[(i+2) % 4]);
            jumpPlayer(lcPlayers[i]);
            if (i < 3) {
                nextDefamationMark(defPlayers[i+1]);
            }
            defamation(defPlayers[i]);
            
            await timeline.done;
        }
        
        await rc.wait(1000);
        await rc.moveEntity(boss, {x: 0, y: 0, duration: 1000});
        
        
        
        
        function spawnTower() {
            const height = 0.06;
            const width = 0.02;
            const fill = "moccasin";
            const stroke = "orange";
            const radius = 0.04;
            const base = rc.createShapeCircle({
                fill: fill,
                stroke: stroke,
                radius: radius
            });
            const pillar = rc.createShapeRect({
                width: width,
                height: height,
                fill: fill,
                stroke: stroke,
                x: - width / 2,
                y: - height
            });
            const pillarEdgeCut = rc.createShapeRect({
                width: width+0.01,
                height: 0.01,
                fill: fill,
                x: - (width+0.01) / 2,
                y: - 0.01 / 2
            });
            rc.attachPlaceEntity(pillarEdgeCut, pillar, {
                x: 0,
                y: 0
            });
            rc.attachPlaceEntity(pillar, base, {
                x: 0,
                y: 0
            });
            
            const spawnTime = 400;
            
            const baseCircle = base as TEntity<CircleConfig>;
            baseCircle.data.radius = 0.01;
            rc.transitionObjectValues(baseCircle.data, {
                duration: spawnTime,
                targetValues: {
                    radius: radius
                }
            });
            const pillarRect = pillar as TEntity<RectShapeData>;
            const targetValues = {
                height: pillarRect.data.height,
                y: pillarRect.data.y
            }
            pillarRect.data.height = 0;
            pillarRect.data.y = 0;
            rc.transitionObjectValues(pillarRect.data, {
                duration: spawnTime,
                targetValues: targetValues
            });
            
            base.opacity = 0;
            rc.transitionObjectValues(base, {
                duration: 100,
                targetValues: {
                    opacity: 1
                }
            });
            
            
            return base;
        }
    }
    
}


