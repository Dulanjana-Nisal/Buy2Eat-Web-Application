import styles from './ErrorLayout.module.css';

function ErrorLayout({ displayError, hasInlineFieldError = false }) {

    // check errors exist
    if(!displayError){
        return;
    }

    return (
        <>
            { 
             !hasInlineFieldError &&
                <div className={styles.errorMessages}>
                    <p>{displayError?.message || "Something went wrong!. Please try again later."}</p>
                </div>
            }
        </>
    )
}

export default ErrorLayout;