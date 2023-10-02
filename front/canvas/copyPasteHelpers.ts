import { Dispatch } from "redux";
import {
  Point,
  TCanvasElementProps
} from "../../../components/Canvas/HardwareCanvas/types";
import {
  IBlock,
  TBlocks,
  TCopiedData,
  TLines,
  TSelectedDestination
} from "../../../redux/automationConfiguration/types";
import {
  handlePasteCopiedData,
  handleUpdateSelectedAutomationDevices,
  handleUpdateSelectedLines
} from "../../../redux/automationConfiguration/slice";

interface TCalculateCopiedBlocksAndLine {
  selectedBlocks: TCanvasElementProps[];
  selectedDestinations: TSelectedDestination[];
  currentBlocks: TBlocks;
  currentVars: TLines;
}

export const calculateCopiedBlocksAndLines = (
  props: TCalculateCopiedBlocksAndLine
) => {
  const { currentBlocks, selectedBlocks, selectedDestinations, currentVars } =
    props;
  // Selected Blocks
  const selectedBlocksConfig = currentBlocks.filter((el) =>
    selectedBlocks.some((selected) => selected.key === el.id)
  );
  // Selected Lines
  const selectedLines = currentVars.filter((line) => {
    const { id: lineId } = line;
    return selectedDestinations.some((selected) => selected.lineId === lineId);
  });
  // Lines which have both destination and source selected
  const fullySelectedLines = selectedLines
    .map((line) => {
      const { destinations, source } = line;

      const isSourceSelected = selectedBlocksConfig.find((block) =>
        source.includes(block.id)
      );

      const filteredDestinations = destinations.filter((destinationObj) => {
        const { destination } = destinationObj;

        const destinationInSelectedBlocks = selectedBlocksConfig.find((block) =>
          destination.includes(block.id)
        );

        return destinationInSelectedBlocks && isSourceSelected;
      });

      return {
        ...line,
        destinations: filteredDestinations
      };
    })
    .filter((line) => line.destinations.length);

  const data = {
    blocks: selectedBlocksConfig,
    vars: fullySelectedLines
  };
  return data;
};

type TCalculatePastedBlocksAndLinesProps = {
  copiedData: TCopiedData;
  mousePos: Point;
  allTabsBlocks: TBlocks;
  dispatch: Dispatch;
};

export const calculatePastedBlocksAndLines = (
  props: TCalculatePastedBlocksAndLinesProps
) => {
  const { copiedData, mousePos, allTabsBlocks, dispatch } = props;
  const { maxX, maxY, minX, minY } = calculateBoundingBoxOfCopiedBlocks(
    copiedData.blocks
  );
  const centerOfBoundingBox = {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  };

  const offsetBetweenCursorAndCenter = {
    offsetX: mousePos.x - centerOfBoundingBox.centerX,
    offsetY: mousePos.y - centerOfBoundingBox.centerY
  };

  const idMap: { [key: string]: string } = {};

  const updatedBlocks = copiedData.blocks.map((block) => {
    const newX = block.ui.x + offsetBetweenCursorAndCenter.offsetX;
    const newY = block.ui.y + offsetBetweenCursorAndCenter.offsetY;

    const newId = calculateUniquePastedDeviceId(allTabsBlocks, block, idMap);
    const inputs = block?.inputs?.map((input) => ({
      ...input,
      id: `${newId}|${input.name}`
    }));
    const outputs = block?.outputs?.map((output) => ({
      ...output,
      id: `${newId}|${output.name}`
    }));

    if (newId) {
      return {
        ...block,
        id: newId,
        ui: {
          ...block.ui,
          key: newId,
          x: newX,
          y: newY
        },
        inputs,
        outputs
      };
    }
    return block;
  });
  const updatedVars = copiedData.vars.map((line) => {
    const sourceParts = line.source.split("|");
    const currentSourceBlock = `${sourceParts[0]}|${sourceParts[1]}`;
    const updatedSource = `${idMap[currentSourceBlock]}|${sourceParts[2]}`;
    const updatedId = `var_${updatedSource}`;

    const updatedDestinations = line.destinations.map((dest) => {
      const destinationParts = dest.destination.split("|");
      const currentDestinationId = `${destinationParts[0]}|${destinationParts[1]}`;
      const updatedDestinationId = `${idMap[currentDestinationId]}|${destinationParts[2]}`;
      const updatedLine = dest.line.map((line, index) => {
        const updatedSegmentId = `${updatedDestinationId}_${updatedSource}_seg_${index}`;
        return {
          ...line,
          id: updatedSegmentId,
          x1: line.x1 + offsetBetweenCursorAndCenter.offsetX,
          x2: line.x2 + offsetBetweenCursorAndCenter.offsetX,
          y1: line.y1 + offsetBetweenCursorAndCenter.offsetY,
          y2: line.y2 + offsetBetweenCursorAndCenter.offsetY
        };
      });
      return {
        ...dest,
        line: updatedLine,
        destination: updatedDestinationId
      };
    });
    return {
      ...line,
      destinations: updatedDestinations,
      id: updatedId,
      source: updatedSource
    };
  });

  dispatch(
    handleUpdateSelectedAutomationDevices({
      isSelection: true,
      selectionOfDevices: updatedBlocks.map((block) => block.ui)
    })
  );
  dispatch(
    handleUpdateSelectedLines(
      updatedVars.map((line) => {
        return {
          lineId: line.id,
          source: line.source,
          destination: line.destinations[0].destination,
          line: line.destinations[0].line
        };
      })
    )
  );

  dispatch(
    handlePasteCopiedData({
      blocks: updatedBlocks,
      vars: updatedVars
    })
  );
};

export const calculateBoundingBoxOfCopiedBlocks = (blocks: TBlocks) => {
  let minX = blocks[0].ui.x;
  let minY = blocks[0].ui.y;
  let maxX = blocks[0].ui.x;
  let maxY = blocks[0].ui.y;

  blocks.forEach((block) => {
    minX = Math.min(minX, block.ui.x);
    minY = Math.min(minY, block.ui.y);
    maxX = Math.max(maxX, block.ui.x + block.ui.width);
    maxY = Math.max(maxY, block.ui.y + block.ui.height);
  });

  return {
    minX,
    minY,
    maxX,
    maxY
  };
};

export const calculateUniquePastedDeviceId = (
  blocks: TBlocks,
  block: IBlock,
  idMap: { [key: string]: string }
) => {
  if (idMap[block.id]) {
    return idMap[block.id];
  }

  const blockType = block.block_type;
  const blockNameDevices = blocks.filter((b) => b.block_type === blockType);

  const newBlockNameDevices = Object.values(idMap).filter(
    (id) => id.split("|")[0] === blockType
  );

  const existingCounts = [
    ...blockNameDevices.map((b) => {
      const [, number] = b.id.split("|");
      return parseInt(number);
    }),
    ...newBlockNameDevices.map((id) => {
      const [, number] = id.split("|");
      return parseInt(number);
    })
  ];

  const newCount = Math.max(0, ...existingCounts) + 1;
  const newId = `${blockType}|${newCount}`;

  idMap[block.id] = newId;
  return newId;
};
