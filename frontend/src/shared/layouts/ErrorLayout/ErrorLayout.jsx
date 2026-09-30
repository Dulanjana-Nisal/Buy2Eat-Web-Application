import styles from './ErrorLayout.module.css';

function ErrorLayout() {
    return (
        <div className={styles.errorMessages}>
            <p>Some Error message here</p>
        </div>
    )
}

export default ErrorLayout;