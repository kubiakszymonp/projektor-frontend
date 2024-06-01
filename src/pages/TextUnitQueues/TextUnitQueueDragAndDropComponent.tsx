import { Card, Stack, Typography, Button } from "@mui/material";
import {
  DropResult,
  DraggingStyle,
  NotDraggingStyle,
  DragDropContext,
  Draggable,
} from "react-beautiful-dnd";
import { StrictModeDroppable } from "../../polyfills/strict-mode-droppable";
import { DragAndDropItem } from "./TextUnitQueueList";
import { Property } from "csstype";

export const TextUnitQueueDragAndDrop: React.FC<{
  textUnitsInQueue: DragAndDropItem[];
  setTextUnitsInQueue: (textUnits: DragAndDropItem[]) => void;
  onDeleteItem: (key: string) => void;
}> = ({ textUnitsInQueue, setTextUnitsInQueue, onDeleteItem }) => {
  const reorder = (
    list: DragAndDropItem[],
    startIndex: number,
    endIndex: number
  ) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const itemsNew = reorder(
      textUnitsInQueue,
      result.source.index,
      result.destination.index
    );
    setTextUnitsInQueue(itemsNew);
  };
  const grid = 8;

  const getItemStyle = (
    _isDragging: boolean,
    draggableStyle: DraggingStyle | NotDraggingStyle | undefined
  ) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none" as Property.UserSelect,
    margin: `0 0 ${grid * 2}px 0`,

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <StrictModeDroppable droppableId="droppable">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              padding: grid,
              width: "90%",
            }}
          >
            {textUnitsInQueue.map((item: any, index: any) => (
              <Draggable key={item.key} draggableId={item.key} index={index}>
                {(provided, snapshot) => (
                  <div
                    className="text-unit-queue-item"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}
                  >
                    <Card
                      sx={{
                        borderRadius: 2,
                        p: 2,
                      }}
                    >
                      <Stack
                        direction={"row"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                      >
                        <Typography
                          variant={"h6"}
                          textOverflow={"ellipsis"}
                          noWrap
                          sx={{
                            fontSize: {
                              xs: "0.85rem", // For xs breakpoints and below
                              sm: "1.25rem", // For sm breakpoints and above
                              // Add more breakpoints as needed
                            },
                          }}
                        >
                          {item.text}
                        </Typography>
                        <Stack flexWrap={"nowrap"} direction={"row"}>
                          <Button
                            color="error"
                            onClick={() => onDeleteItem(item.key)}
                          >
                            Usuń
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </StrictModeDroppable>
    </DragDropContext>
  );
};
