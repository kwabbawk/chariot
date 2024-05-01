import { Observable } from "rxjs";
import { LimitCutConfig } from "../../renderer/entities/limit-cut-icon/limit-cut-icon.component";
import { CastBarConfig } from "./CastBarConfig";
import { BaseShapeRectConfig } from "./BaseShapeRectConfig";
import { BaseShapeCircleConfig } from "./BaseShapeCircleConfig";
import { FadeConfig } from "./FadeConfig";
import { MoveEntityConfig } from "./MoveEntityConfig";
import { TransitionConfig } from "./TransitionConfig";
import { EntityPlacementConfig } from "./EntityPlacementConfig";
import { EntityRef } from "./Encounter";



export interface RunControl {
    moveEntity(entityRef: EntityRef, c: MoveEntityConfig): Promise<void>;
    getEntitiesByTags(tags: string[]): EntityRef[];
    fadeIn(entity: EntityRef, config: FadeConfig): Promise<void>;

    transitionObjectValues<T>(entity: T, config: TransitionConfig<T>): Promise<void>;

    getTime(): number;
    castBar(c: CastBarConfig): Promise<void>;
    wait(time: number, keyword?: string): Promise<void>;

    get gameTicks(): Observable<void>;

    createShapeRect(c: BaseShapeRectConfig): EntityRef;
    createShapeCircle(c: BaseShapeCircleConfig): EntityRef;
    createLimitCutIcon(c: LimitCutConfig): EntityRef;
    placeEntity(entity: EntityRef, c: EntityPlacementConfig): void;
    attachPlaceEntity(entity: EntityRef, host: EntityRef, c: EntityPlacementConfig): void;
    removeEntity(entity: EntityRef): void;
}
