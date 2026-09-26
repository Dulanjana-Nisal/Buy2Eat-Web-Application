import { Link, useNavigate } from 'react-router-dom';
import mealImage from '../../assets/images/small-meal-dish.webp';
import styles from './NotFoundPage.module.css';
import Background from '../components/ui/background';

function NotFoundPage() {
    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate(window.history.length > 1 ? -1 : '/login');
    };

    return (
        <main className={styles.page}>

            {/* Background UI  */}
            <Background />

            {/* Header */}
            <header className={styles.header}>
                <Link className={styles.brand} to="/login" aria-label="Buy2Eat sign in">
                    <span className={styles.brandMark} aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M7 3v7m-3-7v4a3 3 0 0 0 6 0V3m-3 7v11M17 3v18m0-18c-2 2-3 4.5-3 7h3" />
                        </svg>
                    </span>
                    <span>Buy2Eat</span>
                </Link>
                <Link className={styles.headerLink} to="/login">Sign in</Link>
            </header>

            {/* Main container section */}
            <section className={styles.content} aria-labelledby="not-found-title">
                <div className={styles.illustration} aria-hidden="true">
                    <span className={`${styles.number} ${styles.leftNumber}`}>4</span>
                    <div className={styles.plate}>
                        <img src={mealImage} alt="" />
                    </div>
                    <span className={`${styles.number} ${styles.rightNumber}`}>4</span>
                    <span className={styles.sparkleOne} />
                    <span className={styles.sparkleTwo} />
                    <span className={styles.dash} />
                </div>

                <p className={styles.eyebrow}>404 / Page not found</p>
                <h1 className={styles.title} id="not-found-title">This page isn't on the menu.</h1>
                <p className={styles.description}>
                    The link may be out of date, or the page may have moved. Let's get you somewhere delicious.
                </p>

                <div className={styles.actions}>
                    <button className={styles.primaryAction} type="button" onClick={handleGoBack}>
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M19 12H5m6 6-6-6 6-6" />
                        </svg>
                        <span>Go back</span>
                    </button>
                    <Link className={styles.secondaryAction} to="/login">Sign in</Link>
                </div>

                <p className={styles.helpText}>New to Buy2Eat? <Link to="/register">Create an account</Link></p>
            </section>

            <footer className={styles.footer}>
                <span>Good food is never far away.</span>
                <span>Buy2Eat</span>
            </footer>
        </main>
    );
}

export default NotFoundPage;