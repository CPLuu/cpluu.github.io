import { onCleanup, onMount } from "solid-js";

// 18 rows total with 7-row tall characters for better legibility
const textRows = 7;
const spacingRows = 4;
const rows = textRows * 2 + spacingRows; // 18
const columns = 34;
const transitionDuration = 250;

const getIndicesForText = (): number[] => {
  const charPixels: [number, number][] = [];

  const addChar = (pixels: [number, number][], offsetCol: number, rowOffset: number = 0) => {
    pixels.forEach(([r, c]) => {
      charPixels.push([r + rowOffset, c + offsetCol]);
    });
  };

  // ---- TOP ROW: "OVER &" (7 rows tall, centered in 33 cols) ----
  // Width: O(4)+1+V(4)+1+E(4)+1+R(4)+2+&(5) = 26
  // Center offset: floor((34 - 26) / 2) = 4
  const topStart = 4;

  // O (4 wide, 7 tall)
  addChar([
    [0,1],[0,2],
    [1,0],[1,3],
    [2,0],[2,3],
    [3,0],[3,3],
    [4,0],[4,3],
    [5,0],[5,3],
    [6,1],[6,2],
  ], topStart + 0, 0);

  // V (4 wide, 7 tall)
  addChar([
    [0,0],[0,3],
    [1,0],[1,3],
    [2,0],[2,3],
    [3,0],[3,3],
    [4,0],[4,3],
    [5,1],[5,2],
    [6,1],[6,2],
  ], topStart + 5, 0);

  // E (4 wide, 7 tall)
  addChar([
    [0,0],[0,1],[0,2],[0,3],
    [1,0],
    [2,0],
    [3,0],[3,1],[3,2],
    [4,0],
    [5,0],
    [6,0],[6,1],[6,2],[6,3],
  ], topStart + 10, 0);

  // R (4 wide, 7 tall)
  addChar([
    [0,0],[0,1],[0,2],
    [1,0],[1,3],
    [2,0],[2,3],
    [3,0],[3,1],[3,2],
    [4,0],[4,3],
    [5,0],[5,3],
    [6,0],[6,3],
  ], topStart + 15, 0);

  // & (5 wide, 7 tall)
  addChar([
    [0,1],[0,2],
    [1,0],[1,3],
    [2,1],[2,2],
    [3,0],[3,1],
    [4,0],[4,3],[4,4],
    [5,0],[5,3],
    [6,1],[6,2],[6,4],
  ], topStart + 21, 0);

  // ---- BOTTOM ROW: "BEYOND!" (7 rows tall, centered in 33 cols) ----
  // Width: B(4)+1+E(4)+1+Y(4)+1+O(4)+1+N(4)+1+D(4)+1+!(1) = 30
  // Center offset: floor((34 - 30) / 2) = 2
  const botStart = 2;
  const bot = textRows + spacingRows; // row 11

  // B (4 wide, 7 tall)
  addChar([
    [0,0],[0,1],[0,2],
    [1,0],[1,3],
    [2,0],[2,3],
    [3,0],[3,1],[3,2],
    [4,0],[4,3],
    [5,0],[5,3],
    [6,0],[6,1],[6,2],
  ], botStart + 0, bot);

  // E (4 wide, 7 tall)
  addChar([
    [0,0],[0,1],[0,2],[0,3],
    [1,0],
    [2,0],
    [3,0],[3,1],[3,2],
    [4,0],
    [5,0],
    [6,0],[6,1],[6,2],[6,3],
  ], botStart + 5, bot);

  // Y (4 wide, 7 tall)
  addChar([
    [0,0],[0,3],
    [1,0],[1,3],
    [2,1],[2,2],
    [3,1],[3,2],
    [4,1],[4,2],
    [5,1],[5,2],
    [6,1],[6,2],
  ], botStart + 10, bot);

  // O (4 wide, 7 tall)
  addChar([
    [0,1],[0,2],
    [1,0],[1,3],
    [2,0],[2,3],
    [3,0],[3,3],
    [4,0],[4,3],
    [5,0],[5,3],
    [6,1],[6,2],
  ], botStart + 15, bot);

  // N (4 wide, 7 tall)
  addChar([
    [0,0],[0,3],
    [1,0],[1,1],[1,3],
    [2,0],[2,1],[2,3],
    [3,0],[3,2],[3,3],
    [4,0],[4,2],[4,3],
    [5,0],[5,3],
    [6,0],[6,3],
  ], botStart + 20, bot);

  // D (4 wide, 7 tall)
  addChar([
    [0,0],[0,1],[0,2],
    [1,0],[1,3],
    [2,0],[2,3],
    [3,0],[3,3],
    [4,0],[4,3],
    [5,0],[5,3],
    [6,0],[6,1],[6,2],
  ], botStart + 25, bot);

  // ! (1 wide, 7 tall)
  addChar([
    [0,0],
    [1,0],
    [2,0],
    [3,0],
    [4,0],
    [6,0],
  ], botStart + 29, bot);

  return charPixels
    .filter(([r, c]) => r >= 0 && r < rows && c >= 0 && c < columns)
    .map(([r, c]) => r * columns + c);
};

