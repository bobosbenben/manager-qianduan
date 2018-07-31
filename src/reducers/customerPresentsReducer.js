const initialState = {
    customerPresents:[]
}

const customerPresentsReducer = (state = initialState, action) => {

    if (action.type === '6') {
        return {
            customerPresents: action.customerPresents
        }
    }

    return state;
}

export default customerPresentsReducer