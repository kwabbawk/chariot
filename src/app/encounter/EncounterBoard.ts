import { Entity, TEntity } from "../renderer/entities/entity";
import { PlayerTokenData } from "../renderer/entities/player-token/player-token.component";


export class EncounterBoard {
    public players: TEntity<PlayerTokenData>[] = [];
    public entities: Entity[] = [];
}
