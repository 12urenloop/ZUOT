import React, {FC, useEffect, useState} from 'react';
import {Grid, TextField} from "@mui/material";

interface TrackProps {
    ws: WebSocket;
}
interface StationData {
    id: number,
    distanceFromStart: number,
    isBroken: boolean
}
interface SocketData {
    topic: "station" | string,
    data: StationData[] | object
}
interface Station {
    [id: number] : {
        distanceFromStart: number,
        length: number,
        point: SVGPoint,
        isBroken: boolean,
        nextStationId: number
    }
}

const Track: FC<TrackProps> = ({ ws }) => {

    const [path, setPath] = useState<string>("M 76, 20 L 124, 20 A 14, 14 -90 1 1 124, 52 L 76, 52 A 14, 14 90 0 1 76, 20 Z");
    const [stations, setStations] = useState<Station>({});

    const handleStation = (data: StationData[]) => {
        const newStations: Station = {};
        const path: SVGPathElement = document.querySelector('path');
        data.sort((station1, station2) => station1.distanceFromStart - station2.distanceFromStart)
        const lengthFactor = path.getTotalLength() / data[data.length - 1].distanceFromStart
        data.forEach((station, index) => {
            newStations[station.id] = {
                distanceFromStart: station.distanceFromStart,
                length: station.distanceFromStart * lengthFactor,
                point: path.getPointAtLength(station.distanceFromStart * lengthFactor),
                isBroken: station.isBroken,
                nextStationId: index === 0 ? data[data.length - 1].id : index === data.length - 1 ? data[0].id : data[index + 1].id
            }
        });
        setStations(newStations);
    };
    const handleSocketData = {
        stations: (data: StationData[]) => handleStation(data)
    };

    useEffect(() => {
        ws.onmessage = (event => {
            const data: SocketData = JSON.parse(event.data);
            if (data.topic in handleSocketData) {
                handleSocketData[data.topic](data.data);
            }
        })
    });
    useEffect(() => {
        const newStation = {}
        const path: SVGPathElement = document.querySelector('path');
        const maxDistance = Math.max(...Object.values(stations).map(station => station.distanceFromStart));
        const lengthFactor = path.getTotalLength() / maxDistance;
        for (const station in stations) {
            newStation[station] = stations[station];
            newStation[station].length = stations[station].distanceFromStart * lengthFactor;
            newStation[station].point = path.getPointAtLength(stations[station].distanceFromStart * lengthFactor);
        }
        setStations(newStation);
    }, [path]);

    return (
        <Grid container justifyContent="left">
            <Grid item xs={12} >
                <TextField fullWidth label="Path" variant="outlined" defaultValue={path} onChange={(event) => setPath(event.target.value)} />
            </Grid>
            <Grid item xs={12}>
                <svg viewBox="0 0 200 200">
                    <path d={path} fill="none" stroke="black" strokeWidth="1"/>
                    {Object.keys(stations).map(stationId => (
                        <circle key={stationId} cx={stations[stationId].point.x} cy={stations[stationId].point.y} r={2} fill="red" />
                    ))}
                </svg>
            </Grid>
        </Grid>
    );
};

export default Track;