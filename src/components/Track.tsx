import React, {FC, useEffect, useState, useRef} from 'react';
import {FormControlLabel, Grid, Switch, TextField, Typography} from "@mui/material";
import "../styles/track.css"
import NoAnimationRunner from "./oldRunners/noAnimationRunner";
import {SocketData, Station, StationData, Team, TeamData, TeamInformationData, TeamPosition,} from "../types";
import TeamDisplay from "./TeamDisplay";
import VersionOne from "./oldRunners/VersionOne";

interface TrackProps {
    ws: WebSocket;
}

// TODO: Check loxsi to change it so it sends each time separately to avoid sending the same stuff
const Track: FC<TrackProps> = ({ ws }) => {

    const [path, setPath] = useState<string>("M 19, 5 L 81, 5 A 14, 14 -90 1 1 81, 37 L 19, 37 A 14, 14 90 0 1 19, 5 Z");
    const [stations, setStations] = useState<Station>({});
    const [showStations, setShowStations] = useState<boolean>(true);
    const [teams, setTeams] = useState<Team>({});
    const teamPositions = useRef<TeamPosition>({});

    const handleStation = (data: StationData[]) => {
        const newStations: Station = {};
        const path: SVGPathElement = document.querySelector('path');

        data.sort((station1, station2) => station1.distanceFromStart - station2.distanceFromStart)
        const lengthFactor = path.getTotalLength() / data[data.length - 1].distanceFromStart

        data.forEach((station, index) => {
            newStations[station.id] = {
                distanceFromStart: station.distanceFromStart,
                point: path.getPointAtLength(station.distanceFromStart * lengthFactor),
                isBroken: station.isBroken,
                nextStationId: index === data.length - 1 ? data[0].id : data[index + 1].id
            }
        });
        setStations(newStations);
    };
    const handleTeams = (data: TeamData[]) => {
        const newTeams: Team = {};
        data.forEach(team => {
            newTeams[team.id] = {
                name: team.name,
                logo: `../logo/${team.name.toLowerCase()}.png`,
                show: team.id in teams ? teams[team.id].show : true,
                laps: team.id in teams ? teams[team.id].laps : 0,
                position: team.id in teams ? teams[team.id].position : 0,
                averageTimes: team.id in teams ? teams[team.id].averageTimes : {}
            };
            if (teamPositions.current && ! (team.id in teamPositions.current)) {
                teamPositions.current[team.id] = {
                    stationId: -1,
                    begin: -1,
                    end: -1,
                    stationDistance: -1,
                    nextStationDistance: -1,
                    offset: -1,
                    stationTimes: {}
                };
            }
        });
        setTeams(newTeams);
    };
    const handleTeamInformation = (data: TeamInformationData[]) => {
        const newTeams: Team = {...teams};
        if (Object.keys(newTeams).length > 0) {
            // Check necessary for first render
            data.forEach(info => {
                // Update team info
                if (info.id in newTeams) {
                    newTeams[info.id].laps = info.laps;
                    newTeams[info.id].position = info.position;
                    newTeams[info.id].averageTimes = info.times;
                }
                // Update TeamPosition Info
                if (teamPositions.current && info.id in teamPositions.current) {
                    // Check if actual data is in front or behind simulation
                    const teamPosition = teamPositions.current[info.id];
                    if (info.position % 7 > teamPosition.stationId % 7) {
                        // Actual data is in front
                        teamPosition.offset += Date.now() - teamPosition.end;
                    } else {
                        // Actual data is behind
                        teamPosition.offset -= Date.now() - teamPosition.stationTimes[info.position];
                    }
                }
            });

            setTeams(newTeams);
        }
    };
    const handleSocketData = {
        stations: (data: StationData[]) => handleStation(data),
        teams: (data: TeamData[]) => handleTeams(data),
        team_information: (data: TeamInformationData[]) => handleTeamInformation(data)
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
        const newStation = {}
        const path: SVGPathElement = document.querySelector('path');
        const maxDistance = Math.max(...Object.values(stations).map(station => station.distanceFromStart));
        const lengthFactor = path.getTotalLength() / maxDistance;
        for (const station in stations) {
            newStation[station] = stations[station];
            newStation[station].point = path.getPointAtLength(stations[station].distanceFromStart * lengthFactor);
        }
        setStations(newStation);
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
                    { showStations && Object.values(stations).map(station => (
                        <circle style={{ position: "relative" }}
                                key={station.distanceFromStart}
                                cx={station.point.x}
                                cy={station.point.y}
                                r={2}
                                fill="green"
                        />
                    )) }
                    {/*{ Object.values(teams).map(team => team.show && (*/}
                    {/*    <NoAnimationRunner key={team.name} team={team} stations={stations} />*/}
                    {/*)) }*/}
                    { Object.entries(teams).map(([id, team]) => team.show && (
                        <VersionOne key={id} teamPositions={teamPositions} teamId={parseInt(id)} team={team} stations={stations} path={document.querySelector('path')} />
                    )) }
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