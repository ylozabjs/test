import React, { useState } from "react";
import { selectHomeConfigurationSlice } from "../../../redux/homeConfiguration/selectors";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { TZoneListProps } from "./types";
import {
  handleChangeSlidesOrder,
  handleIsAddZoneShowed
} from "../../../redux/homeConfiguration/slice";
import ZoneListContainer from "./ZoneListContainer";
import "swiper/swiper-bundle.css";

const ZonesList: React.FC<TZoneListProps> = () => {
  const dispatch = useAppDispatch();
  const { zones, isAddZoneShowed } = useAppSelector(
    selectHomeConfigurationSlice
  );
  const [placeholderInserted, setPlaceholderInserted] = useState(false);
  const [dragged, setDragged] = useState<HTMLElement | null>(null);
  const [isAddZoneBtnHovered, setIsAddZoneBtnHovered] = useState(false);
  const [isZoneDragged, setIsZoneDragged] = useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    if (placeholderInserted) return;
    if (isZoneDragged) {
      // Create the placeholder element
      const draggedElement = event.currentTarget as HTMLElement;
      const placeholder = document.createElement("div");
      placeholder.style.width = `${draggedElement.offsetWidth}px`;
      placeholder.style.height = `${draggedElement.offsetHeight}px`;
      placeholder.style.backgroundColor = "#EBEBEB";
      placeholder.style.position = "absolute";
      placeholder.style.top = `${draggedElement.offsetTop}px`;
      placeholder.style.left = `${draggedElement.offsetLeft}px`;
      placeholder.style.borderRadius = "5px";
      placeholder.style.boxShadow = "none";
      placeholder.classList.add("placeholder"); // Add the unique class name

      // Set the placeholder as the drag image
      setPlaceholderInserted(true);
      event.dataTransfer.setDragImage(placeholder, 0, 0);

      const targetElement = event.currentTarget as HTMLElement;
      const targetParent = targetElement.parentElement;
      if (!targetParent) return;

      targetParent.insertBefore(placeholder, targetElement);
    }
  };

  const handleDragStart = (event: React.DragEvent<HTMLElement>) => {
    if (
      event.currentTarget.id === "addBtn" ||
      (event.target as HTMLElement).id.includes("room")
    ) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData(
      "text/plain",
      (event.currentTarget as HTMLDivElement).id
    );
    const draggedElement = event.currentTarget as HTMLElement;
    draggedElement.style.boxShadow = "0";
    setDragged(draggedElement);
    setIsZoneDragged(true);
  };

  const handleDragEnd = (event: React.DragEvent<HTMLElement>) => {
    const placeholder = document.querySelector(".placeholder");
    if (placeholder) placeholder.remove();
    const draggedElement = event.currentTarget as HTMLElement;
    draggedElement.style.boxShadow = "0px 4px 12px rgba(39, 43, 48, 0.12);";
    setPlaceholderInserted(false);
    setIsZoneDragged(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    try {
      const data = event.dataTransfer.getData("text/plain");
      const draggedElementId = data;
      const line = document.querySelector(".line");
      if (line) line.remove();

      let droppedElementId = "";
      if (event.currentTarget && event.currentTarget instanceof HTMLElement) {
        droppedElementId = event.currentTarget.id;
      }

      const draggedElementIndex = zones.findIndex(
        (zone) => zone.id === draggedElementId
      );
      const droppedElementIndex = zones.findIndex(
        (zone) => zone.id === droppedElementId
      );

      if (draggedElementIndex === -1 || droppedElementIndex === -1) {
        return;
      }

      const newArrayOrder = zones.map((zone, index) => {
        if (index === draggedElementIndex) {
          return zones[droppedElementIndex];
        } else if (index === droppedElementIndex) {
          return zones[draggedElementIndex];
        }
        return zone;
      });

      dispatch(handleChangeSlidesOrder(newArrayOrder));
      setDragged(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    if (isZoneDragged) {
      const targetElement = event.currentTarget as HTMLElement;
      const targetParent = targetElement.parentElement;
      const hoveredElementPosition = targetElement.offsetTop;
      if (!targetParent) return;

      // Create the line element
      const line = document.createElement("div");
      line.style.position = "fixed";
      line.style.height = `${targetElement.offsetHeight}px`;
      line.style.width = "2px";
      line.style.backgroundColor = "#4A93FF";
      line.style.zIndex = "1000";
      line.classList.add("line");

      // Calculate the position of the line

      if (dragged) {
        const offsetX =
          targetElement.offsetLeft > dragged?.offsetLeft
            ? targetElement.offsetLeft + targetElement.offsetWidth + 10
            : targetElement.offsetLeft - 10;

        line.style.top = `${hoveredElementPosition}px`;
        line.style.left = `${offsetX}px`;
      }

      // Insert the line into the DOM
      targetParent.insertBefore(line, targetElement);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
    const line = document.querySelector(".line");
    if (line) line.remove();
  };
  const showAddZone = () => dispatch(handleIsAddZoneShowed());

  return (
    <ZoneListContainer
      handleDragEnd={handleDragEnd}
      handleDragEnter={handleDragEnter}
      handleDragLeave={handleDragLeave}
      handleDragOver={handleDragOver}
      handleDragStart={handleDragStart}
      handleDrop={handleDrop}
      isAddZoneShowed={isAddZoneShowed}
      setIsAddZoneBtnHovered={setIsAddZoneBtnHovered}
      showAddZone={showAddZone}
      zones={zones}
      isAddZoneBtnHovered={isAddZoneBtnHovered}
    />
  );
};

export default ZonesList;
