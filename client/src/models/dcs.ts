import { Dictionary } from './';

export type Point = {
   lat: number,
   lon: number    
}

export type StaticPoint = {
    alt: number,
    type: string,
    name: string,
    position: Point,
    speed: number,
    action: string
}

export type Unit = {
    id: number,
    name: string,
    type: string,    
    position: Point,    
    sidc: string
}

export type Group = {
    id: number,
    name: string,
    units: Array<Unit>,
    points: Array<StaticPoint>
}

export type Country = {
    id: number,
    name: string,
    vehicle_group: Array<Group>,
    ship_group: Array<Group>,
    plane_group: Array<Group>,
    helicopter_group: Array<Group>,
    static_group: Array<Group>,    
    [key: string]: Array<Group> | number | string;    
}


export type Coalition = {
    name: string,
    countries: Dictionary<Country>
}

export type Mission = {
    coalition: Dictionary<Coalition>
}
