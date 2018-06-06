import { FORM_SAVE_EVENT, MODAL_SAVE_EVENT, MODAL_CLOSE_EVENT, SAVE_ERROR_EVENT, SAVED_EVENT
} from '../../actions/pages/newEvent';

const initialState = {
  saving: false,
  save_error: false,
  saved: false,
  showConfirmModal: false,
  formData: {},
  modalId: null,
  eventAddress: null
};

const newEventReducer = (state = initialState, action) => {

  switch (action.type) {
    case FORM_SAVE_EVENT:
      return {
        ...state,
        showConfirmModal: true,
        saved: false,
        formData: action.formData,
        modalId: null
      };
    case MODAL_SAVE_EVENT:
      return {
        ...state,
        saving: true,
        save_error: false,
        modalId: action.modalId
      };
    case MODAL_CLOSE_EVENT:
      return {
        ...state,
        showConfirmModal: false,
        saving: false,
        saved: false,
        save_error: false,
        modalId: null
      };
    case SAVE_ERROR_EVENT:
      return action.modalId === state.modalId ? {
        ...state,
        saving: false,
        save_error: action.error
      } : state;
    case SAVED_EVENT:
      return action.modalId === state.modalId ? {
        ...state,
        saving: false,
        saved: true,
        eventAddress: action.payload,
        formData: {}
      } : state;

    default:
      return state;
  }
};

export default newEventReducer;
