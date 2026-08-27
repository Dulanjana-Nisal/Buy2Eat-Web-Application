import styles from './RegisterPage.module.css';

function RegisterPage() {
    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Join <span>Buy2Eat</span> Marketplace</h1>
                    <p className={styles.subtitle}>Tell us how you want to use our platform</p>
                </div>

                <div className={styles.optionsGrid}>

                    {/* Customer / Buyer Card */}
                    <button className={`${styles.optionCard} ${styles.delay1}`}>
                        <div className={styles.imageWrapper}>
                            <img
                                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Delicious food spread"
                                className={styles.cardImage}
                            />
                            <div className={styles.badge}>For Foodies</div>
                        </div>

                        <div className={styles.cardContent}>
                            <h2 className={styles.cardTitle}>Order Food</h2>
                            <p className={styles.cardDescription}>
                                Discover local culinary gems, order fresh meals, and get them delivered straight to your door.
                            </p>
                            <div className={styles.cardAction}>
                                Continue as Customer
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </button>

                    {/* Vendor / Seller Card */}
                    <button className={`${styles.optionCard} ${styles.delay2}`}>
                        <div className={styles.imageWrapper}>
                            <img
                                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Chef working in a kitchen"
                                className={styles.cardImage}
                            />
                            <div className={styles.badge}>For Vendors</div>
                        </div>

                        <div className={styles.cardContent}>
                            <h2 className={styles.cardTitle}>Become a Partner</h2>
                            <p className={styles.cardDescription}>
                                Open your digital storefront, manage your menu, and grow your restaurant's reach effortlessly.
                            </p>
                            <div className={styles.cardAction}>
                                Continue as Vendor
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </button>

                </div>
            </div>
        </>
    )
}

export default RegisterPage;