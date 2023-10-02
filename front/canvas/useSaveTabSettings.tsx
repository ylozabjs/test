import { useRef, useEffect } from "react";
import { Point } from "../../components/Canvas/HardwareCanvas/types";
import { handleUpdateAutomationTabSettings } from "../../redux/automationConfiguration/slice";
import { Tab, TabSettings } from "../../redux/automationConfiguration/types";
import { useAppDispatch } from "../../redux/store";
import usePrevious from "./usePrevious";
import { Dispatch } from "redux";

type Props = {
  context: CanvasRenderingContext2D | null;
  currentTab: Tab;
  viewportTopLeft: Point;
  lastOffsetRef: React.MutableRefObject<Point>;
  setViewportTopLeft: React.Dispatch<React.SetStateAction<Point>>;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  offset: Point;
  setOffset: React.Dispatch<React.SetStateAction<Point>>;
  activeTab: string;
  scale: number;
};

type TUpdateSettingsProps = {
  context: CanvasRenderingContext2D | null;
  scale: number;
  offset: Point;
  dispatch: Dispatch;
  activeTab: string;
};

export const updateSettings = (props: TUpdateSettingsProps) => {
  const { activeTab, context, dispatch, offset, scale } = props;
  if (context) {
    const { a, b, c, d, e, f } = context.getTransform();
    const matrix = { a, b, c, d, e, f };
    const settings = {
      scale,
      offset,
      transformMatrix: matrix
    };
    dispatch(
      handleUpdateAutomationTabSettings({ tabNumber: activeTab, settings })
    );
  }
};

const useSaveTabSettings = (props: Props) => {
  const {
    context,
    currentTab,
    lastOffsetRef,
    viewportTopLeft,
    offset,
    setOffset,
    setScale,
    setViewportTopLeft,
    activeTab,
    scale
  } = props;
  const dispatch = useAppDispatch();
  const restoreRequired = useRef(false);
  const prevTabNumber = usePrevious(activeTab);

  const restoreTransformations = (tabSettings: TabSettings) => {
    if (context && tabSettings) {
      context.resetTransform();
      const transformMatrix = tabSettings.transformMatrix;
      context.setTransform(
        transformMatrix.a,
        transformMatrix.b,
        transformMatrix.c,
        transformMatrix.d,
        transformMatrix.e,
        transformMatrix.f
      );
      const newScale = tabSettings.scale;
      const newViewportTopLeft = {
        x: -transformMatrix.e / transformMatrix.a,
        y: -transformMatrix.f / transformMatrix.d
      };
      // Calculate the difference between newViewportTopLeft and viewportTopLeft
      const viewportTopLeftDiff = {
        x: newViewportTopLeft.x - viewportTopLeft.x,
        y: newViewportTopLeft.y - viewportTopLeft.y
      };

      // Update the offset based on the difference
      setOffset((prevOffset) => ({
        x: prevOffset.x + viewportTopLeftDiff.x,
        y: prevOffset.y + viewportTopLeftDiff.y
      }));

      setScale(newScale);
      setViewportTopLeft(newViewportTopLeft);
      // Update the lastOffsetRef.current value
      lastOffsetRef.current = {
        x: lastOffsetRef.current.x + viewportTopLeftDiff.x,
        y: lastOffsetRef.current.y + viewportTopLeftDiff.y
      };
    }
  };

  useEffect(() => {
    if (context && restoreRequired.current) {
      if (currentTab?.settings) {
        restoreTransformations(currentTab.settings);
        restoreRequired.current = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  useEffect(() => {
    if (currentTab?.settings && prevTabNumber !== activeTab) {
      setScale(currentTab?.settings.scale);
      if (!context) {
        restoreRequired.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, prevTabNumber, currentTab?.settings, context]);

  // Update the settings when switching away from a tab
  useEffect(() => {
    if (prevTabNumber && prevTabNumber !== activeTab && context) {
      const { a, b, c, d, e, f } = context.getTransform();
      const matrix = { a, b, c, d, e, f };
      const settings = {
        scale,
        offset,
        transformMatrix: matrix
      };
      dispatch(
        handleUpdateAutomationTabSettings({
          tabNumber: prevTabNumber,
          settings
        })
      );
    }
  }, [activeTab, prevTabNumber, dispatch, context, scale, offset]);

  // // Call updateSettings when offset or scale changes
  // useEffect(() => {
  //   updateSettings({ activeTab, context, dispatch, offset, scale });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [scale]);

  return [updateSettings];
};

export default useSaveTabSettings;
