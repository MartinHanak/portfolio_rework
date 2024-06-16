import { useControls } from "leva";
import { useEffect, useRef } from "react";


import * as THREE from 'three';
import { GPUStatsPanel, GeometryUtils, Line2, LineGeometry, LineMaterial, OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import Stats from 'three/addons/libs/stats.module.js';


export default function Page() {
    const { backgroundColor } = useControls({ backgroundColor: '#2a2727' });
    const container = useRef<HTMLElement | null>(null);

    useEffect(() => {
        // viewport
        let insetWidth = 200;
        let insetHeight = 200;
        let gpuPanel: GPUStatsPanel;
        let stats: Stats;


        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0.0);
        renderer.setAnimationLoop(animate);
        if (container.current)
            container.current.appendChild(renderer.domElement);

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(- 40, 0, 60);

        const camera2 = new THREE.PerspectiveCamera(40, 1, 1, 1000);
        camera2.position.copy(camera.position);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.minDistance = 10;
        controls.maxDistance = 500;

        // Position and THREE.Color Data

        const positions = [];
        const colors = [];

        const points = GeometryUtils.hilbert3D(new THREE.Vector3(0, 0, 0), 20.0, 1, 0, 1, 2, 3, 4, 5, 6, 7);

        const spline = new THREE.CatmullRomCurve3(points);
        const divisions = Math.round(12 * points.length);
        const point = new THREE.Vector3();
        const color = new THREE.Color();

        for (let i = 0, l = divisions; i < l; i++) {

            const t = i / l;

            spline.getPoint(t, point);
            positions.push(point.x, point.y, point.z);

            color.setHSL(t, 1.0, 0.5, THREE.SRGBColorSpace);
            colors.push(color.r, color.g, color.b);

        }


        // Line2 ( LineGeometry, LineMaterial )

        const geometry = new LineGeometry();
        geometry.setPositions(positions);
        geometry.setColors(colors);

        const matLine = new LineMaterial({

            color: 0xffffff,
            linewidth: 5, // in world units with size attenuation, pixels otherwise
            vertexColors: true,

            dashed: false,
            alphaToCoverage: true,

        });

        const line = new Line2(geometry, matLine);
        line.computeLineDistances();
        line.scale.set(1, 1, 1);
        scene.add(line);

        // THREE.Line ( THREE.BufferGeometry, THREE.LineBasicMaterial ) - rendered with gl.LINE_STRIP

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const matLineBasic = new THREE.LineBasicMaterial({ vertexColors: true });
        const matLineDashed = new THREE.LineDashedMaterial({ vertexColors: true, scale: 2, dashSize: 1, gapSize: 1 });

        const line1 = new THREE.Line(geo, matLineBasic);
        line1.computeLineDistances();
        line1.visible = false;
        scene.add(line1);

        //

        window.addEventListener('resize', onWindowResize);
        onWindowResize();

        stats = new Stats();
        document.body.appendChild(stats.dom);

        gpuPanel = new GPUStatsPanel(renderer.getContext());
        stats.addPanel(gpuPanel);
        stats.showPanel(0);

        initGui();


        function animate() {
            // main scene

            renderer.setClearColor(0x000000, 0);

            renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

            controls.update();

            if (!gpuPanel) {
                renderer.render(scene, camera);
            } else {
                gpuPanel.startQuery();
                renderer.render(scene, camera);
                gpuPanel.endQuery();
            }


            // inset scene

            renderer.setClearColor(0x222222, 1);

            renderer.clearDepth(); // important!

            renderer.setScissorTest(true);

            renderer.setScissor(20, 20, insetWidth, insetHeight);

            renderer.setViewport(20, 20, insetWidth, insetHeight);

            camera2.position.copy(camera.position);
            camera2.quaternion.copy(camera.quaternion);

            renderer.render(scene, camera2);

            renderer.setScissorTest(false);

            if (stats)
                stats.update();

        }

        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);

            const insetWidth = window.innerHeight / 4; // square
            const insetHeight = window.innerHeight / 4;

            camera2.aspect = insetWidth / insetHeight;
            camera2.updateProjectionMatrix();

        }

        function initGui() {

            const gui = new GUI();

            const param = {
                'line type': 0,
                'world units': false,
                'width': 5,
                'alphaToCoverage': true,
                'dashed': false,
                'dash scale': 1,
                'dash / gap': 1
            };

            gui.add(param, 'line type', { 'LineGeometry': 0, 'gl.LINE': 1 }).onChange(function (val) {

                switch (val) {

                    case 0:
                        line.visible = true;

                        line1.visible = false;

                        break;

                    case 1:
                        line.visible = false;

                        line1.visible = true;

                        break;

                }

            });

            gui.add(param, 'world units').onChange(function (val) {

                matLine.worldUnits = val;
                matLine.needsUpdate = true;

            });

            gui.add(param, 'width', 1, 10).onChange(function (val) {

                matLine.linewidth = val;

            });

            gui.add(param, 'alphaToCoverage').onChange(function (val) {

                matLine.alphaToCoverage = val;

            });

            gui.add(param, 'dashed').onChange(function (val) {

                matLine.dashed = val;
                line1.material = val ? matLineDashed : matLineBasic;

            });

            gui.add(param, 'dash scale', 0.5, 2, 0.1).onChange(function (val) {

                matLine.dashScale = val;
                matLineDashed.scale = val;

            });

            gui.add(param, 'dash / gap', { '2 : 1': 0, '1 : 1': 1, '1 : 2': 2 }).onChange(function (val) {

                switch (val) {

                    case 0:
                        matLine.dashSize = 2;
                        matLine.gapSize = 1;

                        matLineDashed.dashSize = 2;
                        matLineDashed.gapSize = 1;

                        break;

                    case 1:
                        matLine.dashSize = 1;
                        matLine.gapSize = 1;

                        matLineDashed.dashSize = 1;
                        matLineDashed.gapSize = 1;

                        break;

                    case 2:
                        matLine.dashSize = 1;
                        matLine.gapSize = 2;

                        matLineDashed.dashSize = 1;
                        matLineDashed.gapSize = 2;

                        break;

                }
            });
        }



    }, []);

    return (
        <main ref={container} className="fixed w-screen h-screen overflow-hidden top-0 left-0 flex"
            style={{ backgroundColor: backgroundColor }}>

        </main>
    );
}