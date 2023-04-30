import React, {FC} from 'react';

interface Team {
    name: string,
    logo: string,
    show: boolean,
    count: number,
    position: number
}
interface Station {
    [id: number] : {
        distanceFromStart: number,
        point: SVGPoint,
        isBroken: boolean,
        nextStationId: number
    };
}
interface RunnerProps {
    team: Team,
    stations: Station
}

const Runner: FC<RunnerProps> = ({ team, stations }) => {
    return (
        <>
            {
                stations[team.position] &&
                <image
                    href={`../logo/${team.logo}`}
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