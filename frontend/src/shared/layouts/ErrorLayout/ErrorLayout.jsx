import styles from './ErrorLayout.module.css';

function ErrorLayout() {
    return (
        <div className={styles.errorMessages}>
            <p>Some error message here</p>
        </div>
    )
}

export default ErrorLayout;