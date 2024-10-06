export default class VideoHandler {
  videoElement: HTMLVideoElement;
  mediaSource = new MediaSource();

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
  }

  initializeDownload() {
    this.videoElement.src = URL.createObjectURL(this.mediaSource);
    this.mediaSource.addEventListener("sourceopen", () => this.fetchChunk());
  }

  private async fetchChunk() {
    const sourceBuffer = this.mediaSource.addSourceBuffer(
      'video/mp4; codecs="avc1.640028"; profiles="isom,iso2,avc1,mp41"'
    );

    const response = await fetch(
      "http://localhost:5001/Video/StreamVideo?fileName=Portfolio_frag4.mp4",
      {
        headers: {
          //   Range: `bytes=${0}-${800000}`,
        },
      }
    );

    const chunk = await response.arrayBuffer();

    sourceBuffer.addEventListener("updateend", () => {
      // this.mediaSource.endOfStream();
      this.videoElement.play();
    });

    sourceBuffer.appendBuffer(chunk);
  }
}
