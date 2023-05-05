import React, {FC, useEffect} from 'react';

interface TestProps {
    ws: WebSocket;
}

const Test: FC<TestProps> = ({ ws }) => {
    useEffect(() => {
        ws.onmessage = (event => console.log(event.data))
    });
    return (
        <div>
            Test
        </div>
    );
};

export default Test;