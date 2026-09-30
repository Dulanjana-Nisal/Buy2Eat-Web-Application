export const ErrorHandler = (error) => {
    // check if error repose is alive
    if (error.response) {
        // get error response from api
        const errorData = error.response.data;

        // assign values for fieldErrors
        /*
            * this kind a api response 

            "details": [
                {
                "field": ["email","password"],
                "issue": "input not be empty"
                }
            ]  

            * should tern in to 

            fieldErrors : {
                email: 'input not be empty',
                password: 'input not be empty'
            }

            like that
        */
        let fieldErrors = {}
        if (errorData.details && errorData.details != []) {
            const detailsData = errorData.details[0] ?? [];
            if (Array.isArray(detailsData['fields']) && detailsData['fields'] != []) {
                (detailsData['fields']).forEach((element) => {
                    if (detailsData['issue']) {
                        fieldErrors[element] = detailsData['issue'];
                    }
                });
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

    // check if have connection error
    if (error.request) {
        return {
            type: "network",
            status: null,
            code: "NETWORK_ERROR",
            message: "Unable to connect to the server. Please check your internet connection.",
            fieldErrors: {}
        }
    }

    // if something else
    return {
        type: "Unknown",
        status: null,
        code: "UNKNOWN_ERROR",
        message: "Something went wrong!. Please try again later.",
        fieldErrors: {}
    }

}