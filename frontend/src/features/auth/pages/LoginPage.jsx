import styles from './LoginPage.module.css';
import login_background from '../../../assets/images/login-background.avif';
import small_meal_dish from '../../../assets/images/small-meal-dish.webp';
import small_mint_leaf from '../../../assets/images/mint-leaf.png';

function LoginPage() {
    return (
        <>
            <header>
                {/* Header */}
            </header>
            <div className={styles.section}>
                <div className={styles.container}>
                    {/* Left Panel - Login Form */}
                    <div className={styles.leftPanel}>
                        <div className={styles.formContainer}>

                            <h1 className={styles.title}>
                                Great food is just <br />
                                <span className={styles.highlight}>one tap away.</span>
                            </h1>

                            <p className={styles.subtitle}>
                                Sign in to discover restaurants, track your orders, and enjoy exclusive deals.
                            </p>

                            <div className={styles.socialAuth}>
                                <button className={styles.socialButton}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Google
                                </button>
                            </div>

                            <div className={styles.divider}>
                                <span>Or sign in with email</span>
                            </div>

                            <form className={styles.form}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="email">Email address</label>
                                    <input type="email" id="email" placeholder="you@example.com" />
                                </div>

                                <div className={styles.inputGroup}>
                                    <div className={styles.passwordHeader}>
                                        <label htmlFor="password">Password</label>
                                        <a href="#" className={styles.forgotPassword}>Forgot password?</a>
                                    </div>
                                    <div className={styles.passwordInputContainer}>
                                        <input type="password" id="password" placeholder="Enter your password" />
                                        <button type="button" className={styles.eyeIcon}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.checkboxGroup}>
                                    <input type="checkbox" id="remember" />
                                    <label htmlFor="remember">Remember me </label>
                                </div>

                                <button type="submit" className={styles.submitButton}>
                                    <p>Login</p> <span>&rarr;</span>
                                </button>
                            </form>

                            <p className={styles.footerText}>
                                New to Buy2Eat? <a href="#">Create an account</a>
                            </p>
                        </div>
                        <img src={small_meal_dish} className={styles.subMealImage} alt="su" />
                        <img src={small_mint_leaf} className={styles.subLeafImage} alt="su" />
                    </div>

                    {/* Right Panel - Image & Widgets */}
                    <div className={styles.rightPanel}> 
                        <img src={login_background} alt="login_background" />
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginPage;