import React, {FC, useContext, useEffect, useState} from 'react';
import {TeamInfoContext} from "../../App";
import {Card, CardActions, CardContent, CardMedia, Checkbox, FormControlLabel, Grid, Typography} from "@mui/material";
import '../../styles/teams.css'
import {TeamInfo, TeamInfoContextType} from "../../types";

interface TeamContainerProps {
    ws: WebSocket;
}

const OldTeams: FC<TeamContainerProps> = ({ ws }) => {

    const {teamInfo, setTeamInfo} = useContext(TeamInfoContext);

    // TODO: If teams get added midway every team is shown again
    useEffect(() => {
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.topic === "teams") {
                const newTeamInfo: TeamInfo = {};
                data.data.forEach(team => {
                    newTeamInfo[team.name] = {
                        logo: `${team.name.toLowerCase()}.png`,
                        show: true
                    };
                });
                setTeamInfo(newTeamInfo);
            }
        }
    });

    const checkBoxOnChange = (team: string) => {
        const oldData = {...teamInfo};
        oldData[team] = ! oldData[team].show;
        setTeamInfo(oldData);
    };

    return (
        <>
            { teamInfo
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
                                    control={<Checkbox checked={showTeams[team.name]} onChange={() => checkBoxOnChange(team.name)}/>}
                                    label={<Typography variant="body2">Show</Typography>}
                                    labelPlacement="bottom"
                                />
                            </CardActions>
                        </Card>
                    </Grid>
                ))
            }
        </>
    );
};

export default OldTeams;