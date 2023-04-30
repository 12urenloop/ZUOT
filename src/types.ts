export interface TeamInfo {
    name: string,
    logo: string,
    show: boolean,
    count: number,
    position: number
}
export interface Team {
    [id: number]: TeamInfo
}
export interface Station {
    [id: number] : {
        distanceFromStart: number,
        point: SVGPoint,
        isBroken: boolean,
        nextStationId: number
    };
}
export interface StationData {
    id: number,
    distanceFromStart: number,
    isBroken: boolean
}
export interface TeamData {
    id: number,
    name: string
}
export interface CountData {
    count: number,
    team: {
        id: number,
        name: string
    },
    position: number
}
export interface SocketData {
    topic: "stations" | "teams" | "counts" | string,
    data: StationData[] | TeamData[] | CountData[] |  object
}