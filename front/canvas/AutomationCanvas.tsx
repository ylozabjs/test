import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  memo
} from "react";
import {
  isConvertButtonShowed,
  selectActiveTab,
  selectAddConnectButtonInfo,
  selectAllAutomationBlocks,
  selectAllAutomationLines,
  selectAllAutomationLineVariables,
  selectAutomationDevicesImages,
  selectAutomationHistoryIndex,
  selectAutomationOnlineMode,
  selectAutomationOnlineVariables,
  selectConvertButtonInfo,
  selectCopiedData,
  selectCurrentAutomationTab,
  selectCurrentAutomationTabElements,
  selectHoveredActionButton,
  selectHoveredElement,
  selectHoveredLine,
  selectIsAddButtonShowed,
  selectIsAutomationConfigChanged,
  selectIsAutomationDeploying,
  selectIsDrawerOpen,
  selectLastDeviceAlign,
  selectSelectedAutomationDevices,
  selectSelectedAutomationLines,
  selectSelectedElement,
  selectSelectedLine,
  selectTooltipInfo,
  selectTransferredElement
} from "../../../redux/automationConfiguration/selectors";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import {
  addPoints,
  diffPoints,
  scalePoint
} from "../../../utils/canvas/pointsCount";
import { zoom } from "../../../utils/canvas/zoom";
import { TAutomationCanvasProps, TDraggedLine, TSelectionArea } from "./types";
import { Point, TCanvasElementProps } from "../HardwareCanvas/types";
import { drawConnectionLine } from "../../../utils/canvas/lineHelpers";
import { drawAutomationElements } from "../../../utils/canvas/automation-logic/drawAutomationElements";
import { useCanvasDrop } from "../../../hooks/automation/useCanvasDrop";
import useClickAndHover from "../../../hooks/automation/useClickAndHover";
import useDragAndDrop from "../../../hooks/automation/useDragAndDrop";
import AutomationCanvasContainer from "./AutomationCanvasContainer";
import { useDeviceDeletion } from "../../../hooks/automation/useDeviceDeletion";
import {
  cleanUpDeletedElements,
  updateDeprecatedXY
} from "../../../utils/canvas/helpersCanvas";
import {
  TBlocks,
  TLines,
  TSelectedDestination
} from "../../../redux/automationConfiguration/types";
import debounce from "lodash.debounce";
import { throttle } from "../../../utils/canvas/throttle";
import { useFilteredOnlineVariableStatuses } from "../../../hooks/automation/useFilterOnlineVarStatuses";
import useCopyPaste from "../../../hooks/automation/useCopyPaste";
import useSaveTabSettings from "../../../hooks/automation/useSaveTabSettings";
import {
  SIDEBAR_WIDTH,
  TOP_PANEL_HEIGHT
} from "../../../models/core.constants";

const { devicePixelRatio: ratio = 1 } = window;
const fullHeight = window.innerHeight - TOP_PANEL_HEIGHT;
const fullWidth = window.innerWidth - SIDEBAR_WIDTH;

