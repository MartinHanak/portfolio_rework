import { clientOnly } from 'vike-react/clientOnly';

const Video = clientOnly(() => import("../../../components/Video"));

export default function Page() {

    return <main className="fixed w-screen h-screen overflow-hidden top-0 left-0 flex">
        <h1>Video</h1>

        <Video />
    </main>;

}