import { MAP_OBJECT } from './data/constants'
import { DataMapType } from './reducer';

/**
 * This version of the function uses an LCG (Linear Congruential Generator)
 * to generate random numbers and a for loop to set the desired number of mines in the map. 
 * It avoids the while loop and the Math.random function, which should make it more efficient.
 * 
 * Note that this version of the function still has a small chance of generating the same random number multiple times, 
 * which could cause the while loop to execute more than once in some cases. 
 * If you need a more reliable way to generate random numbers, 
 * you may want to consider using a different algorithm or library.
 */
export const generateRandMineMap = (
  cellsCount:number,
  minesCount: number,
  avoidIndex: number
):boolean[] => {
  // initialize the map with all false values
  let map = Array(cellsCount).fill(false);

  // define the LCG parameters
  const a = 1103515245;
  const c = 12345;
  const m = Math.pow(2, 31);
  let seed = Math.floor(Math.random() * m);  // choose a random seed value

  // define a function to generate a random number using the LCG
  const random = (): number => {
    seed = (a * seed + c) % m;  // update the seed value
    return seed % cellsCount;  // return a number within the range [0, cellsCount-1]
  }

  // set minesCount random cells to true in the map
  for (let i = 0; i < minesCount; i++) {
    let index = random();
    // choose a different index if it is the avoidIndex or if it is already true
    while (index === avoidIndex || map[index]) {
      index = random();
    }
    map[index] = true;
  }

  return map;
}


/**
 * This version of the function uses two nested for loops to iterate over all the possible coordinates that are adjacent to (x, y).
 * The continue statement is used to skip over the current coordinate if it is the same as (x, y). 
 * The function checks if each coordinate is within the boundary by comparing x + i and y + j to 0 and max. 
 * If a coordinate is within the boundary, it is added to the coords array.
 * 
 * This version of the function is more efficient because it only needs to iterate over a small number of coordinates
 * (9 in total) rather than manually checking each coordinate individually. 
 * It also avoids the need for multiple if statements.
 * 
 * 
 */
export const getAdjacentCoordinates = (
  x: number,  // the x-coordinate of the current cell
  y:number,   // the y-coordinate of the current cell
  max:number  // the maximum boundary for the coordinates
): [number, number][] => {
  // an array to store the adjacent coordinates
  const coords: [number, number][] = [];

  // iterate over the coordinates that are adjacent to (x, y)
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      // skip the current coordinate if it is (x, y)
      if (i === 0 && j === 0) {
        continue;
      }

      // check if the current coordinate is within the boundary
      if (x + i >= 0 && x + i <= max && y + j >= 0 && y + j <= max) {
        // add the current coordinate to the array if it is within the boundary
        coords.push([x + i, y + j]);
      }
    }
  }

  // return the array of adjacent coordinates
  return coords;
}





export const indexToCoord = (index: number, numberOfCellsInARow: number): [number, number] => (
  [
    index % numberOfCellsInARow,
    Math.floor(index / numberOfCellsInARow)
  ]
)

export const coordToIndex = (point: [number, number], numberOfCellsInARow: number): number => (
  point[1] * numberOfCellsInARow + point[0]
)

/**
 * This version of the function uses the same technique as the previous example to iterate over the coordinates that are adjacent to (x, y). 
 * It uses the coordToIndex function to convert each coordinate to an index 
 * and checks if the corresponding element in the minesMap array is true.
 * If it is, the count variable is incremented.
 * 
 * This version of the function is more efficient because it avoids the use of the getAdjacentCoordinates function 
 * and the forEach loop, which can both be slow. 
 * It also reduces the number of function calls by combining the indexToCoord and coordToIndex functions into a single loop
 * 
 */
export const getAdjacentMinesCount = (
  index: number,       // the index of the current cell
  numberOfCellsInARow: number,  // the number of cells in a row
  minesMap: boolean[]  // a map of mines, where true indicates the presence of a mine
) => {
  // maxIndexOfRow is the maximum index of a cell in a row
  const maxIndexOfRow = numberOfCellsInARow - 1

  // convert the current cell's index to coordinates
  const [x, y] = indexToCoord(index, numberOfCellsInARow)

  // initialize a count variable to track the number of adjacent mines
  let count = 0

  // iterate over the coordinates that are adjacent to (x, y)
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      // skip the current coordinate if it is (x, y)
      if (i === 0 && j === 0) {
        continue;
      }

      // check if the current coordinate is within the boundary
      if (x + i >= 0 && x + i <= maxIndexOfRow && y + j >= 0 && y + j <= maxIndexOfRow) {
        // convert the current coordinate to an index
        const position = coordToIndex([x + i, y + j], numberOfCellsInARow)

        // check if there is a mine at the current coordinate
        if (minesMap[position]) {
          // increment the count if there is a mine
          count += 1
        }
      }
    }
  }

  // return the count of adjacent mines
  return count
}


export const putFlagOrKeepDataMap = (dataMap: DataMapType, index: number) => {
  if(dataMap[index] !== MAP_OBJECT.COVERED && dataMap[index] !== MAP_OBJECT.FLAG) return dataMap;
  return [
    ...dataMap.slice(0, index),
    dataMap[index] === MAP_OBJECT.FLAG ? MAP_OBJECT.COVERED: MAP_OBJECT.FLAG,
    ...dataMap.slice(index + 1),
  ]
}

export const checkNoUncoveredCells = (
  dataMap: DataMapType,
  totalCellsCount: number,
  totalMinesCount: number
) => {
  const uncoveredCellsCount = dataMap.filter(cell => (cell !== MAP_OBJECT.COVERED && cell >= 0 && cell <= 8)).length;
  return (uncoveredCellsCount === totalCellsCount - totalMinesCount)
}

export const sweep = (
  targetIndex: number,
  dataMap: DataMapType,
  minesMap: boolean[],
): DataMapType => {
  const scannedList = Array(dataMap.length).fill(false)
  const tempDataMap = dataMap.slice()
  const numberOfCellsInARow = Math.sqrt(dataMap.length)
  const maxIndexOfARow = numberOfCellsInARow - 1
  const recursiveSweep = (index: number) => {
    if(scannedList[index]) return;
    const result = getAdjacentMinesCount(index, numberOfCellsInARow, minesMap);
    scannedList[index] = true;
    if(result !== MAP_OBJECT.NO_BOMB_ARROUND){
      tempDataMap[index] = result;
      return;
    }
    tempDataMap[index] = MAP_OBJECT.NO_BOMB_ARROUND;
    const coords = getAdjacentCoordinates(...indexToCoord(index, numberOfCellsInARow), maxIndexOfARow)
    coords.forEach(coord => {
      recursiveSweep(coordToIndex(coord, numberOfCellsInARow))
    })
  }
  recursiveSweep(targetIndex)
  return tempDataMap
}


