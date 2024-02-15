<<<<<<< Updated upstream
import React, {FC} from 'react';
import {Card, CardActions, CardContent, CardMedia, Checkbox, FormControlLabel, Grid, Typography} from "@mui/material";
import {TeamInfo} from "../types";
import "../styles/team.css"

interface TeamProps {
    id: string,
    team: TeamInfo,
    callback: (id: string) => void
}

const TeamDisplay: FC<TeamProps> = ({ id, team, callback }) => {
    return (
        <Grid item xs={3} md={2}>
            <Card className="team">
                <CardMedia
                    component="img"
                    height="auto"
                    image={team.logo}
                    alt={team.name}
                />
                <CardContent>
                    <Typography variant="body2">
                        {team.name}
                    </Typography>
                    <Typography variant="body">
                        {team.laps}
                    </Typography>
                </CardContent>
                <CardActions>
                    <FormControlLabel
                        control={<Checkbox checked={team.shown} onChange={() => callback(id)}/>}
                        label={<Typography variant="body2">Show</Typography>}
                        labelPlacement="bottom"
                    />
                </CardActions>
            </Card>
        </Grid>
    );
};

=======
import React, {FC} from 'react';
import {Card, CardActions, CardContent, CardMedia, Checkbox, FormControlLabel, Grid, Typography} from "@mui/material";
import {TeamInfo} from "../types";
import "../styles/team.css"

interface TeamProps {
    id: string,
    team: TeamInfo,
    callback: (id: string) => void
}

const TeamDisplay: FC<TeamProps> = ({ id, team, callback }) => {
    return (
        <Grid item xs={3} md={2}>
            <Card className="team">
                <CardMedia
                    component="img"
                    height="auto"
                    image={team.logo}
                    alt={team.name}
                />
                <CardContent>
                    <Typography variant="body2">
                        {team.name}
                    </Typography>
                    <Typography variant="body">
                        {team.laps}
                    </Typography>
                </CardContent>
                <CardActions>
                    <FormControlLabel
                        control={<Checkbox checked={team.shown} onChange={() => callback(id)}/>}
                        label={<Typography variant="body2">Show</Typography>}
                        labelPlacement="bottom"
                    />
                </CardActions>
            </Card>
        </Grid>
    );
};

>>>>>>> Stashed changes
export default TeamDisplay;