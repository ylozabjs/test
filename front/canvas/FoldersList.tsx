import React, { memo, useCallback, useMemo } from "react";
import { selectLibrary } from "../../../../redux/automationConfiguration/selectors";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
import styles from "./FolderList.module.scss";
import deviceIcon from "../../../../assets/images/icons/device.svg";
import { findDraggedElement } from "../../../../utils/canvas/helpersCanvas";
import { v4 as uuidv4 } from "uuid";
import { TCommonFolder, TFolderListProps, TSearchResultItem } from "./types";
import {
  TLibrary,
  TSubSubFolder
} from "../../../../redux/automationConfiguration/types";
import FolderListContainer from "./FolderListContainer";
import { handleSetTransferredElement } from "../../../../redux/automationConfiguration/slice";
import escapeRegExp from "lodash/escapeRegExp";
import { Tooltip } from "antd";

const FoldersList: React.FC<TFolderListProps> = ({ searchValue }) => {
  const library = useAppSelector(selectLibrary);
  const dispatch = useAppDispatch();

  const escapedSearchValue = escapeRegExp(searchValue);
  const regex = useMemo(
    () => new RegExp(`(${escapedSearchValue})`, "gi"),
    [escapedSearchValue]
  );

  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      const blockType = (event.target as HTMLElement).id;
      const element = findDraggedElement({ blockType, library });
      event.dataTransfer.setData("application/json", JSON.stringify(element));
      dispatch(handleSetTransferredElement(JSON.stringify(element)));
      // Set a transparent drag image
      const img = new Image();
      img.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      event.dataTransfer.setDragImage(img, 0, 0);
    },
    [dispatch, library]
  );

  const filterAndHighlight = useCallback(
    (list: TLibrary, searchValue: string) => {
      if (!searchValue) return [];

      const searchBlocks = (
        subfolders: TSubSubFolder[],
        path: string[]
      ): TSearchResultItem[] => {
        return subfolders
          .flatMap((subfolder: TCommonFolder) => {
            const newPath = [...path, subfolder.alias];
            if (subfolder.subfolders) {
              return searchBlocks(subfolder.subfolders, newPath);
            } else {
              return { ...subfolder, path: newPath, matchIndices: [] };
            }
          })
          .filter((subfolder: TSearchResultItem) =>
            subfolder.config?.block_alias.match(regex)
          )
          .map((subfolder: TSearchResultItem) => {
            const matchIndices = [];
            let match;
            while (
              (match = regex.exec(subfolder.config.block_alias)) !== null
            ) {
              matchIndices.push([match.index, match.index + match[1].length]);
            }
            return {
              ...subfolder,
              matchIndices,
              path: subfolder.path
            };
          });
      };

      return list.flatMap(
        (folder) =>
          searchBlocks((folder.subfolders as TCommonFolder[]) || [], [
            folder.alias
          ]) as TSearchResultItem[]
      );
    },
    [regex]
  );

  const renderHighlightedText = (text: string, matchIndices: number[][]) => {
    const textParts = [];
    let lastIndex = 0;
    matchIndices.forEach(([start, end]) => {
      textParts.push(text.slice(lastIndex, start));
      textParts.push(
        <mark className={styles.mark}>{text.slice(start, end)}</mark>
      );
      lastIndex = end;
    });
    textParts.push(text.slice(lastIndex));
    return textParts;
  };

  const renderSearchResults = (filteredLibrary: TSearchResultItem[]) => {
    return (
      <div className={styles.searchList}>
        {filteredLibrary.map((subElement: TSearchResultItem) => {
          const joinedPath = subElement.path.join("/");
          const path = joinedPath.slice(0, joinedPath.length - 1);
          const resultText = subElement.config?.block_alias;
          const resultLength = resultText.length;
          const maxResultLength = 25;
          const isTooLong = resultLength > maxResultLength;
          return (
            <Tooltip
              placement="top"
              arrowPointAtCenter
              zIndex={10000}
              overlayStyle={{
                maxWidth: "330px",
                visibility: isTooLong ? "visible" : "hidden"
              }}
              title={resultText}
              trigger={"hover"}
            >
              <div
                className={styles.searchList__searchItem}
                onDragStart={handleDragStart}
                draggable
                id={subElement.config?.block_type}
                key={subElement.config?.id ? subElement.config.id : uuidv4()}
              >
                <div className={styles.searchList__searchItem__title}>
                  <img src={deviceIcon} alt="device" />
                  <span className={styles.searchList__searchItem__content}>
                    {renderHighlightedText(
                      subElement.config?.block_alias || "",
                      subElement.matchIndices
                    )}
                  </span>
                </div>
                <div className={styles.searchList__searchItem__path}>
                  {subElement.path.length > 2 ? path : subElement.path}
                </div>
              </div>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  const filteredLibrary = useMemo<TSearchResultItem[]>(() => {
    return filterAndHighlight(library, searchValue);
  }, [filterAndHighlight, library, searchValue]);

  return (
    <FolderListContainer
      library={library}
      searchValue={searchValue}
      filteredLibrary={filteredLibrary}
      handleDragStart={handleDragStart}
      renderSearchResults={renderSearchResults}
    />
  );
};
export default memo(FoldersList);
