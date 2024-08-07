import { MutableRefObject, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { BufferAttribute, Camera, Float32BufferAttribute, InstancedBufferAttribute, Matrix4, Mesh, Object3D, Points, PointsMaterial } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import Graph from "../../../../canvas/graph/Graph";
import LineSegments3 from "../../../../canvas/mesh/LineSegments3";
import LineFacesMesh from "../../../../canvas/mesh/LineFacesMesh";
import FaceWithEdgesMaterial from "../../../../canvas/material/FaceWithEdgesMaterial";
import useDepthBufferScene from "../../../../canvas/hooks/useDepthBufferScene";
import faceNormal from "../../../../canvas/utils/faceNormal";

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
    markEdgesAngle: (angle: number) => void;
}

interface IEditorContextProvider {
    children: ReactNode;
}

const editorContext = createContext<IEditorContext>({ file: null, setFile: () => { }, cameraMatrix: { current: new Camera() }, cameraMatrixChange: () => { }, originalModel: null, graph: new Graph(), line: new LineSegments3(), faces: new LineFacesMesh(), points: new Points(), markEdgesAngle: () => { } });

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
        line.computeLineDistances();

        const segmentWidthArray = new Float32Array(geometryData.lines.segmentWidth);
        const widthAttribute = new InstancedBufferAttribute(segmentWidthArray, 1);
        line.geometry.setAttribute('segmentWidth', widthAttribute);

        const neighborOneArray = new Float32Array(geometryData.lines.neighborOne);
        const neighborOneAttribute = new InstancedBufferAttribute(neighborOneArray, 4);
        line.geometry.setAttribute('neighborOne', neighborOneAttribute);

        const neighborTwoArray = new Float32Array(geometryData.lines.neighborTwo);
        const neighborTwoAttribute = new InstancedBufferAttribute(neighborTwoArray, 4);
        line.geometry.setAttribute('neighborTwo', neighborTwoAttribute);

        line.renderOrder = 2;

        return line;
    }, [geometryData]);

    const facesMesh = useMemo(() => {
        const faces = new LineFacesMesh();

        // TODO: remove after test
        //faces.material = new FaceWithEdgesMaterial();

        const verticesArray = new Float32Array(geometryData.faces.positions);
        const positionAttribute = new BufferAttribute(verticesArray, 3);
        faces.geometry.setAttribute("position", positionAttribute);

        const orderArray = new Float32Array(geometryData.faces.vertexOrder);
        const orderAttribute = new BufferAttribute(orderArray, 1);
        faces.geometry.setAttribute("aOrder", orderAttribute);

        // normals not needed when sending both triangle neighbors
        // const normalsArray = new Float32Array(geometryData.faces.normals);
        // const normalsAttribute = new BufferAttribute(normalsArray, 3);
        // faces.geometry.setAttribute("aNormal", normalsAttribute);

        const firstNeighbors = new Float32Array(geometryData.faces.firstNeighbors);
        const firstNeighborAttribute = new BufferAttribute(firstNeighbors, 3);
        faces.geometry.setAttribute("aFirstNeighbor", firstNeighborAttribute);

        const secondNeighbors = new Float32Array(geometryData.faces.secondNeighbors);
        const secondNeighborAttribute = new BufferAttribute(secondNeighbors, 3);
        faces.geometry.setAttribute("aSecondNeighbor", secondNeighborAttribute);

        const firstNeighborsTwo = new Float32Array(geometryData.faces.firstNeighborsTwo);
        const firstNeighborTwoAttribute = new BufferAttribute(firstNeighborsTwo, 4);
        faces.geometry.setAttribute("aFirstNeighborTwo", firstNeighborTwoAttribute);

        const secondNeighborsTwo = new Float32Array(geometryData.faces.secondNeighborsTwo);
        const secondNeighborTwoAttribute = new BufferAttribute(secondNeighborsTwo, 4);
        faces.geometry.setAttribute("aSecondNeighborTwo", secondNeighborTwoAttribute);

        faces.renderOrder = 1;

        return faces;
    }, [geometryData]);

    // points

    const points = useMemo(() => {
        const pointsMesh = new Points();
        const material = new PointsMaterial({ vertexColors: true });
        pointsMesh.material = material;

        // make sure that order of points mesh is the same as the order of the Graph
        const positionArray: number[] = [];
        for (const vertex of graph.vertices) {
            positionArray.push(...vertex.position);
        }

        const typedPositionArray = new Float32Array(positionArray);
        const positionAttribute = new BufferAttribute(typedPositionArray, 3);

        pointsMesh.geometry.setAttribute('position', positionAttribute);

        // colors
        const colors: number[] = [];
        for (const vertex of graph.vertices) {
            colors.push(0, 0, 0);
        }
        const typedColors = new Float32Array(colors);
        const colorAttribute = new BufferAttribute(typedColors, 3);
        pointsMesh.geometry.setAttribute('color', colorAttribute);

        return pointsMesh;
    }, [graph]);

    // mark angle in the geometry
    // takes angle in degrees
    const markEdgeAngle = useCallback((thresholdAngle: number) => {

        const segmentWidthAttribute = lineMesh.geometry.getAttribute('segmentWidth');
        const array = segmentWidthAttribute.array;

        let index = 0;
        for (const edge of graph.edges) {
            const [start, end] = edge;
            const commonFaces = start.commonFacesWith(end);

            if (commonFaces.length !== 2) {
                throw new Error('Vertices do not have 2 common faces');
            }

            const normalOne = faceNormal(commonFaces[0]);
            const normalTwo = faceNormal(commonFaces[1]);

            const dotProduct = normalOne.dot(normalTwo);
            // angle from 0 to 180 degrees
            const normalAngle = Math.acos(dotProduct) * 180 / Math.PI;

            if (normalAngle >= thresholdAngle) {
                array[index] = 1.0;
            }

            index += 1;
        }

        segmentWidthAttribute.needsUpdate = true;
    }, [graph, lineMesh]);

    return <editorContext.Provider value={{
        file: file,
        setFile: handleFileChange,
        cameraMatrix: cameraMatrixRef,
        cameraMatrixChange: handleCameraMatrixChange,
        originalModel: originalModel,
        graph: graph,
        line: lineMesh,
        faces: facesMesh,
        points: points,
        markEdgesAngle: markEdgeAngle
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