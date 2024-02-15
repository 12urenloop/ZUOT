// import React, {FC, RefObject, useEffect, useState} from 'react';
// import {Station, TeamInfo, TeamPositions} from "../types";

// interface VersionTwoProps {
//     teamPositions: RefObject<TeamPositions>,
//     team: TeamInfo,
//     teamId: number,
//     stations: Station[],
//     path: SVGPathElement,
// }

// /**
//  * Animation style 2
//  * Difference with previous version is that it keeps running, doesn't matter what data comes in.
//  * When new data comes in it checks if the runner reached the station sooner or later.
//  * Based on that it'll adjust the next average time and add the offset it accumulated in the last segment
//  */
// const VersionTwo: FC<VersionTwoProps> = ({ teamPositions, team, teamId, stations, path }) => {

//     // TODO: No average times => NaN errors
//     const [position, setPosition] = useState<DOMPoint>(path.getPointAtLength(0));

//     useEffect(() => {
//         let animationFrameId: number;

//         const moveRunner = () => {
//             if (teamPositions.current && teamId in teamPositions.current && (! teamPositions.current[teamId].runner.stationary)) {
//                 const teamPosition = teamPositions.current[teamId];
//                 const runner = teamPosition.runner;
//                 const currentTime = Date.now();

//                 // Check if runner arrived to the next station
//                 if (currentTime - runner.begin > runner.end) {
//                     // Update information
//                     runner.stationIndex = stations[runner.stationIndex].nextStationId;
//                     runner.stationTimes[runner.stationIndex] = runner.begin + runner.end;
//                     runner.begin = currentTime;
//                     runner.end = Math.max(teamPosition.averageTimes[runner.stationIndex] + runner.offset, 1);
//                     runner.offset = 0;
//                     runner.stationDistance = stations[runner.stationIndex].distanceFromStart;
//                     runner.nextStationDistance = stations[stations[runner.stationIndex].nextStationId].distanceFromStart;
//                     if (runner.stationDistance > runner.nextStationDistance) {
//                         runner.stationDistance = 0;
//                     }
//                 }
//                 // Calculate new position based on time passed
//                 const timeProgress = runner.end / (currentTime - runner.begin);
//                 const offset = (runner.nextStationDistance - runner.stationDistance) / timeProgress;
//                 const distance = runner.stationDistance + offset;

//                 const lengthFactor = path.getTotalLength() / stations[stations.length - 1].distanceFromStart;
//                 const newPos = distance * lengthFactor;
//                 setPosition(path.getPointAtLength(newPos));
//             }

//             animationFrameId = requestAnimationFrame(moveRunner);
//         }

//         animationFrameId = requestAnimationFrame(moveRunner);

//         return () => cancelAnimationFrame(animationFrameId);
//     });

//     return (
//         <image
//             href={team.logo}
//             x={position.x}
//             y={position.y}
//             width="5"
//             height="5"
//         />
//     );
// };

// export default VersionTwo;