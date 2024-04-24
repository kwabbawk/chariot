import { Component } from "@angular/core";

export interface Entity {
    rotation?: number;
    opacity?: number;
    subEntities?: Entity[];
    template?: any;
    x: number;
    y: number;
    component: any;
    tags?: string[];
}

export interface TEntity<T> extends Entity {
    data: T;
}