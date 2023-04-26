import React from 'react';
import {Card, CardContent, CardMedia, Grid, Typography} from "@mui/material";
import '../styles/track.css'

const Track = () => {
    const teams = [
        {
            name: "Antilopen",
            logo: "antilopen.jpg",
            laps: 34,
        },
        {
            name: "Blandinia",
            logo: "blandinia.png",
            laps: 12,
        },
        {
            name: "Hermes",
            logo: "hermes.png",
            laps: 56,
        },
        {
            name: "HILOK",
            logo: "hilok.png",
            laps: 78,
        },
        {
            name: "HILOK Roze",
            logo: "hilok roze.png",
            laps: 55,
        },
        {
            name: "HK",
            logo: "hk.png",
            laps: 76,
        },
        {
            name: "Lila",
            logo: "lila.png",
            laps: 24,
        },
        {
            name: "Lombrosiana",
            logo: "lombrosiana.png",
            laps: 45,
        },
        {
            name: "Politeia",
            logo: "politeia.png",
            laps: 32,
        },
        {
            name: "SK",
            logo: "sk.png",
            laps: 23,
        },
        {
            name: "VEK",
            logo: "vek.png",
            laps: 35,
        },
        {
            name: "VGK",
            logo: "vgk.png",
            laps: 56,
        },
        {
            name: "VLK",
            logo: "vlk.png",
            laps: 23,
        },
        {
            name: "VPPK",
            logo: "vppk.png",
            laps: 85,
        },
        {
            name: "VRG",
            logo: "vrg.png",
            laps: 23,
        },
        {
            name: "VTK",
            logo: "vtk.png",
            laps: 76,
        },
        {
            name: "Wetenschappen",
            logo: "wetenschappen.png",
            laps: 76,
        }
    ]
    return (
        <Grid container justifyContent="center">
            <Grid item xs={12}>
                <Typography variant="h1">ZUOT</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h3">Zeus Urenloop Online Tracking</Typography>
            </Grid>
            <Grid className="track-outer" item xs={12} md={8}>
                <svg className="track" width="auto" height="auto">
                { teams
                    .sort((team1, team2) => team2 - team1)
                    .map((team, index) => (
                        <>
                            <ellipse
                                fill="none"
                                stroke="lightgrey"
                                strokeWidth={5}
                                cx={230} cy={250} rx={50 + (10 * index)} ry={30  + (5 * index)}
                            />
                            <circle className="circle" r={10} fill="red">
                                <animateMotion className="circle"
                                    dur={5 + Math.floor(Math.random() * 10)}
                                    repeatCount="indefinite"
                                    path={`M ${230 + (50 + (10 * index))}, ${250} A ${50 + (10 * index)}, ${30 + (5 * index)} 0 1 1 ${230 - (50 + (10 * index))}, ${250} A ${50 + (10 * index)}, ${30 + (5 * index)} 0 1 1 ${230 + (50 + (10 * index))}, ${250}`} />
                            </circle>
                        </>
                    ))}
                </svg>
            </Grid>
            { teams
                .sort((team1, team2) => team2.laps - team1.laps)
                .map(team => (
                <Grid item xs={3} md={2}>
                    <Card className="team">
                        <CardMedia
                            component="img"
                            height="auto"
                            image={"../logo/" + team.logo}
                            alt={team.name}
                        />
                        <CardContent>
                            <Typography variant="body2" >
                                {team.name}
                            </Typography>
                            <Typography variant="h5">
                                {team.laps}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            )) }
        </Grid>
    );
};

export default Track;