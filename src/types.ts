import React from "react";

export interface TeamInfo {
    [name: string]: {
        logo: string,
        show: boolean
    }
}

export interface TeamInfoContextType {
    teamInfo: TeamInfo[];
    setTeamInfo: React.Dispatch<React.SetStateAction<TeamInfo>>;
}