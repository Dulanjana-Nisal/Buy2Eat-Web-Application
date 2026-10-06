import styles from './ErrorLayout.module.css';

function ErrorLayout({message}) {
    return (
        <div className={styles.errorMessages}>
            <p>{message}</p>
        </div>
    )
}

export default ErrorLayout;