const AutomationCanvas: React.FC<TAutomationCanvasProps> = ({
  context,
  setContext,
  offset,
  scale,
  setOffset,
  setScale,
  setViewportTopLeft,
  viewportTopLeft,
  canvasRef,
  isResetRef,
  lastMousePosRef,
  lastOffsetRef,
  ORIGIN,
  index,
  handleDeploy,
  handleOnlineMode
}) => {
  const dispatch = useAppDispatch();

  const isAutomationConfigChanged = useAppSelector(
    selectIsAutomationConfigChanged
  );
  const isDrawerOpen = useAppSelector(selectIsDrawerOpen);
  const isOnline = useAppSelector(selectAutomationOnlineMode);
  const activeTab = useAppSelector(selectActiveTab);
  const hoveredElement = useAppSelector(selectHoveredElement);
  const selectedElement = useAppSelector(selectSelectedElement);
  const hoveredLine = useAppSelector(selectHoveredLine);
  const selectedLine = useAppSelector(selectSelectedLine);
  const selectedAutomationDevices = useAppSelector(
    selectSelectedAutomationDevices
  );
  const hoveredActionButton = useAppSelector(selectHoveredActionButton);
  const selectedLines = useAppSelector(selectSelectedAutomationLines);
  const tooltipInfo = useAppSelector(selectTooltipInfo);
  const transferredElement = useAppSelector(selectTransferredElement);
  const historyIndex = useAppSelector(selectAutomationHistoryIndex);
  const onlineVariablesStatus = useAppSelector(selectAutomationOnlineVariables);
  const currentTabIndex = Number(activeTab) - 1;
  const lastDeviceAlign = useAppSelector(selectLastDeviceAlign);
  const isAddConnectButtonShowed = useAppSelector(selectIsAddButtonShowed);
  const addConnectButtonInfo = useAppSelector(selectAddConnectButtonInfo);
  const convertButtonInfo = useAppSelector(selectConvertButtonInfo);
  const isConvertShowed = useAppSelector(isConvertButtonShowed);
  const copiedData = useAppSelector(selectCopiedData);
  const isDeploying = useAppSelector(selectIsAutomationDeploying)
  const currentTab = useAppSelector((state) =>
    selectCurrentAutomationTab(state, currentTabIndex)
  );
  const allTabsLines = useAppSelector((state) =>
    selectAllAutomationLines(state)
  );
  const elements = useAppSelector((state) =>
    selectCurrentAutomationTabElements(state, currentTabIndex)
  );
  const deviceImages = useAppSelector((state) =>
    selectAutomationDevicesImages(state, currentTabIndex)
  );
  const variablesLines = useAppSelector((state) =>
    selectAllAutomationLineVariables(state)
  );
  const allTabsBlocks = useAppSelector((state) =>
    selectAllAutomationBlocks(state)
  );

  const [cleanUp, setCleanUp] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [mousePos, setMousePos] = useState(ORIGIN);
  const [draggedElement, setDraggedElement] =
    useState<TCanvasElementProps | null>(null);
  const [connectStartElement, setConnectStartElement] =
    useState<TCanvasElementProps | null>(null);
  const [draggedLine, setDraggedLine] = useState<TDraggedLine>({
    line: null,
    segment: null
  });
  const [currentBlocks, setCurrentBlocks] = useState<TBlocks>([]);
  const [currentVars, setCurrentVars] = useState<TLines>([]);
  const [selectionArea, setSelectionArea] = useState<TSelectionArea>({
    initial: null,
    current: null
  });

  const selectedBlocks = useRef<TCanvasElementProps[]>([]);
  const selectedDestinations = useRef<TSelectedDestination[]>([]);
  const canvasElements = useRef<TCanvasElementProps[]>(
    [...(elements as TCanvasElementProps[])] || []
  );
  const startElementMousePosition = useRef<Point>(ORIGIN);
  const startLineMousePosition = useRef<Point>(ORIGIN);
  const lastHoveredElement = useRef<TCanvasElementProps | null>(null);
  const connectStart = useRef<Point>(ORIGIN);
  const connectEnd = useRef<Point>(ORIGIN);
  const lastAlignRef = useRef<string | null>(null);
  const isPanning = useRef<boolean>(false);
  const isDrag = useRef<boolean>(false);
  const canvasGridRef = useRef<HTMLCanvasElement | null>(null);

  const filteredOnlineVariableStatuses = useFilteredOnlineVariableStatuses({
    blocks: currentTab?.blocks,
    onlineVariablesStatus
  });

  // Reset canvas
  const reset = useCallback(
    (context: CanvasRenderingContext2D) => {
      if (context && !isResetRef.current) {
        // adjust for device pixel density
        context.canvas.width = fullWidth * ratio;
        context.canvas.height = fullHeight * ratio;
        context.scale(ratio, ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        setScale(1);

        // reset state and refs
        setContext(context);
        setOffset(ORIGIN);
        setViewportTopLeft(ORIGIN);
        lastOffsetRef.current = ORIGIN;
        lastMousePosRef.current = ORIGIN;

        // this thing is so multiple resets in a row don't clear canvas
        isResetRef.current = true;
      }
    },
    [
      ORIGIN,
      isResetRef,
      lastMousePosRef,
      lastOffsetRef,
      setContext,
      setOffset,
      setScale,
      setViewportTopLeft
    ]
  );

  // update last offset
  useEffect(() => {
    lastOffsetRef.current = offset;
  }, [lastOffsetRef, offset]);

  // pan when offset or scale changes
  useLayoutEffect(() => {
    if (context && lastOffsetRef.current) {
      const offsetDiff = scalePoint(
        diffPoints(offset, lastOffsetRef.current),
        scale
      );
      context.translate(offsetDiff.x, offsetDiff.y);
      setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff));
      isResetRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, isResetRef, lastOffsetRef, offset, scale]);

  const throttledZoom = throttle(
    (event: WheelEvent, viewportMousePos: { x: number; y: number }) => {
      zoom({
        event,
        context,
        isResetRef,
        scale,
        setScale,
        setViewportTopLeft,
        viewportTopLeft,
        addPoints,
        isWheel: true,
        mousePos: viewportMousePos
      });
    },
    100
  );

  // Zoom on scroll
  useEffect(() => {
    const canvasElem = canvasRef.current;
    if (canvasElem === null) {
      return;
    }
    const handleWheel = (event: WheelEvent) => {
      if ((event.target as HTMLElement).tagName !== "CANVAS") return;
      if (index !== activeTab) return;
      if (isDragging || isPanning.current) return;
      if (canvasRef.current === null) return;
      event.preventDefault();

      if (event.ctrlKey) {
        // Case for zooming
        const boundaries = canvasRef.current.getBoundingClientRect();
        const { left, top } = boundaries;
        const viewportMousePos = {
          x: event.clientX - left,
          y: event.clientY - top
        };
        throttledZoom(event, viewportMousePos);
      } else {
        // Case for panning
        event.stopPropagation();
        if (event.ctrlKey) return;
        const deltaX = event.deltaX;
        const deltaY = event.deltaY;

        setOffset((prevOffset) => ({
          x: prevOffset.x - deltaX,
          y: prevOffset.y - deltaY
        }));
      }
    };
    canvasElem.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvasElem.removeEventListener("wheel", handleWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    canvasRef,
    context,
    index,
    isDragging,
    isResetRef,
    scale,
    viewportTopLeft
  ]);

  // Draw function
  const handleDrawCanvasElements = useCallback(
    (context: CanvasRenderingContext2D) => {
      // clear canvas but maintain transform
      const storedTransform = context.getTransform();
      // eslint-disable-next-line no-self-assign
      context.canvas.width = context.canvas.width;
      context.setTransform(storedTransform);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (canvas) {
        const elements = currentBlocks;
        const lines = currentVars;
        if (elements) {
          drawAutomationElements({
            ctx,
            elements,
            hoveredElement,
            hoveredLine,
            selectedElement,
            selectedLine,
            draggedElement,
            isConnecting,
            lines,
            draggedLine,
            isOnline,
            deviceImages,
            variablesLines,
            allTabsLines,
            tooltipInfo,
            selectionArea,
            canvasElementsArray: canvasElements.current,
            selectedAutomationDevices: selectedBlocks.current,
            onlineVariablesStatus: filteredOnlineVariableStatuses,
            selectedDestinations: selectedDestinations.current,
            addConnectButtonInfo,
            convertButtonInfo,
            isAddConnectButtonShowed,
            isConvertShowed,
            hoveredActionButton,
            scale
          });
        }
      }
    },
    [
      canvasRef,
      scale,
      currentBlocks,
      currentVars,
      hoveredElement,
      hoveredLine,
      selectedElement,
      selectedLine,
      draggedElement,
      isConnecting,
      draggedLine,
      isOnline,
      deviceImages,
      variablesLines,
      allTabsLines,
      tooltipInfo,
      selectionArea,
      filteredOnlineVariableStatuses,
      addConnectButtonInfo,
      convertButtonInfo,
      isAddConnectButtonShowed,
      isConvertShowed,
      hoveredActionButton
    ]
  );

  // Draw
  useLayoutEffect(() => {
    if (context) {
      if (isConnecting) {
        drawConnectionLine(
          context,
          connectStart.current,
          connectEnd.current,
          handleDrawCanvasElements
        );
      }
      handleDrawCanvasElements(context);
    }
  }, [
    context,
    scale,
    viewportTopLeft,
    canvasRef,
    canvasElements,
    handleDrawCanvasElements,
    isConnecting
  ]);

  // Handling canvas window resize
  useLayoutEffect(() => {
    const handleResize = () => {
      if (context && canvasRef.current) {
        const newRatio = window.devicePixelRatio || 1;
        const newFullWidth = window.innerWidth - SIDEBAR_WIDTH;
        const newFullHeight = window.innerHeight - TOP_PANEL_HEIGHT;

        context.save();

        reset(context);

        canvasRef.current.width = newFullWidth * newRatio;
        canvasRef.current.height = newFullHeight * newRatio;
        canvasRef.current.style.width = `${newFullWidth}px`;
        canvasRef.current.style.height = `${newFullHeight}px`;

        context.scale(newRatio, newRatio);
        requestAnimationFrame(() => handleDrawCanvasElements(context));

        context.restore();
      }
    };
    const debouncedResize = debounce(handleResize, 200);
    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, context, handleDrawCanvasElements]);

  // When reset canvas
  useLayoutEffect(() => {
    if (canvasRef.current) {
      // get new drawing context
      const renderCtx = canvasRef.current.getContext("2d");
      if (renderCtx) {
        reset(renderCtx);

        if (window.devicePixelRatio > 1) {
          const canvasWidth = canvasRef.current.width;
          const canvasHeight = canvasRef.current.height;
          canvasRef.current.width = canvasWidth * window.devicePixelRatio;
          canvasRef.current.height = canvasHeight * window.devicePixelRatio;
          canvasRef.current.style.width = canvasWidth + "px";
          canvasRef.current.style.height = canvasHeight + "px";
          renderCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
      }
    }
  }, [canvasRef, reset]);

  // Getting blocks and vars from store
  useEffect(() => {
    if (currentTab?.blocks && currentTab?.vars) {
      setCurrentBlocks(currentTab.blocks);
      setCurrentVars(currentTab.vars);
    }
  }, [currentTab?.blocks, currentTab?.vars, historyIndex]);

  // When deleting device block delete all connected elements and vars
  useEffect(() => {
    if (!cleanUp) return;
    cleanUpDeletedElements({
      blocks: currentTab?.blocks,
      canvasElements,
      vars: currentTab?.vars
    });
    setCurrentBlocks(currentTab?.blocks);
    setCurrentVars(currentTab?.vars);
    setCleanUp(false);
  }, [
    activeTab,
    canvasElements,
    cleanUp,
    currentTab?.blocks,
    currentTab?.vars,
    currentTabIndex
  ]);

  // When aligning blocks update connected elements inside canvas el array for hover/click events
  useEffect(() => {
    if (!isDragging) {
      if (context) {
        updateDeprecatedXY({
          blocks: currentBlocks,
          canvasElements,
          context,
          handleDrawCanvasElements,
          lastAlignRef,
          lastDeviceAlign
        });
        setCurrentBlocks(currentTab?.blocks);
        setCurrentVars(currentTab?.vars);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canvasElements,
    context,
    currentTab?.blocks,
    currentTab?.vars,
    currentTabIndex,
    handleDrawCanvasElements,
    isDragging,
    lastDeviceAlign
  ]);

  const [handleClick, handleHover] = useClickAndHover({
    canvasElements,
    canvasRef,
    context,
    dispatch,
    handleDrawCanvasElements,
    scale,
    connectEnd,
    connectStart,
    connectStartElement,
    currentTab,
    draggedElement,
    hoveredElement,
    hoveredLine,
    isAddConnectButtonShowed,
    isConnecting,
    isDrawerOpen,
    lastHoveredElement,
    ratio,
    selectedAutomationDevices,
    selectedElement,
    setConnectStartElement,
    isDragging,
    allTabsLines,
    isSelecting,
    isPanning,
    selectedBlocks,
    selectedDestinations,
    isDrag,
    copiedData,
    setMousePos,
    addConnectButtonInfo,
    convertButtonInfo,
    isConvertShowed,
    hoveredActionButton
  });

  const [handleMouseDown, handleMouseMove, handleMouseUp] = useDragAndDrop({
    canvasElements,
    canvasRef,
    context,
    dispatch,
    offset,
    scale,
    viewportTopLeft,
    connectEnd,
    connectStart,
    connectStartElement,
    currentTab,
    draggedElement,
    isConnecting,
    setConnectStartElement,
    draggedLine,
    isDragging,
    lastMousePosRef,
    setDraggedElement,
    setDraggedLine,
    setIsConnecting,
    setOffset,
    startElementMousePosition,
    startLineMousePosition,
    hoveredElement,
    ratio,
    selectedLine,
    allTabsLines,
    handleDrawCanvasElements,
    lastAlignRef,
    lastDeviceAlign,
    currentBlocks,
    setCurrentBlocks,
    currentVars,
    setCurrentVars,
    setSelectionArea,
    selectionArea,
    setIsSelecting,
    isSelecting,
    isPanning,
    selectedBlocks,
    selectedDestinations,
    selectedAutomationDevices,
    setIsDragging,
    isDrag,
    activeTab,
    addConnectButtonInfo,
    convertButtonInfo,
    isAddConnectButtonShowed,
    isConvertShowed
  });

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", handleMouseMove);
      return () => {
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [handleMouseUp, isDragging, handleMouseMove]);

  const [handleDrop, handleDragOver] = useCanvasDrop(
    canvasElements,
    canvasRef,
    context,
    dispatch,
    handleDrawCanvasElements,
    offset,
    scale,
    viewportTopLeft,
    allTabsBlocks,
    currentBlocks,
    allTabsLines,
    setCurrentBlocks,
    currentVars,
    lastHoveredElement,
    hoveredElement,
    transferredElement
  );

  useDeviceDeletion(
    setCleanUp,
    currentTab?.blocks.length,
    canvasElements.current
  );

  useCopyPaste({
    selectedBlocks,
    selectedDestinations,
    currentBlocks,
    currentVars,
    copiedData,
    canvasRef,
    context,
    scale,
    mousePos,
    allTabsBlocks,
    selectedAutomationDevices,
    selectedLines
  });

  useSaveTabSettings({
    activeTab,
    context,
    currentTab,
    lastOffsetRef,
    offset,
    scale,
    setOffset,
    setScale,
    setViewportTopLeft,
    viewportTopLeft
  });

  return (
    <AutomationCanvasContainer
      canvasRef={canvasRef}
      context={context}
      handleClick={handleClick}
      handleDeploy={handleDeploy}
      handleDragOver={handleDragOver}
      handleDrop={handleDrop}
      handleHover={handleHover}
      handleMouseDown={handleMouseDown}
      handleOnlineMode={handleOnlineMode}
      isAddConnectButtonShowed={isAddConnectButtonShowed}
      isAutomationConfigChanged={isAutomationConfigChanged}
      isConvertShowed={isConvertShowed}
      isDragging={isDragging}
      isOnlineMode={isOnline}
      isResetRef={isResetRef}
      offset={offset}
      scale={scale}
      canvasGridRef={canvasGridRef}
      setScale={setScale}
      setViewportTopLeft={setViewportTopLeft}
      viewportTopLeft={viewportTopLeft}
      canvasElements={canvasElements}
      isDrawerOpen={isDrawerOpen}
      isDeploying={isDeploying}
    />
  );
};

export default memo(AutomationCanvas);
