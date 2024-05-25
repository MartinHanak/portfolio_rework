import { ChangeEvent } from "react";
import { useEditorContext } from "./EditorContext";

export default function EditorControls() {

    const { file, setFile } = useEditorContext();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFile(event.target.files ? event.target.files[0] : null);
    };

    return <div className="absolute top-32 left-4 p-4 rounded-md bg-gray-900 bg-opacity-50 text-white z-[9999]">
        <div className="flex flex-col">
            <label htmlFor="gltf-input">Load gltf</label>
            <input type="file" name="gltf-input" id="gltf-input" onChange={handleFileChange} />
        </div>
    </div>;
}