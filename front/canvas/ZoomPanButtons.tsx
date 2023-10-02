import React from "react";
import styles from "./ZoomPanButtons.module.scss";
import zoomInIcon from "../../../../assets/images/icons/zoom-in.svg";
import zoomOutIcon from "../../../../assets/images/icons/zoom-out.svg";
import { useAppDispatch } from "../../../../redux/store";
import { TZoomPanButtonsProps } from "./types";
import { zoom } from "../../../../utils/canvas/zoom";
import { addPoints } from "../../../../utils/canvas/pointsCount";
import { hideAddButton } from "../../../../redux/configuration/slice";
import cn from "classnames";
import {
  SIDEBAR_WIDTH,
  TOP_PANEL_HEIGHT
} from "../../../../models/core.constants";
import zoomToFitIcon from "../../../../assets/images/icons/zoom-to-fit.svg";
import { isElementVisible } from "../../../../utils/canvas/helpersCanvas";
import {
  handleHideConnectButton,
  handleHideConvertButtons
} from "../../../../redux/automationConfiguration/slice";

const ZoomPanButtons: React.FC<TZoomPanButtonsProps> = ({
  scale,
  context,
  isResetRef,
  setScale,
  setViewportTopLeft,
  viewportTopLeft,
  isWithoutPadding,
  isDrawerOpen,
  canvasElements,
  isAutomation
}) => {
  const dispatch = useAppDispatch();
  const maxZoomNumber = 250;
  const minZoomNumber = 30;
  const isMaxLimit = Math.round(scale * 100) >= maxZoomNumber;
  const isMinLimit = Math.round(scale * 100) <= minZoomNumber;

  const handleZoom = (e: React.MouseEvent, direction: "in" | "out") => {
    zoom({
      event: e,
      direction,
      context,
      isResetRef,
      scale,
      setScale,
      setViewportTopLeft,
      viewportTopLeft,
      addPoints,
      isNotFullWidth: isAutomation
    });
    dispatch(hideAddButton());
  };

  const resetZoom = () => {
    if (context) {
      const leftSidebarWidth = isAutomation ? SIDEBAR_WIDTH : 0;
      const topPanelWidth = isAutomation ? TOP_PANEL_HEIGHT : 0;
      const canvasCenter = {
        x: window.innerWidth / 2 - leftSidebarWidth,
        y: window.innerHeight / 2 - topPanelWidth
      };

      const syntheticEvent = {
        clientX: canvasCenter.x,
        clientY: canvasCenter.y,
        preventDefault: () => {}
      };

      const targetScale = 1 / scale;

      const xZoom = canvasCenter.x / scale - canvasCenter.x;
      const yZoom = canvasCenter.y / scale - canvasCenter.y;

      zoom({
        event: syntheticEvent,
        context,
        scale,
        setScale,
        viewportTopLeft,
        setViewportTopLeft,
        addPoints,
        isResetRef,
        isNotFullWidth: true,
        mousePos: canvasCenter,
        customScale: targetScale,
        customXZoom: xZoom,
        customYZoom: yZoom
      });
    }
    dispatch(handleHideConnectButton());
    dispatch(handleHideConvertButtons());
  };

  const handleZoomToFit = () => {
    if (canvasElements && context) {
      if (canvasElements.current.length === 0) return;
      const isNotFullWidthXMargin = isAutomation ? SIDEBAR_WIDTH * 2 : 0;
      const isNotFullHeightYMargin = isAutomation ? TOP_PANEL_HEIGHT : 0;
      const canvasHeight = window.innerHeight - isNotFullHeightYMargin;
      const canvasWidth = window.innerWidth - isNotFullWidthXMargin;
      const allElementsVisible = canvasElements.current.every((element) =>
        isElementVisible(
          element,
          viewportTopLeft,
          scale,
          canvasWidth,
          canvasHeight
        )
      );
      if (allElementsVisible) return;

      let minX = canvasElements.current[0].x;
      let maxX = canvasElements.current[0].x;
      let minY = canvasElements.current[0].y;
      let maxY = canvasElements.current[0].y;

      canvasElements.current.forEach((element) => {
        minX = Math.min(minX, element.x);
        maxX = Math.max(maxX, element.x + element.width);
        minY = Math.min(minY, element.y);
        maxY = Math.max(maxY, element.y + element.height);
      });

      const padding = isAutomation ? 150 : 350; // Add a padding value to fit elements with some space around them
      const elementsWidth = maxX - minX + padding * 2;
      const elementsHeight = maxY - minY + padding * 2;

      const zoomLevel = Math.min(
        canvasWidth / elementsWidth,
        canvasHeight / elementsHeight
      );

      const newViewportCenter = {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2
      };

      const newViewportTopLeft = {
        x: newViewportCenter.x - canvasWidth / 2 / zoomLevel,
        y: newViewportCenter.y - canvasHeight / 2 / zoomLevel
      };

      const syntheticEvent = {
        clientX: newViewportCenter.x,
        clientY: newViewportCenter.y,
        preventDefault: () => {}
      };

      const clampedTargetScale = Math.min(zoomLevel, 1);

      const xZoom = newViewportTopLeft.x - viewportTopLeft.x;
      const yZoom = newViewportTopLeft.y - viewportTopLeft.y;

      // Calculate the target scale if the current scale is greater or less than 1
      if (scale > 1 || scale < 1) {
        zoom({
          event: syntheticEvent,
          context,
          scale,
          setScale,
          viewportTopLeft,
          setViewportTopLeft,
          addPoints,
          isResetRef,
          isNotFullWidth: isAutomation ? true : false,
          mousePos: newViewportCenter,
          customScale: clampedTargetScale / scale, // Reset the scale to 1
          customXZoom: xZoom,
          customYZoom: yZoom
        });
        return;
      }

      zoom({
        event: syntheticEvent,
        context,
        scale,
        setScale,
        viewportTopLeft,
        setViewportTopLeft,
        addPoints,
        isResetRef,
        isNotFullWidth: isAutomation ? true : false,
        mousePos: newViewportCenter,
        customScale: clampedTargetScale,
        customXZoom: xZoom,
        customYZoom: yZoom
      });
    }
    dispatch(handleHideConnectButton());
    dispatch(handleHideConvertButtons());
  };

  return (
    <div
      className={cn(styles.buttons, {
        [styles.withAutomationDrawer]: isDrawerOpen && isAutomation,
        [styles.withDrawer]: isDrawerOpen,
        [styles.withoutPadding]: isWithoutPadding
      })}
    >
      <span
        onClick={(e) => handleZoom(e, "in")}
        className={styles.buttons__button}
      >
        <img src={zoomInIcon} alt="zoom-in" />
      </span>
      <span
        onClick={(e) => handleZoom(e, "out")}
        className={styles.buttons__button}
      >
        <img src={zoomOutIcon} alt="zoom-out" />
      </span>
      <span className={styles.buttons__button} onClick={resetZoom}>
        {isMaxLimit ? maxZoomNumber : isMinLimit ? minZoomNumber : (scale * 100).toFixed(0)}%
      </span>
      <span className={styles.buttons__button} onClick={handleZoomToFit}>
        <img src={zoomToFitIcon} alt="zoom to fit icon" />
      </span>
    </div>
  );
};

export default React.memo(ZoomPanButtons);
