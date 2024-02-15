// import React, {FC, RefObject, useEffect, useState} from 'react';
// import {Station, TeamInfo, TeamPositions} from "../../types";
//
// interface VersionOne {
//     teamPositions: RefObject<TeamPositions>,
//     teamId: number,
//     team: TeamInfo,
//     stations: Station,
//     path: SVGPathElement
// }
//
// /**
//  * Animation style 1
//  * As long as there isn't any new data it moves the runner from the previous known station to the next one.
//  * If it reaches the station before any new information does then it waits there.
//  * If new information come in before the runner has arrived it teleports to the new location.
//  */
// const VersionOne: FC<VersionOne> = ({ teamPositions, teamId, team, stations, path }) => {
//
//     const [position, setPosition] = useState<DOMPoint>(path.getPointAtLength(0));
//
//     useEffect(() => {
//         let animationFrameId: number;
//
//         const moveRunner = () => {
//             // TODO: Necessary check?
//
//             if (teamPositions.current && teamId in teamPositions.current) {
//                 const teamPosition = teamPositions.current[teamId];
//                 const currentTime = Date.now();
//
//                 // Check if still at same station
//                 if (team.position != teamPosition.stationId) {
//                     // Update information
//                     teamPosition.stationId = team.position;
//                     teamPosition.begin = currentTime;
//                     teamPosition.stationDistance = stations[team.position].distanceFromStart;
//                     teamPosition.nextStationDistance = stations[stations[team.position].nextStationId].distanceFromStart
//                     if (teamPosition.stationDistance > teamPosition.nextStationDistance) {
//                         teamPosition.stationDistance = 0;
//                     }
//                 }
//
//                 const timeProgress = team.averageTimes[teamPosition.stationId] / (currentTime - teamPosition.begin);
//                 const offset = (teamPosition.nextStationDistance - teamPosition.stationDistance) / timeProgress;
//                 let distance = teamPosition.stationDistance + offset;
//                 // Wait for next incoming information before moving
//                 if (distance > teamPosition.nextStationDistance) {
//                     distance = teamPosition.nextStationDistance;
//                 }
//                 const stationsSorted = Object.values(stations).sort((station1, station2) => station1.distanceFromStart - station2.distanceFromStart);
//                 const lengthFactor = path.getTotalLength() / stationsSorted[stationsSorted.length - 1].distanceFromStart;
//                 const newPos = distance * lengthFactor;
//                 setPosition(path.getPointAtLength(newPos));
//             }
//
//             animationFrameId = requestAnimationFrame(moveRunner);
//         };
//
//         animationFrameId = requestAnimationFrame(moveRunner);
//
//         return () => cancelAnimationFrame(animationFrameId);
//     });
//
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
//
// export default VersionOne;
