import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useEditorContext } from "./EditorContext";

export default function EditorControls() {

    const [angle, setAngle] = useState(90);

    const { file, setFile, markEdgesAngle } = useEditorContext();
    const controls = useRef<HTMLDivElement>(null);
    const startOffset = useRef<{ top: number, left: number; } | null>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFile(event.target.files ? event.target.files[0] : null);
    };

    const handleDown = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (!controls.current) return;
        const bounds = controls.current.getBoundingClientRect();

        startOffset.current = {
            top: e.pageY - bounds.top,
            left: e.pageX - bounds.left
        };
    };

    useEffect(() => {
        const handleUp = () => {
            startOffset.current = null;
        };

        const handleMove = (e: PointerEvent) => {
            if (!controls.current || !startOffset.current) return;

            const start = startOffset.current;

            controls.current.style.left = `${e.pageX - start.left}px`;
            controls.current.style.top = `${e.pageY - start.top}px`;
        };
        window.addEventListener('pointerup', handleUp);
        window.addEventListener('pointermove', handleMove);

        return () => {
            window.removeEventListener('pointerup', handleUp);
            window.removeEventListener('pointermove', handleMove);
        };
    }, []);

    return <div ref={controls} className="absolute top-32 left-4 px-4 pb-4 rounded-md bg-gray-900 bg-opacity-50 text-white z-[9999]">
        <button className="ml-auto block" onPointerDown={handleDown}>move</button>
        <div className="flex flex-col gap-4">
            <div className="flex flex-col">
                <label htmlFor="gltf-input">Load gltf</label>
                <input type="file" name="gltf-input" id="gltf-input" onChange={handleFileChange} />
            </div>

            <div className="flex flex-col">
                <label htmlFor="angle">Mark edges with angle greater than or equal to</label>
                <input id="angle" type="number" className="text-black"
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    min={0}
                    max={180}
                ></input>
                <button onClick={() => markEdgesAngle(angle)}>Mark</button>
            </div>
        </div>
    </div>;
}