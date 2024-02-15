<<<<<<< Updated upstream
import React, {FC, useEffect, useRef, useState} from 'react';
import {SocketData, Station, StationSocketData, Team, TeamSocketData, TeamInformationSocketData, TeamPositions,} from "../types";
import Animation from "./Animation";
import TeamDisplay from "./TeamDisplay";


interface TrackProps {
    ws: WebSocket;
}

const Track: FC<TrackProps> = ({ ws }) => {

    // Only reload component when changes are made to either
    //      Path
    //      Ronnies (data or shown)
    //      Amount of teams, their names or if they're shown
    const [path, setPath] = useState<string>(import.meta.env.VITE_PATH);
    const [stations, setStations] = useState<Station[]>([]);
    const [showStations, setShowStations] = useState<boolean>(true);
    const [teams, setTeams] = useState<Team>({});

    // Don't reload when changes are made to a teams position data
    const teamPositions = useRef<TeamPositions>({});

    //*************************//
    // Websocket data handlers //
    //*************************//

    // Handle incoming websocket data regarding the stations
    const handleStations = (data: StationSocketData[]) => {
        const newStations: Station[] = [];
        const path: SVGPathElement = document.querySelector('path');

        // Calculate factor by which each station's distance has to be scaled with for right position on path
        data.sort((station1, station2) => station1.distanceFromStart - station2.distanceFromStart);
        const trackLength = data[data.length - 1].distanceFromStart + parseInt(import.meta.env.VITE_DISTANCE_LAST_RONNIE_TO_START);
        const lengthFactor = path.getTotalLength() / trackLength;

        // Parse station information
        const distanceRonnieSignal = parseInt(import.meta.env.VITE_DISTANCE_RONNIE_SIGNAL);
        const multiplierRonnieSignal = parseFloat(import.meta.env.VITE_MULTIPLIER_RONNIE_SIGNAL);
        data.forEach((station, index) => {
            // When the lapper reports a runner to be at a certain Ronnie than the runner isn't actually at that Ronnie.
            // It's still a bit before the Ronnie. This tries to account for that by moving the Ronnies backwards.
            const previousIndex = index === 0 ? data.length - 1 : index - 1;
            const previousDistance = data[previousIndex].distanceFromStart;
            let newDistance;
            if ((station.distanceFromStart - previousDistance + trackLength) % trackLength >= 2 * distanceRonnieSignal) {
                newDistance = (station.distanceFromStart - distanceRonnieSignal + trackLength) % trackLength;
            } else {
                newDistance = (station.distanceFromStart - multiplierRonnieSignal * ((station.distanceFromStart - previousDistance + trackLength) % trackLength) + trackLength) % trackLength;
            }

            newStations.push({
                stationId: station.id,
                distanceFromStart: newDistance * lengthFactor,
                point: path.getPointAtLength(newDistance * lengthFactor),
                isBroken: station.isBroken,
                previousStationIndex: previousIndex,
                nextStationIndex: index === data.length - 1 ? 0 : index + 1
            });
        })

        setStations(newStations);
    }

    // Handle incoming websocket data regarding teams being added or removed
    const handleTeams = (data: TeamSocketData[]) => {
        const newTeams: Team = {};
        // Change the ref value as well to only include the current teams
        const oldTeamPositions = teamPositions.current;
        const newTeamPositions: TeamPositions = {};

        data.forEach(team => {
            newTeams[team.id] = {
                name: team.name,
                laps: team.id in teams ? teams[team.id].laps : 0,
                logo: `../logo/${team.name.toLowerCase()}.png`,
                shown: team.id in teams ? teams[team.id].shown : true
            };

            if (! (team.id in oldTeamPositions)) {
                // Not yet in ref, add it with default values

                newTeamPositions[team.id] = {
                    position: 0,
                    averageTimes: {},
                    beginTimes: {},
                    animation: {
                        stationary: true,
                        stationIndex: 0,
                        nextStationDistance: 0,
                        begin: 0,
                        end: 0,
                        offset: 0,
                        offsetSegment: 0,
                        offsetLast: 0,
                        adjustment: 0,
                        stationTimes: {}
                    }
                };
            } else {
                // Already have some data to reuse
                newTeamPositions[team.id] = oldTeamPositions[team.id];
            }
        });

        teamPositions.current = newTeamPositions;
        setTeams(newTeams);
    }

    // Handle incoming websocket data regarding a team's information (laps, position, average times)
    const handleTeamInformation = (data: TeamInformationSocketData) => {
        // Only update information when we're tracking that specific team
        const currentTeamPositions = teamPositions.current;

        if (data.id in teams && data.id in currentTeamPositions) {
            const ronnieMaxDifference = parseInt(import.meta.env.VITE_RONNIE_MAX_DIFFERENCE);

            // Update basic info
            const newTeams = {...teams};
            newTeams[data.id].laps = data.laps;

            const teamPosition = currentTeamPositions[data.id];
            teamPosition.averageTimes = data.times;

            // Determine if runner went forward a station
            const newPosition = data.position !== teamPosition.position && (data.position - teamPosition.position + stations.length) % stations.length < ronnieMaxDifference;

            teamPosition.position = data.position;

            // Update TeamPosition Info if the runner went a ronnie forward
            if (newPosition) {
                const currentTime = Date.now();
                const animation = teamPosition.animation;
                teamPosition.beginTimes[teamPosition.position] = currentTime;

                if (animation.stationary) {
                    // Animation isn't moving yet

                    animation.stationary = false;
                    animation.stationIndex = teamPosition.position;
                    animation.nextStationDistance = stations[stations[teamPosition.position].nextStationIndex].distanceFromStart;
                    animation.begin = currentTime;
                    animation.end = animation.begin + teamPosition.averageTimes[animation.stationIndex];
                } else {
                    // Animation is already moving

                    // Check if the animation is in front or behind of the runner
                    const difference = (animation.stationIndex - teamPosition.position + stations.length) % stations.length;
                    if (difference < ronnieMaxDifference) {
                        // Animation is in front

                        // Set offset
                        animation.offset += currentTime - animation.stationTimes[teamPosition.position];

                        // Only set an offset if it's bigger than the maximum allowed offset
                        const maxOffset = parseInt(import.meta.env.VITE_OFFSET_MAX);
                        if (animation.offset > maxOffset) {
                            // Set variables for gradual decrease of speed

                            const offsetMultiplier = parseInt(import.meta.env.VITE_OFFSET_MULTIPLIER);
                            let addedOffset;
                            if (animation.offset > maxOffset * offsetMultiplier) {
                                addedOffset = maxOffset * offsetMultiplier;
                            } else {
                                addedOffset = (animation.offset - maxOffset) * offsetMultiplier / 2;
                            }

                            animation.offset -= addedOffset;
                            animation.offsetSegment = currentTime + addedOffset;
                            animation.offsetLast = currentTime;
                        }
                    } else {
                        // Animation is behind

                        // Set offset
                        animation.offset -= animation.end - currentTime;
                    }

                    // Set adjustment
                    const previousStationIndex = stations[teamPosition.position].previousStationIndex;
                    if (previousStationIndex in teamPosition.beginTimes) {
                        animation.adjustment = (currentTime - teamPosition.beginTimes[previousStationIndex]) / teamPosition.averageTimes[previousStationIndex];
                        delete teamPosition.beginTimes[previousStationIndex];
                    }
                }
            }

            currentTeamPositions[data.id] = teamPosition;
            teamPositions.current = currentTeamPositions;
            setTeams(newTeams);
        }
    }

    // Maps websocket key to the right handler
    const handleSocketData = {
        stations: (data: StationSocketData[]) => handleStations(data),
        teams: (data: TeamSocketData[]) => handleTeams(data),
        team_information: (data: TeamInformationSocketData) => handleTeamInformation(data)
    };

    // Handle incoming data from websocket aka Loxsi
    useEffect(() => {
        ws.onmessage = (event => {
            const data: SocketData = JSON.parse(event.data);
            if (data.topic in handleSocketData) {
                handleSocketData[data.topic](data.data);
            }
        });
    });

    //*******//
    // Other //
    //*******//

    // Calculate new station positions when a new path is used
    useEffect(() => {
        const newStations = [];
        const path: SVGPathElement = document.querySelector('path');
        const lengthFactor = path.getTotalLength() / Math.max(...stations.map(station => station.distanceFromStart));
        stations.forEach(station => {
            const newStation = {...station};
            newStation.point = path.getPointAtLength(station.distanceFromStart * lengthFactor);
            newStations.push(newStation);
        })
        setStations(newStations);
    }, [path]);

    // Toggle show team
    const checkBoxOnChange = (id: string) => {
        const oldTeams = {...teams};
        oldTeams[parseInt(id)].shown = ! oldTeams[parseInt(id)].shown;
        setTeams(oldTeams);
    };

    return (
        <Grid container justifyContent="left">
            <Grid className="track" item xs={10} >
                <TextField fullWidth label="Path" variant="outlined" defaultValue={path} onChange={(event) => setPath(event.target.value)} />
            </Grid>
            <Grid item xs={2}>
                <FormControlLabel
                    control={<Switch checked={showStations} onChange={() => setShowStations(! showStations)} />}
                    label={<Typography variant="body1">Show Stations</Typography>}
                    labelPlacement="start"
                />
            </Grid>
            <Grid item xs={12}>
                <svg height="100%" width="100%" viewBox="0 0 100 43">
                    <path
                        d={path}
                        fill="lightGray"
                        stroke="#fc4903"
                        strokeWidth="1"
                    />
                    { showStations && stations.map(station => (
                        <g key={station.stationId}>
                            <circle style={{ position: "relative" }}
                                    cx={station.point.x}
                                    cy={station.point.y}
                                    r={2}
                                    fill="green"
                            />
                            <text fontSize="3px" dx={station.point.x} dy={station.point.y}>{stations.indexOf(station) + 1}</text>
                        </g>
                    )) }
                    { Object.entries(teams).map(([id, team]) => team.shown && (
                        <Animation key={id} teamPositions={teamPositions} teamId={parseInt(id)} team={team} stations={stations} path={document.querySelector('path')} />
                    ))}
                </svg>
            </Grid>
            { Object.entries(teams)
                .sort(([, team1], [, team2]) => team2.count - team1.count)
                .map(([id, team]) => (
                    <TeamDisplay key={id} id={id} team={team} callback={checkBoxOnChange} />
                ))
            }
        </Grid>
    );
};

