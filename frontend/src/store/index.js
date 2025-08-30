import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import transactionReducer from './slices/transactionSlice'

export default configureStore({
    reducer: {
        auth: authReducer,
        transactions: transactionReducer,
    },
})
