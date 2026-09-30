export const ErrorHandler = (error) => {
    // check if error repose is alive
    if(error.response){
        // get error response from api
        const errorData = error.response.data;

        // assign values for fieldErrors
        const fieldErrors = {}
        if(errorData.details && (errorData.details).length > 0){
            if(Array.isArray(errorData.details['field'])){
                (errorData.details['field']).forEach((element)=>{
                    fieldErrors[element] = errorData.details['issue']
                })
            }
        }
        
        return {
            type: "api",
            status: errorData.status ?? error.response.status, // if status code not defined, add default status code
            code: errorData.code ?? "UNKNOWN_ERROR_CODE",
            message: errorData.message ?? "Something went wrong!. Please try again later.",
            fieldErrors,
        }
    }

}