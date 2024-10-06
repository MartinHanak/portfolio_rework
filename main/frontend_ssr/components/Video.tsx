import { useEffect, useRef } from "react";

export default function Video() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const sourceRef = useRef(new MediaSource());

    useEffect(() => {
        const objectURL = URL.createObjectURL(sourceRef.current);

        if (videoRef.current)
            videoRef.current.src = objectURL;

        sourceRef.current.addEventListener('sourceopen', async () => {
            const mediaSource = sourceRef.current;

            const sourceBuffer = mediaSource.addSourceBuffer('video/mp4;');

            const chunkSize = 1024 * 1024;
            let startByte = 0;
            let endByte = chunkSize - 1;

            async function fetchAndAppendChunk() {
                try {
                    const response = await fetch('http://localhost:5001/Video/StreamVideo?fileName=Portfolio.mp4', {
                        headers: {
                            //'Range': `bytes=${startByte}-${endByte}`
                        }
                    });

                    if (!response.ok)
                        throw new Error('Failed to fetch video chunk');

                    const chunk = await response.arrayBuffer();

                    sourceBuffer.appendBuffer(chunk);
                    startByte += chunkSize;
                    endByte += chunkSize;
                    if (mediaSource.readyState === 'open') {
                        // TODO: fetch another one
                        // fetchAndAppendChunk();
                        console.log('fetch another one');
                    }
                } catch (error) {
                    console.error(error);
                }
            }

            fetchAndAppendChunk();

        });

    }, []);

    return <div>
        <video ref={videoRef}></video>

        <video src="http://localhost:5001/Video/StreamVideo?fileName=Portfolio.mp4" />
    </div>;
}