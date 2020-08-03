import { LatLng } from "leaflet";

export interface BaseMasterMode {
    name: string
};

export type AddFlightMode = BaseMasterMode & {
    location: LatLng | undefined;
};

export type EditGroupMode = BaseMasterMode & {
    selectedGroupId: number | undefined
};

export type MasterMode = undefined | AddFlightMode | EditGroupMode;

export const defaultAddFlightMode: AddFlightMode = {
    name: "AddFlightMode",
    location: undefined
}

export const defaultEditGroupMode: EditGroupMode = {
    name: "EditGroupMode",
    selectedGroupId: undefined
}

