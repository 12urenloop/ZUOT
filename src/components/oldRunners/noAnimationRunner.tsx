// import React, {FC} from 'react';
// import {Station, TeamInfo} from "../../types";
//
// interface NoAnimationRunner {
//     team: TeamInfo,
//     stations: Station
// }
//
// const NoAnimationRunner: FC<NoAnimationRunner> = ({ team, stations }) => {
//     return (
//         <>
//             {
//                 stations[team.position] &&
//                 <image
//                     href={team.logo}
//                     x={stations[team.position].point.x}
//                     y={stations[team.position].point.y}
//                     width="5"
//                     height="5"
//                 />
//             }
//         </>
//     );
// };
//
// export default NoAnimationRunner;