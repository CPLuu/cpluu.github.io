import { onMount } from "solid-js";
import * as d3 from "d3";
import worldData from "../lib/world.json";

const GlobeComponent = () => {
  let mapContainer: HTMLDivElement | undefined;

  const visitedCountries = [
    "Vietnam",
    "USA",
  ];

  // Country centroids (approx lon, lat) and UTC offset labels
  const countryMarkers: { name: string; lon: number; lat: number; utc: string }[] = [
    { name: "Vietnam", lon: 106.6, lat: 16.0, utc: "UTC+7" },
    { name: "USA", lon: -97.0, lat: 38.0, utc: "UTC−6" },
  ];

  onMount(() => {
    if (!mapContainer) return;

    const width = mapContainer.clientWidth;
    const height = 500;
    const sensitivity = 75;

    let projection = d3
      .geoOrthographic()
      .scale(250)
      .center([0, 0])
      .rotate([0, -30])
      .translate([width / 2, height / 2]);

    const initialScale = projection.scale();
    let pathGenerator = d3.geoPath().projection(projection);

    let svg = d3
      .select(mapContainer)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg
      .append("circle")
      .attr("fill", "#EEE")
      .attr("stroke", "#000")
      .attr("stroke-width", "0.2")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", initialScale);

    let map = svg.append("g");

    map
      .append("g")
      .attr("class", "countries")
      .selectAll("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("d", (d: any) => pathGenerator(d as any))
      .attr("fill", (d: { properties: { name: string } }) =>
        visitedCountries.includes(d.properties.name) ? "#E63946" : "white"
      )
      .style("stroke", "black")
      .style("stroke-width", 0.3)
      .style("opacity", 0.8);

    // UTC marker group
    const markerGroup = svg.append("g").attr("class", "utc-markers");

    const updatePaths = () => {
      svg.selectAll(".countries path").attr("d", (d: any) => pathGenerator(d as any));
      updateMarkers();
    };

    const updateMarkers = () => {
      markerGroup.selectAll("*").remove();

      countryMarkers.forEach((marker) => {
        const coords: [number, number] = [marker.lon, marker.lat];
        const projected = projection(coords);
        if (!projected) return;

        // Check if point is on the visible side of the globe
        const r = projection.rotate();
        const center: [number, number] = [-r[0], -r[1]];
        const distance = d3.geoDistance(coords, center);
        if (distance > Math.PI / 2) return; // behind the globe

        const [x, y] = projected;

        // Leader line dimensions
        const slantDx = 12;
        const slantDy = -18;
        const horizLen = 20;

        const elbowX = x + slantDx;
        const elbowY = y + slantDy;
        const endX = elbowX + horizLen;
        const endY = elbowY;

        // Small dot at the country centroid
        markerGroup
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 3)
          .attr("fill", "#000")
          .attr("stroke", "#000")
          .attr("stroke-width", 0.8);

        // Slant line from dot up to elbow
        markerGroup
          .append("line")
          .attr("x1", x)
          .attr("y1", y - 3)
          .attr("x2", elbowX)
          .attr("y2", elbowY)
          .attr("stroke", "#000")
          .attr("stroke-width", 1);

        // Horizontal line from elbow outward
        markerGroup
          .append("line")
          .attr("x1", elbowX)
          .attr("y1", elbowY)
          .attr("x2", endX)
          .attr("y2", endY)
          .attr("stroke", "#000")
          .attr("stroke-width", 1);

        // UTC label at the end of horizontal line
        markerGroup
          .append("text")
          .attr("x", endX + 3)
          .attr("y", endY + 3)
          .attr("text-anchor", "start")
          .attr("font-size", "10px")
          .attr("font-family", "Satoshi, sans-serif")
          .attr("font-weight", "700")
          .attr("fill", "#000")
          .text(marker.utc);
      });
    };

    // --- Drag / Auto-resume spinning ---
    let isPaused = false;
    let isDragging = false;
    let previousMousePosition: [number, number] | null = null;
    let resumeTimeout: ReturnType<typeof setTimeout> | null = null;

    svg
      .style("cursor", "grab")
      .call(
        d3
          .drag<SVGSVGElement, unknown>()
          .on("start", function (event) {
            isDragging = true;
            isPaused = true;
            previousMousePosition = [event.x, event.y];
            svg.style("cursor", "grabbing");
            if (resumeTimeout) {
              clearTimeout(resumeTimeout);
              resumeTimeout = null;
            }
          })
          .on("drag", function (event) {
            if (previousMousePosition) {
              const rotate = projection.rotate();
              const dx = event.x - previousMousePosition[0];
              const dy = event.y - previousMousePosition[1];
              const k = sensitivity / projection.scale();
              projection.rotate([
                rotate[0] + dx * k,
                Math.max(-90, Math.min(90, rotate[1] - dy * k)),
              ]);
              previousMousePosition = [event.x, event.y];
              updatePaths();
            }
          })
          .on("end", function () {
            isDragging = false;
            previousMousePosition = null;
            svg.style("cursor", "grab");
            // Resume auto-rotation after 1 second
            resumeTimeout = setTimeout(() => {
              isPaused = false;
            }, 1000);
          })
      );

    // Auto-rotation timer — spins by default on page load
    d3.timer(() => {
      if (!isPaused) {
        const rotate = projection.rotate();
        const k = sensitivity / projection.scale();
        projection.rotate([rotate[0] - 1 * k, rotate[1]]);
        updatePaths();
      }
    }, 200);

    // Initial marker render
    updateMarkers();
  });

  return (
    <div class="flex flex-col text-white justify-center items-center w-full h-full">
      <div class="w-full" ref={mapContainer}></div>
    </div>
  );
};

export default GlobeComponent;
