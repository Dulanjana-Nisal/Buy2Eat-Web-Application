import styles from './ErrorLayout.module.css';

function ErrorLayout({displayError}) {

    // check errors exist
    if(!displayError){
        return;
    }

    return (
        <>
            { 
             Object.keys(displayError?.fieldErrors).length == 0 &&
                <div className={styles.errorMessages}>
                    <p>{displayError?.message || "Something went wrong!. Please try again later."}</p>
                </div>
            }
        </>
    )
}

export default ErrorLayout;