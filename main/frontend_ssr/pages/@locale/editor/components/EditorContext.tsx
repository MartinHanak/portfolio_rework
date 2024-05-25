import { MutableRefObject, ReactNode, createContext, useContext, useRef, useState } from "react";
import { Camera, Matrix4 } from "three";

interface IEditorContext {
    file: File | null;
    setFile: (file: File | null) => void;
    cameraMatrix: MutableRefObject<Camera>;
    cameraMatrixChange: (camera: Camera) => void;
}

interface IEditorContextProvider {
    children: ReactNode;
}

const editorContext = createContext<IEditorContext>({ file: null, setFile: () => { }, cameraMatrix: { current: new Camera() }, cameraMatrixChange: () => { } });

export default function EditorContext({ children }: IEditorContextProvider) {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (inputFile: File | null) => {
        setFile(inputFile);
    };

    const cameraMatrixRef = useRef<Camera>(new Camera());

    const handleCameraMatrixChange = (camera: Camera) => {
        cameraMatrixRef.current = camera;
    };


    return <editorContext.Provider value={{
        file: file,
        setFile: handleFileChange,
        cameraMatrix: cameraMatrixRef,
        cameraMatrixChange: handleCameraMatrixChange
    }}>
        {children}
    </editorContext.Provider>;
}

export const useEditorContext = () => {
    const context = useContext(editorContext);
    if (!context) {
        throw new Error('useEditorContext has to be used inside the EditorContext');
    }
    return context;
};