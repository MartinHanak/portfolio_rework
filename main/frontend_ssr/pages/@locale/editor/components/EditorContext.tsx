import { MutableRefObject, ReactNode, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { BufferAttribute, Camera, Float32BufferAttribute, InstancedBufferAttribute, Matrix4, Mesh, Object3D, Points, PointsMaterial } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import Graph from "../../../../canvas/graph/Graph";
import LineSegments3 from "../../../../canvas/mesh/LineSegments3";
import LineFacesMesh from "../../../../canvas/mesh/LineFacesMesh";

interface IEditorContext {
    file: File | null;
    setFile: (file: File | null) => void;
    cameraMatrix: MutableRefObject<Camera>;
    cameraMatrixChange: (camera: Camera) => void;
    originalModel: Object3D | null;
    graph: Graph;
    line: LineSegments3;
    faces: LineFacesMesh;
    points: Points;
}

interface IEditorContextProvider {
    children: ReactNode;
}

const editorContext = createContext<IEditorContext>({ file: null, setFile: () => { }, cameraMatrix: { current: new Camera() }, cameraMatrixChange: () => { }, originalModel: null, graph: new Graph(), line: new LineSegments3(), faces: new LineFacesMesh(), points: new Points() });

export default function EditorContext({ children }: IEditorContextProvider) {
    // input file
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (inputFile: File | null) => {
        setFile(inputFile);
    };

    // camera
    const cameraMatrixRef = useRef<Camera>(new Camera());

    const handleCameraMatrixChange = (camera: Camera) => {
        cameraMatrixRef.current = camera;
    };

    // model
    const loader = useMemo(() => {
        return new GLTFLoader();
    }, []);

    const [gltf, setGltf] = useState<GLTF>();

    useEffect(() => {
        file?.arrayBuffer().then((buffer) => {
            loader.parse(buffer, '', (gltf) => {
                console.log(gltf);
                setGltf(gltf);
            }, (e) => console.log(e));
        });
    }, [file]);

    const originalModel = useMemo(() => {
        if (!gltf) return null;

        const original = gltf.scene.children[0];

        return original;
    }, [gltf]);


    // graph
    const [graph, setGraph] = useState<Graph>(new Graph());

    useEffect(() => {
        if (!(originalModel instanceof Mesh)) return;

        const newGraph = new Graph();
        newGraph.setVertices(originalModel);
        setGraph(newGraph);

    }, [originalModel]);

    // geometry data;
    const geometryData = useMemo(() => {
        return graph.buildGeometryData();
    }, [graph]);

    // modified model
    const lineMesh = useMemo(() => {
        const line = new LineSegments3();
        line.geometry.setPositions(geometryData.lines.positions);

        const segmentWidthArray = new Float32Array(geometryData.lines.segmentWidth);
        const widthAttribute = new InstancedBufferAttribute(segmentWidthArray, 1);
        line.geometry.setAttribute('segmentWidth', widthAttribute);

        const neighborOneArray = new Float32Array(geometryData.lines.neighborOne);
        const neighborOneAttribute = new InstancedBufferAttribute(neighborOneArray, 4);
        line.geometry.setAttribute('neighborOne', neighborOneAttribute);

        const neighborTwoArray = new Float32Array(geometryData.lines.neighborTwo);
        const neighborTwoAttribute = new InstancedBufferAttribute(neighborTwoArray, 4);
        line.geometry.setAttribute('neighborTwo', neighborTwoAttribute);

        return line;
    }, [geometryData]);

    const facesMesh = useMemo(() => {
        const faces = new LineFacesMesh();

        const verticesArray = new Float32Array(geometryData.faces.positions);
        const positionAttribute = new BufferAttribute(verticesArray, 3);
        faces.geometry.setAttribute("position", positionAttribute);

        const normalsArray = new Float32Array(geometryData.faces.normals);
        const normalsAttribute = new BufferAttribute(normalsArray, 3);
        faces.geometry.setAttribute("aNormal", normalsAttribute);

        const firstNeighbors = new Float32Array(geometryData.faces.firstNeighbors);
        const firstNeighborAttribute = new BufferAttribute(firstNeighbors, 3);
        faces.geometry.setAttribute("aFirstNeighbor", firstNeighborAttribute);

        const secondNeighbors = new Float32Array(geometryData.faces.secondNeighbors);
        const secondNeighborAttribute = new BufferAttribute(secondNeighbors, 3);
        faces.geometry.setAttribute("aSecondNeighbor", secondNeighborAttribute);

        return faces;
    }, [geometryData]);

    // points

    const points = useMemo(() => {
        const pointsMesh = new Points();
        const material = new PointsMaterial({ vertexColors: true });
        pointsMesh.material = material;

        pointsMesh.geometry.setAttribute('position', new Float32BufferAttribute(graph.pointPositionsBuffer, 3));
        return pointsMesh;
    }, [graph]);

    return <editorContext.Provider value={{
        file: file,
        setFile: handleFileChange,
        cameraMatrix: cameraMatrixRef,
        cameraMatrixChange: handleCameraMatrixChange,
        originalModel: originalModel,
        graph: graph,
        line: lineMesh,
        faces: facesMesh,
        points: points
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