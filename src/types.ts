//*************************//
// Types for incoming data //
//*************************//

export interface StationSocketData {
    id: number,
    distanceFromStart: number,
    isBroken: boolean
}
export interface TeamSocketData {
    id: number,
    name: string
}
export interface CountSocketData {
    count: number,
    team: {
        id: number,
        name: string
    }
}
export interface AverageTimesSocketData {
    teamId: number,
    stationId: number,
    time: number
}
export interface TeamPositionSocketData {
    teamId: number,
    position: number
}
export interface SocketData {
    topic: "stations" | "teams" | "counts" | "average_times" | "team_positions" | string,
    data: StationSocketData[] | TeamSocketData[] | CountSocketData[] | AverageTimesSocketData[] | TeamPositionSocketData[] | object
}

//***************************//
// Types for saving the data //
//***************************//

export interface TeamInfo {
    name: string,
    laps: number,
    logo: string,
    shown: boolean                                              // If a team is shown in the animation
}
export interface Team {
    [teamId: number]: TeamInfo
}
export interface Station {
        stationId: number
        distanceFromStart: number,
        point: SVGPoint,
        isBroken: boolean,
        previousStationIndex: number,                           // Faster to keep it saved instead of calculating it everytime
        nextStationIndex: number                                // ^^
}
export interface TeamPositions {
    [teamId: number]: {
        position: number,                                       // Current stationIndex according to Loxsi data
        averageTimes: { [stationIndex: number]: number },       // Average times for each segment - The stationIndex is the one of the start station. E.g. the index to go from 2 -> 3 is 2.
        beginTimes: { [stationIndex: number]: number },         // Time when it started a segment - The index when it started the segment 2 -> 3 is 2.
        animation: {
            stationary: boolean,                                // Stationary when animation passed x amount of Ronnies without runner passing a ronnie
            stationIndex: number,                               // Current station index
            nextStationDistance: number,                           // Next station index
            begin: number,                                      // Start time of current segment
            end: number,                                        // Ideal end time of current segment
            // stationDistance: number,                            // Distance to start for current station
            // nextStationDistance: number;                        // Distance to start for next station
            offset: number,                                     // Keeps track of total amount that the animation is in front or behind the runner
            offsetSegment: number,                                  // Used when animation is slower or faster to adjust its speed gradually
            offsetLast: number                                  // ^^
            adjustment: number,                                 // Adjustment factor required for next segment
            stationTimes: { [stationIndex: number]: number }    // Time when runner arrived at a station
        }
    }
}