const textIndicesSet = new Set(getIndicesForText());
const states = ["medium", "high"];

const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Pre-compute random jiggle offsets for each neuron
const totalCells = columns * rows;
const jiggleOffsets: { x: number; y: number }[] = [];
for (let i = 0; i < totalCells; i++) {
  jiggleOffsets.push({
    x: (Math.random() - 0.5) * 4,
    y: (Math.random() - 0.5) * 4,
  });
}

// Random dim red hue variance for "off" background neurons
const dimHues: string[] = [];
for (let i = 0; i < totalCells; i++) {
  const lightness = 22 + Math.random() * 12;
  const saturation = 50 + Math.random() * 30;
  dimHues.push(`hsl(0, ${saturation}%, ${lightness}%)`);
}

// Randomly hide 40% of background neurons
const hiddenBg = new Set<number>();
for (let i = 0; i < totalCells; i++) {
  if (!textIndicesSet.has(i) && Math.random() < 0.7) {
    hiddenBg.add(i);
  }
}

const GlowingStarsBanner = () => {
  let ref: HTMLDivElement;

  onMount(() => {
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];

    const allIndices = Array.from({ length: totalCells }, (_, i) => i);

    const interval = setInterval(() => {
      // Animate text neurons
      textIndicesSet.forEach((index) => {
        const light = ref.querySelector<HTMLDivElement>(
          `[data-index="${index}"]`
        );

        if (!light) return;

        const nextState = states[Math.floor(Math.random() * states.length)];
        const currentState = light.dataset.state;

        const pulse =
          Math.random() > 0.2 &&
          ((currentState === "off" && nextState === "high") ||
            (currentState === "off" && nextState === "medium") ||
            (currentState === "medium" && nextState === "high"));

        if (pulse) {
          const delay = getRandomNumber(100, 500);

          timeoutIds.push(
            setTimeout(() => {
              light.style.transform = `translate(${jiggleOffsets[index].x}px, ${jiggleOffsets[index].y}px) scale(2.5)`;
            }, delay)
          );

          timeoutIds.push(
            setTimeout(() => {
              light.style.transform = `translate(${jiggleOffsets[index].x}px, ${jiggleOffsets[index].y}px) scale(1)`;
            }, transitionDuration + delay)
          );
        }

        if (currentState === "high" && nextState === "medium" && pulse) {
          light.dataset.state = "off";
        } else {
          light.dataset.state = nextState;
        }
      });

      // Occasionally fire background neurons
      const bgCount = getRandomNumber(3, 10);
      for (let i = 0; i < bgCount; i++) {
        const idx = allIndices[Math.floor(Math.random() * allIndices.length)];
        if (textIndicesSet.has(idx)) continue;

        const light = ref.querySelector<HTMLDivElement>(
          `[data-index="${idx}"]`
        );
        if (!light) continue;

        const delay = getRandomNumber(50, 800);
        timeoutIds.push(
          setTimeout(() => {
            light.dataset.state = "bg-pulse";
            light.style.transform = `translate(${jiggleOffsets[idx].x}px, ${jiggleOffsets[idx].y}px) scale(1.8)`;
          }, delay)
        );
        timeoutIds.push(
          setTimeout(() => {
            light.dataset.state = "off";
            light.style.transform = `translate(${jiggleOffsets[idx].x}px, ${jiggleOffsets[idx].y}px) scale(1)`;
          }, delay + 400)
        );
      }
    }, 2500);

    onCleanup(() => {
      clearInterval(interval);
      timeoutIds.forEach(clearTimeout);
    });
  });

  return (
    <div
      ref={(el) => (ref = el!)}
      class="switchboard"
      style={{
        display: "grid",
        gap: "6px",
        "grid-template-columns": `repeat(${columns}, 1fr)`,
        width: "100%",
      }}
    >
      {Array.from({ length: totalCells }).map((_, i) => {
        const isText = textIndicesSet.has(i);
        const isHidden = hiddenBg.has(i);
        return (
          <div
            class={`star ${isText ? "star-text" : "star-bg"}`}
            data-state="off"
            data-index={i}
            style={{
              "--transition-duration": `${transitionDuration}ms`,
              transform: `translate(${jiggleOffsets[i].x}px, ${jiggleOffsets[i].y}px)`,
              "background-color": isText ? undefined : dimHues[i],
              visibility: isHidden ? "hidden" : undefined,
            }}
          />
        );
      })}
    </div>
  );
};

export default GlowingStarsBanner;
