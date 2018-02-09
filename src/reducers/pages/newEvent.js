import { SAVE_EVENT, SAVED_EVENT } from '../../actions/pages/newEvent';

const initialState = {
  saving: false,
  saved: false,
  formData: {}
};

const newEventReducer = (state = initialState, action) => {

  switch (action.type) {
    case SAVE_EVENT:
      return {
        ...state,
        saving: true,
        formData: action.formData
      };
    case SAVED_EVENT:
      return {
        ...state,
        saving: false,
        saved: true,
        formData: {}
      };

    default:
      return state;
  }
};

export default newEventReducer;
