import './App.css'
import OldTrack from "./components/old/OldTrack";
import Test from "./components/Test";
import React, {useEffect, useContext, useState} from "react";
import OldTeams from "./components/old/OldTeams";
import {Grid, Typography} from "@mui/material";
import {TeamInfo} from "../../types"
import Track from "./components/Track";

interface TeamInfoContextType {
    teamInfo: TeamInfo[];
    setTeamInfo: React.Dispatch<React.SetStateAction<TeamInfo>>;
}

export const TeamInfoContext = React.createContext<TeamInfo>({});

const App = () => {

    const ws = new WebSocket(`${import.meta.env.VITE_LOXSI_IP}:${import.meta.env.VITE_LOXSI_PORT}/feed`);

    const [teamInfo, setTeamInfo] = useState<TeamInfo>({});

    return (
        // <Grid container justifyContent="left">
        //     <Grid item xs={12}>
        //         <Typography variant="h1">Zoutvat</Typography>
        //     </Grid>
        //     <Grid item xs={12}>
        //         <Typography variant="h3">Zeus Online Urenloop Tracking Voor Attente Trackers</Typography>
        //     </Grid>
        //     {/*<TeamInfoContext.Provider  value={teamInfo}>*/}
        //         <OldTrack ws={ws}/>
        //         {/*<OldTeams ws={ws}/>*/}
        //     {/*</TeamInfoContext.Provider>*/}
        //     <Test />
        // </Grid>
        <Grid container justifyContent="center">
            <Grid item xs={12}>
                <Typography variant="h1">Zoutvat</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h3">Zeus Online Urenloop Tracking Voor Attente Trackers</Typography>
            </Grid>
            <Grid item xs={12}>
                <Track ws={ws}/>
                {/*<Test />*/}
            </Grid>
        </Grid>
    );
}

export default App;
