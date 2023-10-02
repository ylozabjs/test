import React, { useEffect } from "react";
import {
  Point,
  TCanvasElementProps
} from "../../components/Canvas/HardwareCanvas/types";
import {
  TBlocks,
  TCopiedData,
  TLines,
  TSelectedDestination
} from "../../redux/automationConfiguration/types";
import { useAppDispatch } from "../../redux/store";
import {
  handleDeleteSelectedElements,
  handleUpdateCopiedData
} from "../../redux/automationConfiguration/slice";
import {
  calculateCopiedBlocksAndLines,
  calculatePastedBlocksAndLines
} from "../../utils/canvas/hooksHelpers/copyPasteHelpers";

export type TUseCopyPasteProps = {
  selectedBlocks: React.MutableRefObject<TCanvasElementProps[]>;
  selectedDestinations: React.MutableRefObject<TSelectedDestination[]>;
  currentBlocks: TBlocks;
  currentVars: TLines;
  copiedData: TCopiedData | null;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  context: CanvasRenderingContext2D | null;
  scale: number;
  mousePos: Point;
  allTabsBlocks: TBlocks;
  selectedAutomationDevices: TCanvasElementProps[];
  selectedLines: TSelectedDestination[];
};

const useCopyPaste = (props: TUseCopyPasteProps) => {
  const {
    selectedBlocks,
    selectedDestinations,
    currentBlocks,
    currentVars,
    copiedData,
    mousePos,
    allTabsBlocks,
    selectedAutomationDevices,
    selectedLines
  } = props;
  const dispatch = useAppDispatch();

  // When pasting elements update selected elements locally and globally
  useEffect(() => {
    selectedBlocks.current = selectedAutomationDevices;
    selectedDestinations.current = selectedLines;
  }, [
    selectedAutomationDevices,
    selectedBlocks,
    selectedDestinations,
    selectedLines
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.code) {
          case "KeyX":
            if (selectedBlocks.current.length) {
              const data = calculateCopiedBlocksAndLines({
                currentBlocks,
                currentVars,
                selectedBlocks: selectedBlocks.current,
                selectedDestinations: selectedDestinations.current
              });
              dispatch(handleUpdateCopiedData(data));
              dispatch(handleDeleteSelectedElements());
            }
            break;
          case "KeyC":
            if (selectedBlocks.current.length) {
              const data = calculateCopiedBlocksAndLines({
                currentBlocks,
                currentVars,
                selectedBlocks: selectedBlocks.current,
                selectedDestinations: selectedDestinations.current
              });
              dispatch(handleUpdateCopiedData(data));
            }
            break;
          case "KeyV":
            if (copiedData?.blocks.length) {
              calculatePastedBlocksAndLines({
                allTabsBlocks,
                copiedData,
                dispatch,
                mousePos
              });
            }
            break;
          default:
            break;
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    allTabsBlocks,
    copiedData,
    currentBlocks,
    currentVars,
    dispatch,
    mousePos,
    mousePos.x,
    mousePos.y,
    selectedBlocks,
    selectedDestinations
  ]);
};

export default useCopyPaste;
