import React, {FC, useEffect, useRef, useState} from 'react';
import {FormControlLabel, Grid, Switch, TextField, Typography} from "@mui/material";
import "../styles/track.css"
import {SocketData, Station, StationData, Team, TeamData, TeamInformationData, TeamPositions,} from "../types";
import TeamDisplay from "./TeamDisplay";
import Runner from "./Runner";

interface TrackProps {
    ws: WebSocket;
}

const Track: FC<TrackProps> = ({ ws }) => {

    // Reload component when changes are made to:
    //  Path
    //  Stations (Ronnies) (data or shown)
    //  Amount of teams or their name or if they're shown
    const [path, setPath] = useState<string>("M 19, 5 L 81, 5 A 14, 14 -90 1 1 81, 37 L 19, 37 A 14, 14 90 0 1 19, 5 Z");
    const [stations, setStations] = useState<Station[]>([]);
    const [showStations, setShowStations] = useState<boolean>(true);
    const [teams, setTeams] = useState<Team>({});

    // Don't reload when changes are made to a teams position data
    const teamPositions = useRef<TeamPositions>({});

    const handleStation = (data: StationData[]) => {
        const newStations: Station[] = [];
        const path: SVGPathElement = document.querySelector('path');

        data.sort((station1, station2) => station1.distanceFromStart - station2.distanceFromStart);
        const lengthFactor = path.getTotalLength() / data[data.length - 1].distanceFromStart;

        data.forEach((station, index) => {
            newStations.push({
                id: station.id,
                distanceFromStart: station.distanceFromStart,
                point: path.getPointAtLength(station.distanceFromStart * lengthFactor),
                isBroken: station.isBroken,
                nextStationId: index === data.length - 1 ? 0 : index + 1
            });
        });
        setStations(newStations);
    };
    const handleTeams = (data: TeamData[]) => {
        // New team data
        const newTeams: Team = {};
        // Change the ref value as well to only include the current teams
        const newTeamPositions: TeamPositions = {};
        data.forEach(team => {
            newTeams[team.id] = {
                name: team.name,
                laps: team.id in teams ? teams[team.id].laps : 0,
                logo: `../logo/${team.name.toLowerCase()}.png`,
                show: team.id in teams ? teams[team.id].show : true,
            };

            if (teamPositions.current) {
                if (! (team.id in teamPositions.current)) {
                    // Not yet in teamPositions, add it with default values
                    newTeamPositions[team.id] = {
                        position: 0,
                        averageTimes: {},
                        runner: {
                            stationary: true,
                            stationIndex: 0,
                            begin: 0,
                            end: 0,
                            stationDistance: 0,
                            nextStationDistance: 0,
                            offset: 0,
                            stationTimes: {}
                        }
                    };
                } else {
                    // Already have some data so reuse it
                    newTeamPositions[team.id] = teamPositions.current[team.id];
                }
            }
        });

        setTeams(newTeams);
        teamPositions.current = newTeamPositions;
    };
    const handleTeamInformation = (data: TeamInformationData) => {
        // Only update information if it's in teams
        if (data.id in teams) {
            const teamPosition = teamPositions.current[data.id];
            const newPosition = data.position !== teamPosition.position && (data.position - teamPosition.position + stations.length) % stations.length < 3;

            // Update basic info
            const newTeams = {...teams};
            newTeams[data.id].laps = data.laps;
            setTeams(newTeams);
            teamPosition.position = data.position;
            teamPosition.averageTimes = data.times;

            // Update position info

            // Update TeamPosition Info
            if (newPosition && teamPositions.current && data.id in teamPositions.current) {
                const runner = teamPosition.runner;
                if (teamPosition.runner.stationary) {
                    // First information, set all data
                    runner.stationIndex = data.position;
                    runner.begin = Date.now();
                    runner.end = teamPosition.averageTimes[data.position];
                    runner.stationDistance = stations[data.position].distanceFromStart;
                    runner.nextStationDistance = stations[stations[data.position].nextStationId].distanceFromStart;
                    if (runner.stationDistance > runner.nextStationDistance) {
                        runner.stationDistance = 0;
                    }
                    runner.stationary = false;
                } else {
                    // Already running, set offset
                    const difference = (runner.stationIndex - data.position + stations.length) % stations.length;
                    // Check if actual data is in front or behind simulation
                    if (difference > 0) {
                        if (difference < 3) {
                            // Actual data is behind
                            if (data.position in runner.stationTimes) {
                                runner.offset += Date.now() - runner.stationTimes[data.position];
                            }
                        } else {
                            // Actual data is in front
                            if (difference === 6) {
                                // Only one station behind
                                runner.offset -= (runner.begin + runner.end ) - Date.now();
                            } else {
                                runner.offset -= 100000;
                            }
                        }
                    }
                }
            }
        }
    };
    const handleSocketData = {
        stations: (data: StationData[]) => handleStation(data),
        teams: (data: TeamData[]) => handleTeams(data),
        team_information: (data: TeamInformationData) => handleTeamInformation(data)
    };

    useEffect(() => {
        ws.onmessage = (event => {
            const data: SocketData = JSON.parse(event.data);
            if (data.topic in handleSocketData) {
                handleSocketData[data.topic](data.data);
            }
        });
    });
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

    const checkBoxOnChange = (id: string) => {
        const oldTeams = {...teams};
        oldTeams[parseInt(id)].show = ! oldTeams[parseInt(id)].show;
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
                        <g key={station.id}>
                            <circle style={{ position: "relative" }}
                                    cx={station.point.x}
                                    cy={station.point.y}
                                    r={2}
                                    fill="green"
                            />
                            <text fontSize="3px" dx={station.point.x} dy={station.point.y}>{stations.indexOf(station) + 1}</text>
                        </g>
                    )) }
                    { Object.entries(teams).map(([id, team]) => team.show && (
                        <Runner key={id} teamPositions={teamPositions} teamId={parseInt(id)} team={team} stations={stations} path={document.querySelector('path')} />
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

export default Track;