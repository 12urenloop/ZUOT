import React, {FC, useEffect, useState} from 'react';
import {FormControlLabel, Grid, Switch, TextField, Typography} from "@mui/material";
import "../styles/track.css"
import Runner from "./Runner";
import {CountData, SocketData, Station, StationData, Team, TeamData} from "../types";
import TeamDisplay from "./TeamDisplay";

interface TrackProps {
    ws: WebSocket;
}

const Track: FC<TrackProps> = ({ ws }) => {

    const [path, setPath] = useState<string>("M 19, 5 L 81, 5 A 14, 14 -90 1 1 81, 37 L 19, 37 A 14, 14 90 0 1 19, 5 Z");
    const [stations, setStations] = useState<Station>({});
    const [showStations, setShowStations] = useState<boolean>(true);
    const [teams, setTeams] = useState<Team>({});

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
                nextStationId: index === 0 ? data[data.length - 1].id : index === data.length - 1 ? data[0].id : data[index + 1].id
            }
        });
        setStations(newStations);
    };
    const handleTeam = (data: TeamData[]) => {
        const newTeams: Team = {};
        data.forEach(team => {
            newTeams[team.id] = {
                name: team.name,
                logo: `${team.name.toLowerCase()}.png`,
                show: team.id in teams ? teams[team.id].show : true,
                count: team.id in teams ? teams[team.id].count : 0,
                position: team.id in teams ? teams[team.id].position : 0,
            };
        });
        setTeams(newTeams);
    };
    const handleCount = (data: CountData[]) => {
        const newTeams: Team = {...teams};
        data.forEach(info => {
            if (info.team.id in newTeams) {
                newTeams[info.team.id].count = info.count;
                newTeams[info.team.id].position = info.position;
            }
        });
        setTeams(newTeams);
    };
    const handleSocketData = {
        stations: (data: StationData[]) => handleStation(data),
        teams: (data: TeamData[]) => handleTeam(data),
        counts: (data: CountData[]) => handleCount(data)
    };

    useEffect(() => {
        ws.onmessage = (event => {
            const data: SocketData = JSON.parse(event.data);
            if (data.topic in handleSocketData) {
                handleSocketData[data.topic](data.data);
            }
        });
    });

    const pathOnChange = (newPath: string) => {
        setPath(newPath);
        const newStation = {}
        const path: SVGPathElement = document.querySelector('path');
        const maxDistance = Math.max(...Object.values(stations).map(station => station.distanceFromStart));
        const lengthFactor = path.getTotalLength() / maxDistance;
        for (const station in stations) {
            newStation[station] = stations[station];
            newStation[station].point = path.getPointAtLength(stations[station].distanceFromStart * lengthFactor);
        }
        setStations(newStation);
    };

    const checkBoxOnChange = (id: string) => {
        const oldTeams = {...teams};
        oldTeams[parseInt(id)].show = ! oldTeams[parseInt(id)].show;
        setTeams(oldTeams);
    };

    return (
        <Grid container justifyContent="left">
            <Grid className="track" item xs={10} >
                <TextField fullWidth label="Path" variant="outlined" defaultValue={path} onChange={(event) => pathOnChange(event.target.value)} />
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
                    { Object.values(teams).map(team => team.show && (
                        <Runner key={team.name} team={team} stations={stations} />
                    )) }
                </svg>
            </Grid>
            { Object.entries(teams).map(([id, team]) => (
                <TeamDisplay key={id} id={id} team={team} callback={checkBoxOnChange} />
            ))
            }
        </Grid>
    );
};

export default Track;