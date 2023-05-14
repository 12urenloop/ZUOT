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
    laps: number,
    logo: string,
    show: boolean
}
export interface Team {
    [id: number]: TeamInfo
}
export interface Station {
        id: number
        distanceFromStart: number,
        point: SVGPoint,
        isBroken: boolean,
        nextStationId: number
}
export interface TeamPositions {
    [id: number]: {
        position: number,
        averageTimes: { [stationId: number]: number }
        runner: {
            stationary: boolean,
            stationIndex: number,
            begin: number,
            end: number,
            stationDistance: number,
            nextStationDistance: number;
            offset: number,
            stationTimes: { [stationIndex: number]: number }
        }
    }
}
