import { Link, useNavigate } from 'react-router-dom';
import notFoundArtwork from '../../assets/images/404-background.png';
import styles from './NotFoundPage.module.css';
import Background from '../components/ui/Background';

function NotFoundPage() {
    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('/');
    };

    return (
        <main className={styles.page}>

            {/* Background UI  */}
            <Background />

            {/* Main container section */}
            <section className={styles.content} aria-labelledby="not-found-title">
                <div className={styles.illustration} aria-hidden="true">
                    <img src={notFoundArtwork} alt="" />
                </div>

                <h1 className={styles.title} id="not-found-title">This page isn't on the menu.</h1>
                <p className={styles.description}>
                    The link may be out of date, or this page may have moved. Head back or sign in to continue.
                </p>

                <div className={styles.actions}>
                    <button className={styles.primaryAction} type="button" onClick={handleGoBack}>

                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path
                                d="M3 10.5 12 3l9 7.5V21h-6v-7H9v7H3V10.5Z"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        <span>Home Page</span>
                    </button>
                    <Link className={styles.secondaryAction} to="/login">Login</Link>
                </div>

                <p className={styles.helpText}>New to Buy2Eat? <Link to="/register">Create an account</Link></p>
            </section>
        </main>
    );
}

export default NotFoundPage;