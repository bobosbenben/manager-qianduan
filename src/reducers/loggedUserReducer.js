const initialState = {
    pending: true,
    getInitialDataing:false,
    logged: false,
    initialData: null,
    currentMenuButton: null
}

const loggedUserReducer = (state = initialState, action) => {

    if (action.type === 'GET_LOGGED_USER') {
        return {
            pending:true
        }
    }

    if (action.type === 'SET_LOGGED_USER') {
        return {
            pending: false,
            logged: action.logged
        }
    }

    if(action.type === 'SET_INITIAL_DATA'){
        return {
            pending: state.pending,
            logged: state.logged,
            initialData: action.data
        }
    }

    if(action.type === 'SET_CURRENT_MENU_BUTTON'){
        return {
            pending: state.pending,
            logged: state.logged,
            initialData: state.initialData,
            currentMenuButton: action.data
        }
    }

    // if (action.type === 'SET_GET_INITIAL_DATA_FINISHED'){
    //     return {
    //         getInitialDataing: false,
    //         initialData: action.data
    //     }
    // }

    return state;
}

export default loggedUserReducer