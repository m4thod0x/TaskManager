import PropTypes, { object, string } from "prop-types";
import PropTypesPresenter from "utils/PropTypesPresenter";

export default new PropTypesPresenter(
  {
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    state: PropTypes.string,
    transitions: PropTypes.arrayOf(object),
    expiredAt: PropTypes.instanceOf(Date),
  },
  {
    presentation(task) {
      return `${this.id(task)} [${this.name(task)}]`;
    },
  }
);
