import React from "react";
import PropTypes from "prop-types";
import TaskPresenter from "presenters/TaskPresenter";
import UserPresenter from "presenters/UserPresenter";
import { has } from "ramda";

import TextField from "@material-ui/core/TextField";
import UserSelect from "components/UserSelect";
import useStyles from "./useStyles";

const Form = ({ errors, onChange, task }) => {
  const handleChangeTextField = (fieldName) => (event) =>
    onChange({ ...task, [fieldName]: event.target.value });

  const handleChangeSelect = (fieldName) => (user) =>
    onChange({ ...task, [fieldName]: user });

  const styles = useStyles();

  return (
    <form className={styles.root}>
      <TextField
        error={has("name", errors)}
        helperText={errors.name}
        onChange={handleChangeTextField("name")}
        value={TaskPresenter.name(task)}
        label="Name"
        required
        margin="dense"
      />
      <TextField
        error={has("description", errors)}
        helperText={errors.description}
        onChange={handleChangeTextField("description")}
        value={TaskPresenter.description(task)}
        label="Description"
        required
        multiline
        margin="dense"
      />
      <UserSelect
        label="Author"
        value={task.author}
        onChange={handleChangeSelect("author")}
        isDisabled
        isRequired
        error={has("author", errors)}
        helperText={errors.author}
      />
      <UserSelect
        label="Assignee"
        value={task.assignee}
        onChange={handleChangeSelect("assignee")}
        isDisabled={false}
        isRequired
        error={has("assignee", errors)}
        helperText={errors.assignee}
      />
    </form>
  );
};

Form.propTypes = {
  onChange: PropTypes.func.isRequired,
  task: TaskPresenter.shape().isRequired,
  errors: PropTypes.shape({
    name: PropTypes.arrayOf(TaskPresenter.name()),
    description: PropTypes.arrayOf(TaskPresenter.description()),
    author: PropTypes.arrayOf(UserPresenter.shape()),
    assignee: PropTypes.arrayOf(UserPresenter.shape()),
  }),
};

Form.defaultProps = {
  errors: {},
};

export default Form;