// TODO: README wat schooner maken

export default Track;



















// import React, {FC, useEffect, useRef, useState} from 'react';
// import {FormControlLabel, Grid, Switch, TextField, Typography} from "@mui/material";
// import "../styles/track.css"
// import {SocketData, Station, StationSocketData, Team, TeamSocketData, TeamInformationSocketData, TeamPositions,} from "../types";
// import TeamDisplay from "./TeamDisplay";
// import Animation from "./Animation";
//
// interface TrackProps {
//     ws: WebSocket;
// }
//
// const Track: FC<TrackProps> = ({ ws }) => {
//
//     // Reload component when changes are made to:
//     //  Path
//     //  Stations (Ronnies) (data or shown)
//     //  Amount of teams, their names or if they're shown
//     const [path, setPath] = useState<string>("M 19, 5 L 81, 5 A 14, 14 -90 1 1 81, 37 L 19, 37 A 14, 14 90 0 1 19, 5 Z");
//     const [stations, setStations] = useState<Station[]>([]);
//     const [showStations, setShowStations] = useState<boolean>(true);
//     const [teams, setTeams] = useState<Team>({});
//
//     // Don't reload when changes are made to a teams position data
//     const teamPositions = useRef<TeamPositions>({});
//
//     //*************************//
//     // Websocket data handlers //
//     //*************************//
//
//     // Handle incoming websocket data regarding the stations
//     const handleStation = (data: StationSocketData[]) => {
//         const newStations: Station[] = [];
//         const path: SVGPathElement = document.querySelector('path');
//
//         // Calculate factor by which each station's distance has to be scaled with for right position on path
//         data.sort((station1, station2) => station1.distanceFromStart - station2.distanceFromStart);
//         // Total length of the track
//         const trackLength = data[data.length - 1].distanceFromStart + parseInt(import.meta.env.VITE_DISTANCE_LAST_RONNIE_TO_START);
//         const lengthFactor = path.getTotalLength() / trackLength;
//
//         // Set required information for each station
//         data.forEach((station, index) => {
//             // Move each station to the position when the lapper starts to report the runner to be at that Ronnie
//             // Is 6/10 between two Ronnies or the maximum distance a Ronnie can detect a baton whichever is smaller
//             // TODO: Check this
//             const previousIndex = index === 0 ? data.length - 1 : index - 1;
//             const previousDistance = data[previousIndex].distanceFromStart;
//             let newDistance;
//             if ((station.distanceFromStart - previousDistance + trackLength) % trackLength > (2 * parseInt(import.meta.env.VITE_DISTANCE_RONNIE_SIGNAL))) {
//                 newDistance = (station.distanceFromStart - parseInt(import.meta.env.VITE_DISTANCE_RONNIE_SIGNAL) + trackLength) % trackLength;
//             } else {
//                 newDistance = (station.distanceFromStart - 0.4 * ((station.distanceFromStart - previousDistance + trackLength) % trackLength) + trackLength) % trackLength;
//                 if (newDistance < 0) {
//                     newDistance += trackLength;
//                 }
//             }
//
//             newStations.push({
//                 stationId: station.id,
//                 distanceFromStart: newDistance * lengthFactor,
//                 point: path.getPointAtLength(newDistance * lengthFactor),
//                 isBroken: station.isBroken,
//                 previousStationIndex: previousIndex,
//                 nextStationIndex: index === data.length - 1 ? 0 : index + 1
//             });
//         });
//         setStations(newStations);
//     };
//
//     // Handle incoming websocket data regarding teams being added or removed
//     const handleTeams = (data: TeamSocketData[]) => {
//         const newTeams: Team = {};
//         // Change the ref value as well to only include the current teams
//         const newTeamPositions: TeamPositions = {};
//
//         // Reuse where possible existing team data
//         data.forEach(team => {
//             newTeams[team.id] = {
//                 name: team.name,
//                 laps: team.id in teams ? teams[team.id].laps : 0,
//                 logo: `../logo/${team.name.toLowerCase()}.png`,
//                 shown: team.id in teams ? teams[team.id].shown : true,
//             };
//
//             if (teamPositions.current) {
//                 if (! (team.id in teamPositions.current)) {
//                     // Not yet in ref, add it with default values
//                     newTeamPositions[team.id] = {
//                         position: 0,
//                         averageTimes: {},
//                         beginTimes: {},
//                         animation: {
//                             stationary: true,
//                             stationIndex: 0,
//                             nextStationDistance: 0,
//                             begin: 0,
//                             end: 1,
//                             // stationDistance: 0,
//                             // nextStationDistance: 0,
//                             offset: 0,
//                             offsetEnd: 0,
//                             offsetLast: 0,
//                             adjustment: 1,
//                             stationTimes: {}
//                         }
//                     };
//                 } else {
//                     // Already have some data to reuse
//                     newTeamPositions[team.id] = teamPositions.current[team.id];
//                 }
//             }
//         });
//
//         setTeams(newTeams);
//         teamPositions.current = newTeamPositions;
//     };
//
//     // Handle incoming websocket data regarding a team's information
//     const handleTeamInformation = (data: TeamInformationSocketData) => {
//         // Only update information when we're tracking that specific team
//         if (data.id in teams && teamPositions.current && data.id in teamPositions.current) {
//             const teamPosition = teamPositions.current[data.id];
//             // Determine if runner went forward a station
//             const newPosition = data.position !== teamPosition.position && (data.position - teamPosition.position + stations.length) % stations.length < parseInt(import.meta.env.VITE_RONNIE_MAX_DIFFERENCE);
//             if (newPosition) {
//                 console.log("real new");
//             }
//
//             // Update basic info
//             const newTeams = {...teams};
//             newTeams[data.id].laps = data.laps;
//             setTeams(newTeams);
//             teamPosition.position = data.position;
//             teamPosition.averageTimes = data.times;
//
//             // Update TeamPosition Info
//             if (newPosition) {
//                 const currentTime = Date.now();
//                 const animation = teamPosition.animation;
//                 teamPosition.beginTimes[teamPosition.position] = currentTime;
//                 if (animation.stationary) {
//                     // Animation isn't moving yet
//                     animation.stationIndex = teamPosition.position;
//                     animation.nextStationDistance = stations[stations[teamPosition.position].nextStationIndex].distanceFromStart;
//                     animation.begin = currentTime;
//                     animation.end = animation.begin + teamPosition.averageTimes[animation.stationIndex];
//                     animation.stationary = false;
//                 } else {
//                     // Animation is already moving
//                     // Check if the animation is in front or behind of the runner
//                     const difference = (animation.stationIndex - teamPosition.position + stations.length) % stations.length;
//                     if (difference < parseInt(import.meta.env.VITE_RONNIE_MAX_DIFFERENCE)) {
//                         // Animation is in front
//                         // Set offset
//                         animation.offset += currentTime - animation.stationTimes[teamPosition.position];
//
//                         // Set variables for gradual increase of speed
//                         animation.offsetEnd = currentTime + (parseInt(import.meta.env.VITE_OFFSET_MIN) * parseInt(import.meta.env.VITE_OFFSET_MULTIPLIER));
//                         animation.offsetLast = currentTime;
//                     } else {
//                         // Animation is behind
//                         // Set offset
//                         animation.offset -= animation.end - currentTime;
//                     }
//                     // Set adjustment
//                     const previousStationIndex = stations[teamPosition.position].previousStationIndex;
//                     if (previousStationIndex in teamPosition.beginTimes) {
//                         // Possibility it isn't in there when animation is more than 1 Ronnie behind
//                         animation.adjustment = (currentTime - teamPosition.beginTimes[previousStationIndex]) / teamPosition.averageTimes[previousStationIndex];
//                         delete teamPosition.beginTimes[previousStationIndex];
//                     }
//                 }
//             }
//         }
//     };
//
//     // Maps websocket key to the right handler
//     const handleSocketData = {
//         stations: (data: StationSocketData[]) => handleStation(data),
//         teams: (data: TeamSocketData[]) => handleTeams(data),
//         team_information: (data: TeamInformationSocketData) => handleTeamInformation(data)
//     };
//
//
//     // Handle incoming data from websocket aka Loxsi
//     useEffect(() => {
//         ws.onmessage = (event => {
//             const data: SocketData = JSON.parse(event.data);
//             if (data.topic in handleSocketData) {
//                 handleSocketData[data.topic](data.data);
//             }
//         });
//     });
//
//     //*******//
//     // Other //
//     //*******//
//
//     // Calculate new station positions when a new path is used
//     // This assumes that the last station is at the start
//     // TODO: Is the above true?
//     useEffect(() => {
//         const newStations = [];
//         const path: SVGPathElement = document.querySelector('path');
//         const lengthFactor = path.getTotalLength() / Math.max(...stations.map(station => station.distanceFromStart));
//         stations.forEach(station => {
//             const newStation = {...station};
//             newStation.point = path.getPointAtLength(station.distanceFromStart * lengthFactor);
//             newStations.push(newStation);
//         })
//         setStations(newStations);
//     }, [path]);
//
//     // Toggle show team
//     const checkBoxOnChange = (id: string) => {
//         const oldTeams = {...teams};
//         oldTeams[parseInt(id)].shown = ! oldTeams[parseInt(id)].shown;
//         setTeams(oldTeams);
//     };
//
//     return (
//         <Grid container justifyContent="left">
//             <Grid className="track" item xs={10} >
//                 <TextField fullWidth label="Path" variant="outlined" defaultValue={path} onChange={(event) => setPath(event.target.value)} />
//             </Grid>
//             <Grid item xs={2}>
//                 <FormControlLabel
//                     control={<Switch checked={showStations} onChange={() => setShowStations(! showStations)} />}
//                     label={<Typography variant="body1">Show Stations</Typography>}
//                     labelPlacement="start"
//                 />
//             </Grid>
//             <Grid item xs={12}>
//                 <svg height="100%" width="100%" viewBox="0 0 100 43">
//                     <path
//                         d={path}
//                         fill="lightGray"
//                         stroke="#fc4903"
//                         strokeWidth="1"
//                     />
//                     { showStations && stations.map(station => (
//                         <g key={station.stationId}>
//                             <circle style={{ position: "relative" }}
//                                     cx={station.point.x}
//                                     cy={station.point.y}
//                                     r={2}
//                                     fill="green"
//                             />
//                             <text fontSize="3px" dx={station.point.x} dy={station.point.y}>{stations.indexOf(station) + 1}</text>
//                         </g>
//                     )) }
//                     { Object.entries(teams).map(([id, team]) => team.shown && (
//                         <Animation key={id} teamPositions={teamPositions} teamId={parseInt(id)} team={team} stations={stations} path={document.querySelector('path')} />
//                     ))}
//                 </svg>
//             </Grid>
//             { Object.entries(teams)
//                 .sort(([, team1], [, team2]) => team2.count - team1.count)
//                 .map(([id, team]) => (
//                     <TeamDisplay key={id} id={id} team={team} callback={checkBoxOnChange} />
//                 ))
//             }
//         </Grid>
//     );
// };
//
// // TODO: README wat schooner maken
//
=======
import React, {FC, useEffect, useRef, useState} from 'react';
import {SocketData, Station, StationSocketData, Team, TeamSocketData, TeamInformationSocketData, TeamPositions,} from "../types";
import Animation from "./Animation";
import TeamDisplay from "./TeamDisplay";


