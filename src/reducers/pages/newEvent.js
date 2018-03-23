import { FORM_APPROVE_EVENT, FORM_APPROVE_EVENT_SUCCESS, FORM_APPROVE_EVENT_ERROR, FORM_NEED_TO_REAPPROVE_EVENT,
  FORM_SAVE_EVENT, MODAL_SAVE_EVENT, MODAL_CLOSE_EVENT, SAVE_ERROR_EVENT, SAVED_EVENT
} from '../../actions/pages/newEvent';

const initialState = {
  approving: false,
  approving_error: false,
  approved: false,
  saving: false,
  save_error: false,
  saved: false,
  showConfirmModal: false,
  formData: {}
};

const newEventReducer = (state = initialState, action) => {

  switch (action.type) {
    case FORM_APPROVE_EVENT:
      return {
        ...state,
        approving: true
      };
    case FORM_APPROVE_EVENT_ERROR:
      return {
        ...state,
        approving: false,
        approving_error: action.error
      };
    case FORM_APPROVE_EVENT_SUCCESS:
      return {
        ...state,
        approving: false,
        approved: true
      };
    case FORM_NEED_TO_REAPPROVE_EVENT:
      return {
        ...state,
        approved: false
      };
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
