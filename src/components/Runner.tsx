import React, {FC} from 'react';
import {Station, TeamInfo} from "../types";

interface RunnerProps {
    team: TeamInfo,
    stations: Station
}

const Runner: FC<RunnerProps> = ({ team, stations }) => {
    return (
        <>
            {
                stations[team.position] &&
                <image
                    href={team.logo}
                    x={stations[team.position].point.x}
                    y={stations[team.position].point.y}
                    width="5"
                    height="5"
                />
            }
        </>
    );
};

export default Runner;