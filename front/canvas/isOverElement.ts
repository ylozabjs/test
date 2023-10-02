import { TCanvasElementProps } from "../../components/Canvas/HardwareCanvas/types";
import {
  TActionButtonPosition,
  TActionButtonType
} from "../../redux/configuration/types";

export const isOverElement = (
  canvasX: number,
  canvasY: number,
  element: TCanvasElementProps
) => {
  const { x, y, width, height } = element;
  return (
    canvasY > y && canvasY < y + height && canvasX > x && canvasX < x + width
  );
};

type TActionObject = {
  state: boolean;
  type?: TActionButtonType;
};

export const isOverActionButton = (
  canvasX: number,
  canvasY: number,
  buttonInfo: TActionButtonPosition | null
): TActionObject => {
  const buttonWidth = 20;
  const buttonHeight = 20;
  const marginBetweenButtons = 25;
  if (buttonInfo) {
    const { x, y, helperButtonPoint } = buttonInfo;
    const isOverMainButton =
      canvasY > y &&
      canvasY < y + buttonHeight &&
      canvasX > x &&
      canvasX < x + buttonWidth;
    if (helperButtonPoint?.x) {
      const isOverHelperButton =
        canvasY > y + buttonHeight &&
        canvasY < y + buttonHeight + marginBetweenButtons &&
        canvasX > x &&
        canvasX < x + buttonWidth;
      if (isOverHelperButton) {
        console.log("delete");
        return { state: isOverHelperButton, type: "delete" };
      } else {
        console.log("convert");
        return { state: isOverMainButton, type: "convert" };
      }
    }
    console.log(buttonInfo.type);
    return { state: isOverMainButton, type: buttonInfo.type };
  }
  return { state: false };
};

export const isNearElement = (
  canvasX: number,
  canvasY: number,
  element: TCanvasElementProps
) => {
  const { x, y, width, height } = element;
  const vicinity = 40;

  return (
    canvasY >= y - vicinity &&
    canvasY <= y + height + vicinity &&
    canvasX >= x - vicinity &&
    canvasX <= x + width + vicinity
  );
};
