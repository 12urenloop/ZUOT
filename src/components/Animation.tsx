import React, {FC, RefObject, useEffect, useState} from 'react';
import {Station, TeamInfo, TeamPositions} from "../types";

interface AnimationProps {
    teamPositions: RefObject<TeamPositions>,
    team: TeamInfo,
    teamId: number,
    stations: Station[],
    path: SVGPathElement,
}

/**
 * Animation style 3
 * Goal of this version is to make everything smoother and more accurate.
 * First step is by moving each station to the position the lapper will report the runner to be there instead of where they actually are (done in Track.tsx).
 * As for making the animation smoother:
 *  - When the animation is in front it slowly slows down
 *  - When it's behind it speeds up a little
 *  - The time it takes to go to the next station is the average teams time adjusted to the runner previous time compared to the average
 * For more information see README.md
 */

const Animation: FC<AnimationProps> = ({ teamPositions, team, teamId, stations, path }) => {

    const [position, setPosition] = useState<DOMPoint>(path.getPointAtLength(0));

    useEffect(() => {
        let animationFrameId: number;
        const ronnieMaxDifference = parseInt(import.meta.env.VITE_RONNIE_MAX_DIFFERENCE);
        const minOffset = parseInt(import.meta.env.VITE_OFFSET_MIN);
        const offsetMultiplier = parseInt(import.meta.env.VITE_OFFSET_MULTIPLIER);
        const trackLength = stations[stations.length - 1].distanceFromStart + parseInt(import.meta.env.VITE_DISTANCE_LAST_RONNIE_TO_START);


        // TODO: Set offsetEnd first time
        const moveAnimation = () => {
            const currentTeamPositions = teamPositions.current;
            // Only adjust position if team exists and isn't stationary
            if (currentTeamPositions && teamId in currentTeamPositions && ! currentTeamPositions[teamId].animation.stationary) {
                const teamPosition = currentTeamPositions[teamId];
                const animation = teamPosition.animation;
                const currentTime = Date.now();

                console.log(teamPosition);

                if (currentTime >= animation.end) {
                    // Animation arrived at a new Ronnie

                    // Adjust animation fields
                    animation.begin = currentTime;
                    animation.stationIndex = stations[animation.stationIndex].nextStationIndex;
                    animation.nextStationDistance = stations[stations[animation.stationIndex].nextStationIndex].distanceFromStart;
                    animation.stationTimes[animation.stationIndex] = animation.end;
                    animation.end = currentTime + teamPosition.averageTimes[animation.stationIndex] * animation.adjustment + animation.offsetSegment;
                    animation.offsetSegment = 0;

                    // Check if the animation is in front or behind of the runner
                    const difference = (animation.stationIndex - teamPosition.position + stations.length) % stations.length;
                    if (difference === ronnieMaxDifference) {
                        // Too big of a difference between the animation and the runner
                        // Something went wrong, no data anymore, runner fell, ...
                        // Set animation to the latest known location and don't move it anymore until there's new data

                        animation.stationary = true;
                        animation.stationIndex = stations[teamPosition.position].previousStationIndex;
                        animation.nextStationDistance = stations[teamPosition.position].distanceFromStart;
                        animation.end = currentTime;
                        animation.begin = currentTime - 1;
                    } else if (difference === 0 || difference >= ronnieMaxDifference) {
                        // Animation is behind

                        // Set offset
                        animation.offset -= currentTime - teamPosition.beginTimes[animation.stationIndex]

                        // Set variables for gradual increase of speed
                        if (animation.offset < minOffset) {
                            let addedOffset: number;
                            if (animation.offset < minOffset * offsetMultiplier) {
                                addedOffset = minOffset * offsetMultiplier;
                            } else {
                                addedOffset = (animation.offset - minOffset) * offsetMultiplier / 2;
                            }

                            animation.offset += addedOffset;
                            animation.offsetSegment -= addedOffset;
                            animation.offsetLast = currentTime;
                        }
                    }
                }

                if (animation.offsetSegment !== 0) {
                    // Gradually adjust the end for a smooth increase or decrease in speed
                    const timeDifference = currentTime - animation.offsetLast;
                    if (timeDifference !== 0 && currentTime + timeDifference < animation.end) {
                        let offset: number;
                        if (animation.offsetSegment > 0) {
                            offset = Math.min(timeDifference, animation.offsetSegment);
                        } else {
                            offset = Math.max(timeDifference * -1, animation.offsetSegment);
                        }
                        animation.end += offset;
                        animation.offsetSegment -= offset;
                        animation.offsetLast = currentTime;
                    }
                }

                // console.log("CT: " + currentTime);
                // console.log("Begin: " + animation.begin);
                // console.log("End: " + animation.end);
                // console.log("Adjustment: " + animation.adjustment);
                // console.log("Next station distance: " + animation.nextStationDistance);
                // console.log("Distance from start: " + stations[animation.stationIndex].distanceFromStart);
                // console.log("Tracklength: " + trackLength);
                // Calculate new position
                const timeProgress = (currentTime - animation.begin) / (animation.end - animation.begin);
                const distanceProgress = ((animation.nextStationDistance - stations[animation.stationIndex].distanceFromStart + trackLength) % trackLength) * timeProgress
                const distance = stations[animation.stationIndex].distanceFromStart + distanceProgress;

                currentTeamPositions[teamId] = teamPosition;
                // teamPositions.current[teamId] = currentTeamPositions;

                setPosition(path.getPointAtLength(distance));
            }

            // Loop over animation
            animationFrameId = requestAnimationFrame(moveAnimation);
        }

        // Start loop
        animationFrameId = requestAnimationFrame(moveAnimation);

        // Cancel loop when animation ends
        return () => cancelAnimationFrame(animationFrameId);
    });

    return (
        <image
            href={team.logo}
            x={position.x}
            y={position.y}
            width="5"
            height="5"
        />
    )
}

// TODO: Set animation stationary if difference higher than 3

export default Animation;