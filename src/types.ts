// Types for incoming data
export interface TeamInformationData {
    id: number,
    laps: number,
    position: number,
    times: {
        [stationId: number]: number
    }
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
export interface SocketData {
    topic: "stations" | "teams" | "team_information" | string,
    data: StationData[] | TeamData[] | TeamInformationData[] | object
}
// Types for saving the data
export interface TeamInfo {
    name: string,
    logo: string,
    show: boolean,
    laps: number,
    position: number,
    averageTimes: { [stationId: number]: number }
}
export interface Team {
    [id: number]: TeamInfo
}
export interface Station {
    [id: number]: {
        distanceFromStart: number,
        point: SVGPoint,
        isBroken: boolean,
        nextStationId: number
    }
}
