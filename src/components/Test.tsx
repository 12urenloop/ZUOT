import React, {useEffect} from 'react';

const Test = () => {

    useEffect(() => {
        const ws = new WebSocket(`${import.meta.env.VITE_LOXSI_IP}:${import.meta.env.VITE_LOXSI_PORT}/feed`);
        ws.onopen = () => console.log("open");
        ws.onmessage = event => console.log(event.data);
    })

    return (
        <div>

        </div>
    );
};

export default Test;