interface TrackProps {
    ws: WebSocket;
}

const Track: FC<TrackProps> = ({ ws }) => {

    // Only reload component when changes are made to either
    //      Path
    //      Ronnies (data or shown)
    //      Amount of teams, their names or if they're shown
    const [path, setPath] = useState<string>(import.meta.env.VITE_PATH);
    const [stations, setStations] = useState<Station[]>([]);
    const [showStations, setShowStations] = useState<boolean>(true);
    const [teams, setTeams] = useState<Team>({});

    // Don't reload when changes are made to a teams position data
    const teamPositions = useRef<TeamPositions>({});

    //*************************//
    // Websocket data handlers //
    //*************************//

    // Handle incoming websocket data regarding the stations
    const handleStations = (data: StationSocketData[]) => {
        const newStations: Station[] = [];
        const path: SVGPathElement = document.querySelector('path');

        // Calculate factor by which each station's distance has to be scaled with for right position on path
        data.sort((station1, station2) => station1.distanceFromStart - station2.distanceFromStart);
        const trackLength = data[data.length - 1].distanceFromStart + parseInt(import.meta.env.VITE_DISTANCE_LAST_RONNIE_TO_START);
        const lengthFactor = path.getTotalLength() / trackLength;

        // Parse station information
        const distanceRonnieSignal = parseInt(import.meta.env.VITE_DISTANCE_RONNIE_SIGNAL);
        const multiplierRonnieSignal = parseFloat(import.meta.env.VITE_MULTIPLIER_RONNIE_SIGNAL);
        data.forEach((station, index) => {
            // When the lapper reports a runner to be at a certain Ronnie than the runner isn't actually at that Ronnie.
            // It's still a bit before the Ronnie. This tries to account for that by moving the Ronnies backwards.
            const previousIndex = index === 0 ? data.length - 1 : index - 1;
            const previousDistance = data[previousIndex].distanceFromStart;
            let newDistance;
            if ((station.distanceFromStart - previousDistance + trackLength) % trackLength >= 2 * distanceRonnieSignal) {
                newDistance = (station.distanceFromStart - distanceRonnieSignal + trackLength) % trackLength;
            } else {
                newDistance = (station.distanceFromStart - multiplierRonnieSignal * ((station.distanceFromStart - previousDistance + trackLength) % trackLength) + trackLength) % trackLength;
            }

            newStations.push({
                stationId: station.id,
                distanceFromStart: newDistance * lengthFactor,
                point: path.getPointAtLength(newDistance * lengthFactor),
                isBroken: station.isBroken,
                previousStationIndex: previousIndex,
                nextStationIndex: index === data.length - 1 ? 0 : index + 1
            });
        })

        setStations(newStations);
    }

    // Handle incoming websocket data regarding teams being added or removed
    const handleTeams = (data: TeamSocketData[]) => {
        const newTeams: Team = {};
        // Change the ref value as well to only include the current teams
        const oldTeamPositions = teamPositions.current;
        const newTeamPositions: TeamPositions = {};

        data.forEach(team => {
            newTeams[team.id] = {
                name: team.name,
                laps: team.id in teams ? teams[team.id].laps : 0,
                logo: `../logo/${team.name.toLowerCase()}.png`,
                shown: team.id in teams ? teams[team.id].shown : true
            };

            if (! (team.id in oldTeamPositions)) {
                // Not yet in ref, add it with default values

                newTeamPositions[team.id] = {
                    position: 0,
                    averageTimes: {},
                    beginTimes: {},
                    animation: {
                        stationary: true,
                        stationIndex: 0,
                        nextStationDistance: 0,
                        begin: 0,
                        end: 0,
                        offset: 0,
                        offsetSegment: 0,
                        offsetLast: 0,
                        adjustment: 0,
                        stationTimes: {}
                    }
                };
            } else {
                // Already have some data to reuse
                newTeamPositions[team.id] = oldTeamPositions[team.id];
            }
        });

        teamPositions.current = newTeamPositions;
        setTeams(newTeams);
    }

    // Handle incoming websocket data regarding a team's information (laps, position, average times)
    const handleTeamInformation = (data: TeamInformationSocketData) => {
        // Only update information when we're tracking that specific team
        const currentTeamPositions = teamPositions.current;

        if (data.id in teams && data.id in currentTeamPositions) {
            const ronnieMaxDifference = parseInt(import.meta.env.VITE_RONNIE_MAX_DIFFERENCE);

            // Update basic info
            const newTeams = {...teams};
            newTeams[data.id].laps = data.laps;

            const teamPosition = currentTeamPositions[data.id];
            teamPosition.averageTimes = data.times;

            // Determine if runner went forward a station
            const newPosition = data.position !== teamPosition.position && (data.position - teamPosition.position + stations.length) % stations.length < ronnieMaxDifference;

            teamPosition.position = data.position;

            // Update TeamPosition Info if the runner went a ronnie forward
            if (newPosition) {
                const currentTime = Date.now();
                const animation = teamPosition.animation;
                teamPosition.beginTimes[teamPosition.position] = currentTime;

                if (animation.stationary) {
                    // Animation isn't moving yet

                    animation.stationary = false;
                    animation.stationIndex = teamPosition.position;
                    animation.nextStationDistance = stations[stations[teamPosition.position].nextStationIndex].distanceFromStart;
                    animation.begin = currentTime;
                    animation.end = animation.begin + teamPosition.averageTimes[animation.stationIndex];
                } else {
                    // Animation is already moving

                    // Check if the animation is in front or behind of the runner
                    const difference = (animation.stationIndex - teamPosition.position + stations.length) % stations.length;
                    if (difference < ronnieMaxDifference) {
                        // Animation is in front

                        // Set offset
                        animation.offset += currentTime - animation.stationTimes[teamPosition.position];

                        // Only set an offset if it's bigger than the maximum allowed offset
                        const maxOffset = parseInt(import.meta.env.VITE_OFFSET_MAX);
                        if (animation.offset > maxOffset) {
                            // Set variables for gradual decrease of speed

                            const offsetMultiplier = parseInt(import.meta.env.VITE_OFFSET_MULTIPLIER);
                            let addedOffset;
                            if (animation.offset > maxOffset * offsetMultiplier) {
                                addedOffset = maxOffset * offsetMultiplier;
                            } else {
                                addedOffset = (animation.offset - maxOffset) * offsetMultiplier / 2;
                            }

                            animation.offset -= addedOffset;
                            animation.offsetSegment = currentTime + addedOffset;
                            animation.offsetLast = currentTime;
                        }
                    } else {
                        // Animation is behind

                        // Set offset
                        animation.offset -= animation.end - currentTime;
                    }

                    // Set adjustment
                    const previousStationIndex = stations[teamPosition.position].previousStationIndex;
                    if (previousStationIndex in teamPosition.beginTimes) {
                        animation.adjustment = (currentTime - teamPosition.beginTimes[previousStationIndex]) / teamPosition.averageTimes[previousStationIndex];
                        delete teamPosition.beginTimes[previousStationIndex];
                    }
                }
            }

            currentTeamPositions[data.id] = teamPosition;
            teamPositions.current = currentTeamPositions;
            setTeams(newTeams);
        }
    }

    // Maps websocket key to the right handler
    const handleSocketData = {
        stations: (data: StationSocketData[]) => handleStations(data),
        teams: (data: TeamSocketData[]) => handleTeams(data),
        team_information: (data: TeamInformationSocketData) => handleTeamInformation(data)
    };

    // Handle incoming data from websocket aka Loxsi
    useEffect(() => {
        ws.onmessage = (event => {
            const data: SocketData = JSON.parse(event.data);
            if (data.topic in handleSocketData) {
                handleSocketData[data.topic](data.data);
            }
        });
    });

    //*******//
    // Other //
    //*******//

    // Calculate new station positions when a new path is used
    useEffect(() => {
        const newStations = [];
        const path: SVGPathElement = document.querySelector('path');
        const lengthFactor = path.getTotalLength() / Math.max(...stations.map(station => station.distanceFromStart));
        stations.forEach(station => {
            const newStation = {...station};
            newStation.point = path.getPointAtLength(station.distanceFromStart * lengthFactor);
            newStations.push(newStation);
        })
        setStations(newStations);
    }, [path]);

    // Toggle show team
    const checkBoxOnChange = (id: string) => {
        const oldTeams = {...teams};
        oldTeams[parseInt(id)].shown = ! oldTeams[parseInt(id)].shown;
        setTeams(oldTeams);
    };

    return (
        <Grid container justifyContent="left">
            <Grid className="track" item xs={10} >
                <TextField fullWidth label="Path" variant="outlined" defaultValue={path} onChange={(event) => setPath(event.target.value)} />
            </Grid>
            <Grid item xs={2}>
                <FormControlLabel
                    control={<Switch checked={showStations} onChange={() => setShowStations(! showStations)} />}
                    label={<Typography variant="body1">Show Stations</Typography>}
                    labelPlacement="start"
                />
            </Grid>
            <Grid item xs={12}>
                <svg height="100%" width="100%" viewBox="0 0 100 43">
                    <path
                        d={path}
                        fill="lightGray"
                        stroke="#fc4903"
                        strokeWidth="1"
                    />
                    { showStations && stations.map(station => (
                        <g key={station.stationId}>
                            <circle style={{ position: "relative" }}
                                    cx={station.point.x}
                                    cy={station.point.y}
                                    r={2}
                                    fill="green"
                            />
                            <text fontSize="3px" dx={station.point.x} dy={station.point.y}>{stations.indexOf(station) + 1}</text>
                        </g>
                    )) }
                    { Object.entries(teams).map(([id, team]) => team.shown && (
                        <Animation key={id} teamPositions={teamPositions} teamId={parseInt(id)} team={team} stations={stations} path={document.querySelector('path')} />
                    ))}
                </svg>
            </Grid>
            { Object.entries(teams)
                .sort(([, team1], [, team2]) => team2.count - team1.count)
                .map(([id, team]) => (
                    <TeamDisplay key={id} id={id} team={team} callback={checkBoxOnChange} />
                ))
            }
        </Grid>
    );
};

