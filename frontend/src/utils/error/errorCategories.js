export const errorCategories = (error) => {
    switch(error.code){
        case('VALIDATION_FIELD_REQUIRED'):
        case('VALIDATION_PASSWORD_TOO_WEAK'):
        case('VALIDATION_FIELD_TOO_SHORT'):
        case('VALIDATION_INVALID_SELECTION'):
        case('AUTH_INVALID_CREDENTIALS'):
        case('RESOURCE_NOT_FOUND'):
        case('VALIDATION_EXPIRED_VALUE'):
        case('VALIDATION_INVALID_FORMAT'):
            return ""
        default:
            return "UNKNOWN_ERROR";
    }
}