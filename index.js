const dftValues = {
  blockSize: 50,
  maxHeight: 10,
  minLength: 4,
  maxLength: 15,
  heights: [4, 0, 3, 3, 0, 4],
};

// On load
$(function () {
  const heights = dftValues.heights;
  $("#heights").text(heights);
  rainPool(heights);
});

// On click a new array set is generated
$("#btn-generate").click(function () {
  const heights = generateRandomIntArray();
  $("#heights").text(heights);
  rainPool(heights);
});

// Generates an array of positive integers
const generateRandomIntArray = function () {
  const lengthDelta = dftValues.maxLength - dftValues.minLength;
  const nLength = dftValues.minLength + parseInt(lengthDelta * Math.random());
  const heights = [];
  for (let i = 0; i < nLength; i++) {
    heights.push(parseInt(dftValues.maxHeight * Math.pow(Math.random(), 2)));
  }
  return heights;
};

// Creates matrix with 1s and 0s
const rainPool = function (heights) {
  // Checking levels horizontally = the highest value
  const nLevels = Math.max(...heights);
  const levels = [];

  // Creating matrix of arrays. Number of arrays = levels
  for (i = 0; i < nLevels; i++) {
    levels[i] = [];
  }

  // Populating 'level' arrays with 1s if are block cells, otherwise with 0s
  heights.forEach((height) => {
    levels.forEach((level, index) => {
      const value = height > index ? 1 : 0;
      const cell = { blockCell: value, waterCell: 0 };
      level.push(cell);
    });
  });

  let waterCells = 0;
  // Counting and marking the water cells by looping the levels
  levels.forEach((level) => {
    let block = false;
    let emptyCells = 0;
    level.forEach((cell, index) => {
      if (cell.blockCell === 1) {
        if (emptyCells > 0) {
          waterCells += emptyCells;
          let start = index - emptyCells;
          for (i = start; i < index; i++) {
            level[i].waterCell = 1;
          }
          emptyCells = 0;
        }
        block = true;
      } else if (cell.blockCell === 0) {
        if (block) emptyCells++;
      }
    });
  });

  $("#accumulated-water").text(waterCells);
  renderGraph(levels);
};

// Renders the output graph
const renderGraph = function (levels) {
  const graph = new joint.dia.Graph();
  const blockSize = dftValues.blockSize;
  const graphHeight = 500;

  const paper = new joint.dia.Paper({
    el: document.getElementById("paper"),
    model: graph,
    width: dftValues.blockSize * dftValues.maxLength + 150,
    height: dftValues.blockSize * dftValues.maxHeight + 150,
    gridSize: blockSize,
    interactive: false,
  });

  drawPlane(graph);

  drawCoordinates(graph);

  // Solid block shape
  const block = new joint.shapes.standard.Rectangle();
  block.resize(blockSize, blockSize);
  block.attr({ body: { fill: "grey", strokeWidth: 2 } });

  // Water block shape
  const water = new joint.shapes.standard.Rectangle();
  water.resize(blockSize, blockSize);
  water.attr({ body: { fill: "#80BDE3", strokeWidth: 2 } });

  // Looping through levels and blocks
  let xOffset = 50;
  let yOffset = 0;

  levels.forEach((level, levelIndex) => {
    yOffset = graphHeight - blockSize * (levelIndex + 1);
    level.forEach((cell, cellIndex) => {
      let newBlock;
      if (cell.blockCell === 1) {
        newBlock = block.clone();
        newBlock.translate(xOffset + blockSize * cellIndex, yOffset + 100);
      } else if (cell.waterCell === 1) {
        newBlock = water.clone();
        newBlock.position(xOffset + blockSize * cellIndex, -100);
        newBlock.transition(
          "position",
          { x: xOffset + blockSize * cellIndex, y: yOffset + 100 },
          {
            delay: 50,
            duration: 1500,
            valueFunction: joint.util.interpolate.object,
          }
        );
      } else {
        return;
      }
      newBlock.addTo(graph);
    });
  });
};

// Draws plane axis
const drawPlane = function (graph) {
  const ptOrigin = new joint.shapes.standard.Circle();
  ptOrigin.position(50, 600);
  ptOrigin.resize(0, 0);
  ptOrigin.addTo(graph);

  const pnY = ptOrigin.clone();
  pnY.translate(0, -1 * (dftValues.maxHeight + 1) * dftValues.blockSize);
  pnY.addTo(graph);

  const axisY = new joint.shapes.standard.Link();
  axisY.source(ptOrigin);
  axisY.target(pnY);
  axisY.addTo(graph);

  const pnX = ptOrigin.clone();
  pnX.translate((dftValues.maxLength + 1) * dftValues.blockSize, 0);
  pnX.addTo(graph);

  const axisX = axisY.clone();
  axisX.target(pnX);
  axisX.addTo(graph);
};

// Draws coordinates on the plane
const drawCoordinates = function (graph) {
  const ptOrigin = new joint.shapes.standard.Rectangle();
  ptOrigin.position(dftValues.blockSize, 615);
  ptOrigin.resize(0, 0);
  ptOrigin.attr({ label: { text: "(0, 0)" } });
  ptOrigin.addTo(graph);

  for (let x = 1; x <= dftValues.maxLength; x++) {
    const point = ptOrigin.clone();
    point.position(dftValues.blockSize + x * dftValues.blockSize, 615);
    point.attr({ label: { text: `${x}` } });
    point.addTo(graph);
  }
  for (let y = 1; y <= dftValues.maxHeight; y++) {
    const point = ptOrigin.clone();
    point.position(40, 600 - dftValues.blockSize * y);
    point.attr({ label: { text: `${y}` } });
    point.addTo(graph);
  }
};
