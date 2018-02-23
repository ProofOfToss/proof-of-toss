import { FORM_SAVE_EVENT, MODAL_SAVE_EVENT, MODAL_CLOSE_EVENT, SAVE_ERROR_EVENT, SAVED_EVENT } from '../../actions/pages/newEvent';

const initialState = {
  saving: false,
  save_error: false,
  saved: false,
  showConfirmModal: false,
  formData: {}
};

const newEventReducer = (state = initialState, action) => {

  switch (action.type) {
    case FORM_SAVE_EVENT:
      return {
        ...state,
        showConfirmModal: true,
        saved: false,
        formData: action.formData
      };
    case MODAL_SAVE_EVENT:
      return {
        ...state,
        saving: true
      };
    case MODAL_CLOSE_EVENT:
      return {
        ...state,
        showConfirmModal: false
      };
    case SAVE_ERROR_EVENT:
      return {
        ...state,
        saving: false,
        save_error: action.error
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
