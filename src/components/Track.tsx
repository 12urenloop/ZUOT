import React, {useState} from 'react';
import {Card, CardActions, CardContent, CardMedia, Checkbox, FormControlLabel, Grid, Typography} from "@mui/material";
import '../styles/track.css'

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

const Track = () => {
    const [showTeam, setShowTeam] = useState({
        Antilopen: true,
        Blandinia: true,
        Hermes: true,
        HILOK: true,
        "HILOK Roze": true,
        HK: true,
        Lila: true,
        Lombrosiana: true,
        Politeia: true,
        SK: true,
        VEK: true,
        VGK: true,
        VLK: true,
        VPPK: true,
        VRG: true,
        VTK: true,
        Wetenschappen: true
    });

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
    ];
    const checkBoxOnChange = (event, team: string) => {
        console.log(showTeam);
        const oldData = {...showTeam};
        oldData[team] = ! oldData[team];
        console.log(oldData);
        setShowTeam(oldData);
        console.log(showTeam)
    };
    return (
        <Grid container justifyContent="center">
            <Grid item xs={12}>
                <Typography variant="h1">Zoutvat</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h3">Zeus Online Urenloop Tracking Voor Attente Trackers</Typography>
            </Grid>
            <Grid className="track-outer" item xs={12} md={8}>
                <svg className="track" height="100%" width="100%" viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}>
                    <ellipse
                        fill="none"
                        stroke="lightgrey"
                        strokeWidth={strokeWidth}
                        cx={centerX} cy={centerY} rx={ellipseHorizontalRadius} ry={ellipseVerticalRadius}
                    />
                    {teams
                        .sort((team1, team2) => team2.laps - team1.laps)
                        .filter((team) => showTeam[team.name])
                        .map((team) => (
                            <image key={team.name} href={`../logo/${team.logo}`} height={imageHeight}>
                                <animateMotion
                                    dur={0.1 + Math.floor(Math.random() * 200)}
                                    repeatCount="indefinite"
                                    path={`M ${centerX + maxEllipseRadius - xPathOffSet}, ${centerY - yPathOffSet} A ${ellipseHorizontalRadius}, ${ellipseVerticalRadius} 0 1 1 ${centerX - maxEllipseRadius - xPathOffSet}, ${centerY - yPathOffSet} A ${ellipseHorizontalRadius}, ${ellipseVerticalRadius} 0 1 1 ${centerX + maxEllipseRadius - xPathOffSet}, ${centerY - yPathOffSet}`}
                                />
                            </image>
                        ))}
                </svg>
            </Grid>
            { teams
                .sort((team1, team2) => team2.laps - team1.laps)
                .map(team => (
                    <Grid key={team.name} item xs={3} md={2}>
                        <Card className="team">
                            <CardMedia
                                component="img"
                                height="auto"
                                image={"../logo/" + team.logo}
                                alt={team.name}
                            />
                            <CardContent>
                                <Typography variant="body2">
                                    {team.name}
                                </Typography>
                                <Typography variant="h5">
                                    {team.laps}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <FormControlLabel
                                    control={<Checkbox defaultChecked onChange={event => checkBoxOnChange(event, team.name)}/>}
                                    label={<Typography variant="body2">Show</Typography>}
                                    labelPlacement="bottom"
                                />
                            </CardActions>
                        </Card>
                    </Grid>
                ))
            }
        </Grid>
    );
};

export default Track;