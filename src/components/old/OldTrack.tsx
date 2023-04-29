import React, {FC, useEffect, useState} from 'react';
import {Card, CardActions, CardContent, CardMedia, Checkbox, FormControlLabel, Grid, Typography} from "@mui/material";
import '../../styles/track.css'

// TODO: Data only send required data
interface TrackContainerProps {
    ws: WebSocket;
}
interface CountData {
    count: number,
    team: {
        id: number,
        name: string
    }
}
// TODO: Send only the new detections
interface DetectionData {
    stationId: number,
    rssi: number,
    timestamp: number,
    teamId: number
}
// TODO: Support broken stations
interface StationData {
    id: number,
    distanceFromStart: number,
    isBroken: boolean
}
interface SocketData {
    topic: string,
    data: CountData[] | DetectionData[] | StationData[]
}

const viewBoxWidth = 30;
const viewBoxHeight = 20;
const strokeWidth = 1;
const centerX = viewBoxWidth / 2;
const centerY = viewBoxHeight / 2;
const maxEllipseRadius = Math.min(centerX, centerY) - strokeWidth;
const ellipseHorizontalRadius = maxEllipseRadius;
const ellipseVerticalRadius = maxEllipseRadius * 0.6;
const xPathOffSet = 0.8;
const yPathOffSet = 1.2;
const imageHeight = 2;

const OldTrack: FC<TrackContainerProps> = ({ ws }) => {

    const stations = {}

    // {"topic": "counts", "data": [
    // {"count": 125, "team": {"id": 5, "name": "Politeia"}},
    // {"count": 115, "team": {"id": 6, "name": "HK"}},
    // ]}
    const handleCount = (data: CountData[]) => {
        return undefined
    };
    // {"topic": "detections", "data": [
    // {"stationId": 8, "rssi": -79, "timestamp": 1682613023608, "teamId": 1},
    // {"stationId": 4, "rssi": -64, "timestamp": 1682612880628, "teamId": 1},
    // ]}
    const handleDetection = (data: DetectionData[]) => {
        return undefined
    };
    // {"topic": "stations", "data": [
    // {"id": 2, "distanceFromStart": 10.0, "isBroken": false},
    // {"id": 4, "distanceFromStart": 20.0, "isBroken": false},
    // ]}
    const handleStation = (data: StationData[]) => {
        return undefined
    };
    const handleSocketData = {
        count: (data: CountData[]) => handleCount(data),
        detection: (data: DetectionData[]) => handleDetection(data),
        station: (data: StationData[]) => handleStation(data)
    };

    // useEffect(() => {
    //     ws.onmessage = (event) => {
    //         const data: SocketData = JSON.parse(event.data);
    //         if (data.topic in handleSocketData) {
    //             handleSocketData[data.topic](data.data);
    //         }
    //     }
    // })

    return (
        <Grid className="track-outer" item xs={12} md={8}>
            {/*<svg className="track" height="100%" width="100%" viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}>*/}
            {/*    <ellipse*/}
            {/*        fill="none"*/}
            {/*        stroke="lightgrey"*/}
            {/*        strokeWidth={strokeWidth}*/}
            {/*        cx={centerX} cy={centerY} rx={ellipseHorizontalRadius} ry={ellipseVerticalRadius}*/}
            {/*    />*/}
            {/*    {teams*/}
            {/*        .sort((team1, team2) => team2.laps - team1.laps)*/}
            {/*        .filter((team) => showTeam[team.name])*/}
            {/*        .map((team) => (*/}
            {/*            <image key={team.name} href={`../logo/${team.logo}`} height={imageHeight}>*/}
            {/*                <animateMotion*/}
            {/*                    dur={0.1 + Math.floor(Math.random() * 200)}*/}
            {/*                    repeatCount="indefinite"*/}
            {/*                    path={`M ${centerX + maxEllipseRadius - xPathOffSet}, ${centerY - yPathOffSet} A ${ellipseHorizontalRadius}, ${ellipseVerticalRadius} 0 1 1 ${centerX - maxEllipseRadius - xPathOffSet}, ${centerY - yPathOffSet} A ${ellipseHorizontalRadius}, ${ellipseVerticalRadius} 0 1 1 ${centerX + maxEllipseRadius - xPathOffSet}, ${centerY - yPathOffSet}`}*/}
            {/*                />*/}
            {/*            </image>*/}
            {/*        ))}*/}
            {/*</svg>*/}
            <svg width="300" height="300">
                <path d="M26, 20 L74, 20 M26, 52 L74, 52 M26, 20 C28, 22 28, 54 26, 52 M74, 20 C76, 22 76, 54 74, 52" fill="none" stroke="black" strokeWidth="1" />
            </svg>
        </Grid>
    );
};

export default OldTrack;