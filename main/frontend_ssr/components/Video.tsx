import { useEffect, useRef } from "react";
import VideoHandler from "./VideoHandler";

export default function Video() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {


        if (videoRef.current === null) {
            console.error('No video element');
            return;
        }

        const videoHandler = new VideoHandler(videoRef.current);

        videoHandler.initializeDownload();


    });

    return <div>
        <video ref={videoRef} width="640" height="360" controls></video>

        {/* <video src="http://localhost:5001/Video/StreamVideo?fileName=Portfolio.mp4" /> */}
    </div>;
}