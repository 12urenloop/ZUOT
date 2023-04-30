import './App.css'
import React from "react";
import {Grid, Typography} from "@mui/material";
import Track from "./components/Track";

const App = () => {

    const ws = new WebSocket(`${import.meta.env.VITE_LOXSI_IP}:${import.meta.env.VITE_LOXSI_PORT}/feed`);

    return (
        <Grid container justifyContent="center">
            <Grid item xs={12}>
                <Typography variant="h1">Zoutvat</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h3">Zeus Online Urenloop Tracking Voor Attente Trackers</Typography>
            </Grid>
            <Grid item xs={12}>
                <Track ws={ws}/>
            </Grid>
        </Grid>
    );
}

export default App;
