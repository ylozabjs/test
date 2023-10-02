import React from "react";
import { Point } from "../../components/Canvas/HardwareCanvas/types";
import { SIDEBAR_WIDTH, TOP_PANEL_HEIGHT } from "../../models/core.constants";

type Props = {
  isWheel?: boolean;
  event: TCustomEvent | React.MouseEvent | WheelEvent;
  direction?: "out" | "in";
  context: CanvasRenderingContext2D | null;
  scale: number;
  viewportTopLeft: Point;
  addPoints: (
    p1: Point,
    p2: Point
  ) => {
    x: number;
    y: number;
  };
  setViewportTopLeft: React.Dispatch<React.SetStateAction<Point>>;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  isResetRef: React.MutableRefObject<boolean>;
  mousePos?: Point;
  isNotFullWidth?: boolean;
  customScale?: number;
  customXZoom?: number;
  customYZoom?: number;
};

type TCustomEvent = {
  clientX: number;
  clientY: number;
  preventDefault: () => void;
};

export const zoom = (props: Props) => {
  const {
    direction,
    event,
    context,
    scale,
    viewportTopLeft,
    addPoints,
    isResetRef,
    setScale,
    setViewportTopLeft,
    isWheel,
    mousePos,
    isNotFullWidth,
    customScale,
    customXZoom,
    customYZoom
  } = props;
  event.preventDefault();
  const maxZoomNumber = 250;
  const minZoomNumber = 30;
  const zoomSensitivity = 1500; // bigger for lower zoom per scroll
  const isNotFullWidthXMargin = isNotFullWidth ? SIDEBAR_WIDTH : 0;
  const isNotFullWidthYMargin = isNotFullWidth ? TOP_PANEL_HEIGHT : 0;

  const canvasWidth = window.innerWidth - isNotFullWidthXMargin;
  const canvasHeight = window.innerHeight - isNotFullWidthYMargin;

  let zoomNumber = direction === "out" ? 400 : -400;
  let zoom;
  let xZoom;
  let yZoom;

  if (isWheel) zoomNumber = 500;

  if (
    Math.round(scale * 100) >= maxZoomNumber &&
    (direction === "in" || (event as React.WheelEvent).deltaY < 0)
  )
    return;
  else if (
    Math.round(scale * 100) <= minZoomNumber &&
    (direction === "out" || (event as React.WheelEvent).deltaY > 0)
  )
    return;

  if (context) {
    if (customScale) {
      zoom = customScale;
      xZoom = customXZoom || 0;
      yZoom = customYZoom || 0;
    } else if (isWheel && mousePos) {
      zoom = 1 - (event as React.WheelEvent).deltaY / zoomNumber;
      xZoom = mousePos.x / scale - mousePos.x / (scale * zoom);
      yZoom = mousePos.y / scale - mousePos.y / (scale * zoom);
    } else {
      zoom = 1 - zoomNumber / zoomSensitivity;
      xZoom = canvasWidth / 2 / scale - canvasWidth / 2 / (scale * zoom);
      yZoom = canvasHeight / 2 / scale - canvasHeight / 2 / (scale * zoom);
    }
    const viewportTopLeftDelta = {
      x: xZoom,
      y: yZoom
    };
    const newViewportTopLeft = addPoints(viewportTopLeft, viewportTopLeftDelta);
    context.translate(viewportTopLeft.x, viewportTopLeft.y);
    context.scale(zoom, zoom);
    context.translate(-newViewportTopLeft.x, -newViewportTopLeft.y);
    setViewportTopLeft(newViewportTopLeft);
    setScale(scale * zoom);
    isResetRef.current = false;
  }
};
