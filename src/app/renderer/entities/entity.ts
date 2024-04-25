import { Component } from "@angular/core";
import { EntityLayers } from "../../encounter/game";

export interface Entity {
    attachedTo?: Entity;
    rotation?: number;
    opacity?: number;
    subEntities?: Entity[];
    name?: string;
    template?: any;
    layer: EntityLayers;
    x: number;
    y: number;
    component: any;
    tags: string[];
}

export interface TEntity<T> extends Entity {
    data: T;
}