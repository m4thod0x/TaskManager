import React, { useState, useEffect } from "react";
import Board from "@asseinfo/react-kanban";
import "@asseinfo/react-kanban/dist/styles.css";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import { propOr } from "ramda";

import Task from "components/Task";
import TasksRepository from "repositories/TasksRepository";
import ColumnHeader from "components/ColumnHeader";
import AddPopup from "components/AddPopup";
import TaskForm from "forms/TaskForm";
import EditPopup from "components/EditPopup";
import TaskPresenter from "presenters/TaskPresenter";

import useStyles from "./useStyles";

const STATES = [
  { key: "new_task", value: "New" },
  { key: "in_development", value: "In Dev" },
  { key: "in_qa", value: "In QA" },
  { key: "in_code_review", value: "in CR" },
  { key: "ready_for_release", value: "Ready for release" },
  { key: "released", value: "Released" },
  { key: "archived", value: "Archived" },
];

const MODES = {
  ADD: "add",
  NONE: "none",
  EDIT: "edit",
};

const initialBoard = {
  columns: STATES.map((column) => ({
    id: column.key,
    title: column.value,
    cards: [],
    meta: {},
  })),
};

const TaskBoard = () => {
  const [board, setBoard] = useState(initialBoard);
  const [boardCards, setBoardCards] = useState([]);
  useEffect(() => loadBoard(), []);
  useEffect(() => generateBoard(), [boardCards]);
  const [mode, setMode] = useState(MODES.NONE);
  const [openedTaskId, setOpenedTaskId] = useState(null);

  const styles = useStyles();

  const loadColumn = (state, page, perPage) => {
    return TasksRepository.index({
      q: { stateEq: state },
      page,
      perPage,
    });
  };

  const loadColumnInitial = (state, page = 1, perPage = 10) => {
    loadColumn(state, page, perPage).then(({ data }) => {
      setBoardCards((prevState) => {
        return {
          ...prevState,
          [state]: { cards: data.items, meta: data.meta },
        };
      });
    });
  };

  const loadColumnMore = (state, page = 1, perPage = 10) => {
    loadColumn(state, page, perPage).then(({ data }) => {
      setBoardCards((prevState) => {
        return {
          ...prevState,
          [state]: {
            cards: prevState[state].cards.concat(data.items),
            meta: data.meta,
          },
        };
      });
    });
  };

  const generateBoard = () => {
    const board = {
      columns: STATES.map(({ key, value }) => {
        return {
          id: key,
          title: value,
          cards: propOr({}, "cards", boardCards[key]),
          meta: propOr({}, "meta", boardCards[key]),
        };
      }),
    };

    setBoard(board);
  };

  const loadBoard = () => {
    STATES.map(({ key }) => loadColumnInitial(key));
  };

  const handleCardDragEnd = (task, source, destination) => {
    const transition = TaskPresenter.transitions(task).find(
      ({ to }) => destination.toColumnId === to
    );
    if (!transition) {
      return null;
    }

    return TasksRepository.update(TaskPresenter.id(task), {
      task: { stateEvent: transition.event },
    })
      .then(() => {
        loadColumnInitial(destination.toColumnId);
        loadColumnInitial(source.fromColumnId);
      })
      .catch((error) => {
        alert(`Move failed! ${error.message}`);
      });
  };

  const handleOpenAddPopup = () => {
    setMode(MODES.ADD);
  };

  const handleClose = () => {
    setMode(MODES.NONE);
    setOpenedTaskId(null);
  };

  const handleTaskCreate = (params) => {
    const attributes = TaskForm.attributesToSubmit(params);
    return TasksRepository.create(attributes).then(({ data: { task } }) => {
      loadColumnInitial(TaskPresenter.state(task));
      handleClose();
    });
  };

  const loadTask = (id) => {
    return TasksRepository.show(id).then(({ data: { task } }) => task);
  };

  const handleTaskUpdate = (task) => {
    const attributes = TaskForm.attributesToSubmit(task);

    return TasksRepository.update(TaskPresenter.id(task), attributes).then(
      () => {
        loadColumnInitial(TaskPresenter.state(task));
        handleClose();
      }
    );
  };

  const handleTaskDestroy = (task) => {
    return TasksRepository.destroy(TaskPresenter.id(task)).then(() => {
      loadColumnInitial(TaskPresenter.state(task));
      handleClose();
    });
  };

  const handleOpenEditPopup = (task) => {
    setOpenedTaskId(TaskPresenter.id(task));
    setMode(MODES.EDIT);
  };

  return (
    <div>
      <Fab
        className={styles.addButton}
        onClick={handleOpenAddPopup}
        color="primary"
        aria-label="add"
      >
        <AddIcon />
      </Fab>
      <Board
        renderColumnHeader={(column) => (
          <ColumnHeader column={column} onLoadMore={loadColumnMore} />
        )}
        renderCard={(card) => (
          <Task onClick={handleOpenEditPopup} task={card} />
        )}
        onCardDragEnd={handleCardDragEnd}
      >
        {board}
      </Board>
      {mode === MODES.ADD && (
        <AddPopup onCreateCard={handleTaskCreate} onClose={handleClose} />
      )}
      {mode === MODES.EDIT && (
        <EditPopup
          onLoadCard={loadTask}
          onCardDestroy={handleTaskDestroy}
          onCardUpdate={handleTaskUpdate}
          onClose={handleClose}
          cardId={openedTaskId}
        />
      )}
    </div>
  );
};

export default TaskBoard;
