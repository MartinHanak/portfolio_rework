import { ReactNode, createContext, useContext, useState } from "react";

interface IEditorContext {
    file: File | null;
    setFile: (file: File | null) => void;
}

interface IEditorContextProvider {
    children: ReactNode;
}

const editorContext = createContext<IEditorContext>({ file: null, setFile: () => { } });

export default function EditorContext({ children }: IEditorContextProvider) {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (inputFile: File | null) => {
        setFile(inputFile);
    };


    return <editorContext.Provider value={{ file: file, setFile: handleFileChange }}>
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