// TODO: README wat schooner maken

export default Track;



















// import React, {FC, useEffect, useRef, useState} from 'react';
// import {FormControlLabel, Grid, Switch, TextField, Typography} from "@mui/material";
// import "../styles/track.css"
// import {SocketData, Station, StationSocketData, Team, TeamSocketData, TeamInformationSocketData, TeamPositions,} from "../types";
// import TeamDisplay from "./TeamDisplay";
// import Animation from "./Animation";
//
// interface TrackProps {
//     ws: WebSocket;
// }
//
// const Track: FC<TrackProps> = ({ ws }) => {
//
//     // Reload component when changes are made to:
//     //  Path
//     //  Stations (Ronnies) (data or shown)
//     //  Amount of teams, their names or if they're shown
//     const [path, setPath] = useState<string>("M 19, 5 L 81, 5 A 14, 14 -90 1 1 81, 37 L 19, 37 A 14, 14 90 0 1 19, 5 Z");
//     const [stations, setStations] = useState<Station[]>([]);
//     const [showStations, setShowStations] = useState<boolean>(true);
//     const [teams, setTeams] = useState<Team>({});
//
//     // Don't reload when changes are made to a teams position data
//     const teamPositions = useRef<TeamPositions>({});
//
//     //*************************//
//     // Websocket data handlers //
//     //*************************//
//
//     // Handle incoming websocket data regarding the stations
//     const handleStation = (data: StationSocketData[]) => {
//         const newStations: Station[] = [];
//         const path: SVGPathElement = document.querySelector('path');
//
//         // Calculate factor by which each station's distance has to be scaled with for right position on path
//         data.sort((station1, station2) => station1.distanceFromStart - station2.distanceFromStart);
//         // Total length of the track
//         const trackLength = data[data.length - 1].distanceFromStart + parseInt(import.meta.env.VITE_DISTANCE_LAST_RONNIE_TO_START);
//         const lengthFactor = path.getTotalLength() / trackLength;
//
//         // Set required information for each station
//         data.forEach((station, index) => {
//             // Move each station to the position when the lapper starts to report the runner to be at that Ronnie
//             // Is 6/10 between two Ronnies or the maximum distance a Ronnie can detect a baton whichever is smaller
//             // TODO: Check this
//             const previousIndex = index === 0 ? data.length - 1 : index - 1;
//             const previousDistance = data[previousIndex].distanceFromStart;
//             let newDistance;
//             if ((station.distanceFromStart - previousDistance + trackLength) % trackLength > (2 * parseInt(import.meta.env.VITE_DISTANCE_RONNIE_SIGNAL))) {
//                 newDistance = (station.distanceFromStart - parseInt(import.meta.env.VITE_DISTANCE_RONNIE_SIGNAL) + trackLength) % trackLength;
//             } else {
//                 newDistance = (station.distanceFromStart - 0.4 * ((station.distanceFromStart - previousDistance + trackLength) % trackLength) + trackLength) % trackLength;
//                 if (newDistance < 0) {
//                     newDistance += trackLength;
//                 }
//             }
//
//             newStations.push({
//                 stationId: station.id,
//                 distanceFromStart: newDistance * lengthFactor,
//                 point: path.getPointAtLength(newDistance * lengthFactor),
//                 isBroken: station.isBroken,
//                 previousStationIndex: previousIndex,
//                 nextStationIndex: index === data.length - 1 ? 0 : index + 1
//             });
//         });
//         setStations(newStations);
//     };
//
//     // Handle incoming websocket data regarding teams being added or removed
//     const handleTeams = (data: TeamSocketData[]) => {
//         const newTeams: Team = {};
//         // Change the ref value as well to only include the current teams
//         const newTeamPositions: TeamPositions = {};
//
//         // Reuse where possible existing team data
//         data.forEach(team => {
//             newTeams[team.id] = {
//                 name: team.name,
//                 laps: team.id in teams ? teams[team.id].laps : 0,
//                 logo: `../logo/${team.name.toLowerCase()}.png`,
//                 shown: team.id in teams ? teams[team.id].shown : true,
//             };
//
//             if (teamPositions.current) {
//                 if (! (team.id in teamPositions.current)) {
//                     // Not yet in ref, add it with default values
//                     newTeamPositions[team.id] = {
//                         position: 0,
//                         averageTimes: {},
//                         beginTimes: {},
//                         animation: {
//                             stationary: true,
//                             stationIndex: 0,
//                             nextStationDistance: 0,
//                             begin: 0,
//                             end: 1,
//                             // stationDistance: 0,
//                             // nextStationDistance: 0,
//                             offset: 0,
//                             offsetEnd: 0,
//                             offsetLast: 0,
//                             adjustment: 1,
//                             stationTimes: {}
//                         }
//                     };
//                 } else {
//                     // Already have some data to reuse
//                     newTeamPositions[team.id] = teamPositions.current[team.id];
//                 }
//             }
//         });
//
//         setTeams(newTeams);
//         teamPositions.current = newTeamPositions;
//     };
//
//     // Handle incoming websocket data regarding a team's information
//     const handleTeamInformation = (data: TeamInformationSocketData) => {
//         // Only update information when we're tracking that specific team
//         if (data.id in teams && teamPositions.current && data.id in teamPositions.current) {
//             const teamPosition = teamPositions.current[data.id];
//             // Determine if runner went forward a station
//             const newPosition = data.position !== teamPosition.position && (data.position - teamPosition.position + stations.length) % stations.length < parseInt(import.meta.env.VITE_RONNIE_MAX_DIFFERENCE);
//             if (newPosition) {
//                 console.log("real new");
//             }
//
//             // Update basic info
//             const newTeams = {...teams};
//             newTeams[data.id].laps = data.laps;
//             setTeams(newTeams);
//             teamPosition.position = data.position;
//             teamPosition.averageTimes = data.times;
//
//             // Update TeamPosition Info
//             if (newPosition) {
//                 const currentTime = Date.now();
//                 const animation = teamPosition.animation;
//                 teamPosition.beginTimes[teamPosition.position] = currentTime;
//                 if (animation.stationary) {
//                     // Animation isn't moving yet
//                     animation.stationIndex = teamPosition.position;
//                     animation.nextStationDistance = stations[stations[teamPosition.position].nextStationIndex].distanceFromStart;
//                     animation.begin = currentTime;
//                     animation.end = animation.begin + teamPosition.averageTimes[animation.stationIndex];
//                     animation.stationary = false;
//                 } else {
//                     // Animation is already moving
//                     // Check if the animation is in front or behind of the runner
//                     const difference = (animation.stationIndex - teamPosition.position + stations.length) % stations.length;
//                     if (difference < parseInt(import.meta.env.VITE_RONNIE_MAX_DIFFERENCE)) {
//                         // Animation is in front
//                         // Set offset
//                         animation.offset += currentTime - animation.stationTimes[teamPosition.position];
//
//                         // Set variables for gradual increase of speed
//                         animation.offsetEnd = currentTime + (parseInt(import.meta.env.VITE_OFFSET_MIN) * parseInt(import.meta.env.VITE_OFFSET_MULTIPLIER));
//                         animation.offsetLast = currentTime;
//                     } else {
//                         // Animation is behind
//                         // Set offset
//                         animation.offset -= animation.end - currentTime;
//                     }
//                     // Set adjustment
//                     const previousStationIndex = stations[teamPosition.position].previousStationIndex;
//                     if (previousStationIndex in teamPosition.beginTimes) {
//                         // Possibility it isn't in there when animation is more than 1 Ronnie behind
//                         animation.adjustment = (currentTime - teamPosition.beginTimes[previousStationIndex]) / teamPosition.averageTimes[previousStationIndex];
//                         delete teamPosition.beginTimes[previousStationIndex];
//                     }
//                 }
//             }
//         }
//     };
//
//     // Maps websocket key to the right handler
//     const handleSocketData = {
//         stations: (data: StationSocketData[]) => handleStation(data),
//         teams: (data: TeamSocketData[]) => handleTeams(data),
//         team_information: (data: TeamInformationSocketData) => handleTeamInformation(data)
//     };
//
//
//     // Handle incoming data from websocket aka Loxsi
//     useEffect(() => {
//         ws.onmessage = (event => {
//             const data: SocketData = JSON.parse(event.data);
//             if (data.topic in handleSocketData) {
//                 handleSocketData[data.topic](data.data);
//             }
//         });
//     });
//
//     //*******//
//     // Other //
//     //*******//
//
//     // Calculate new station positions when a new path is used
//     // This assumes that the last station is at the start
//     // TODO: Is the above true?
//     useEffect(() => {
//         const newStations = [];
//         const path: SVGPathElement = document.querySelector('path');
//         const lengthFactor = path.getTotalLength() / Math.max(...stations.map(station => station.distanceFromStart));
//         stations.forEach(station => {
//             const newStation = {...station};
//             newStation.point = path.getPointAtLength(station.distanceFromStart * lengthFactor);
//             newStations.push(newStation);
//         })
//         setStations(newStations);
//     }, [path]);
//
//     // Toggle show team
//     const checkBoxOnChange = (id: string) => {
//         const oldTeams = {...teams};
//         oldTeams[parseInt(id)].shown = ! oldTeams[parseInt(id)].shown;
//         setTeams(oldTeams);
//     };
//
//     return (
//         <Grid container justifyContent="left">
//             <Grid className="track" item xs={10} >
//                 <TextField fullWidth label="Path" variant="outlined" defaultValue={path} onChange={(event) => setPath(event.target.value)} />
//             </Grid>
//             <Grid item xs={2}>
//                 <FormControlLabel
//                     control={<Switch checked={showStations} onChange={() => setShowStations(! showStations)} />}
//                     label={<Typography variant="body1">Show Stations</Typography>}
//                     labelPlacement="start"
//                 />
//             </Grid>
//             <Grid item xs={12}>
//                 <svg height="100%" width="100%" viewBox="0 0 100 43">
//                     <path
//                         d={path}
//                         fill="lightGray"
//                         stroke="#fc4903"
//                         strokeWidth="1"
//                     />
//                     { showStations && stations.map(station => (
//                         <g key={station.stationId}>
//                             <circle style={{ position: "relative" }}
//                                     cx={station.point.x}
//                                     cy={station.point.y}
//                                     r={2}
//                                     fill="green"
//                             />
//                             <text fontSize="3px" dx={station.point.x} dy={station.point.y}>{stations.indexOf(station) + 1}</text>
//                         </g>
//                     )) }
//                     { Object.entries(teams).map(([id, team]) => team.shown && (
//                         <Animation key={id} teamPositions={teamPositions} teamId={parseInt(id)} team={team} stations={stations} path={document.querySelector('path')} />
//                     ))}
//                 </svg>
//             </Grid>
//             { Object.entries(teams)
//                 .sort(([, team1], [, team2]) => team2.count - team1.count)
//                 .map(([id, team]) => (
//                     <TeamDisplay key={id} id={id} team={team} callback={checkBoxOnChange} />
//                 ))
//             }
//         </Grid>
//     );
// };
//
// // TODO: README wat schooner maken
//
>>>>>>> Stashed changes
// export default Track;