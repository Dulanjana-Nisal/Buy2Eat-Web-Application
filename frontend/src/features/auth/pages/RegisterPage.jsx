import styles from './RegisterPage.module.css';
import { Link } from 'react-router-dom';
import customer_card from '../../../assets/images/customer-card.svg';
import seller_card from '../../../assets/images/seller-card.svg';
import customer_register from '../../../assets/images/customer-register-background.jpg';
import seller_register from '../../../assets/images/seller-register-background.jpg';
import UIbackground from '../components/UIbackground';

function RegisterPage() {
    return (
        <>
            <div className={styles.container}>

                {/* background mini transparent images */}
                <UIbackground />

                {/* Registration Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Join <span>Buy2Eat</span> Marketplace</h1>
                    <p className={styles.subtitle}>Tell us how you want to use our platform
                        <span className={styles.heart}>
                            <svg fill="currentColor" viewBox="0 0 512 512" id="_x30_1" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M471.079,77.334c-46.964-52.452-127.837-55.735-177.137-5.541C268.648,97.547,256,131.784,256,166.021 c0-34.237-12.647-68.473-37.942-94.227c-49.3-50.195-130.173-46.912-177.138,5.541c-106.53,118.98,7.88,303.709,194.087,393.846 c13.275,6.426,28.709,6.426,41.985,0C463.2,381.043,577.61,196.314,471.079,77.334z"></path></g></svg>
                        </span>
                    </p>
                </div>

                {/* Registration cards grid */}
                <div className={styles.optionsGrid}>

                    {/* Customers registration card */}
                    <Link to="/register/customer">
                        <button className={`${styles.optionCard} ${styles.delay1}`}>
                            <div className={styles.imageWrapper}>
                                <img
                                    src={customer_register}
                                    className={styles.cardImage}
                                    alt="Food platter"
                                />
                                <div className={styles.badge}>
                                    <span className={styles.badgeIcon}>
                                        <svg viewBox="0 0 640 640" fill="currentColor">
                                            <path d="M127.9 78.4C127.1 70.2 120.2 64 112 64S96.9 70.2 96 78.3L81.9 213.7C80.6 219.7 80 225.8 80 231.9c0 45.9 35.1 83.6 80 87.7V544c0 17.7 14.3 32 32 32s32-14.3 32-32V319.6c44.9-4.1 80-41.8 80-87.7 0-6.1-.6-12.2-1.9-18.2L287.9 78.3C287.1 70.2 280.2 64 272 64s-15.1 6.2-15.9 14.4l-13.6 135.5c-.6 5.7-5.4 10.1-11.1 10.1-5.8 0-10.6-4.4-11.2-10.2L207.9 78.6C207.2 70.3 200.3 64 192 64s-15.2 6.3-15.9 14.6l-12.3 135.2c-.5 5.8-5.4 10.2-11.2 10.2s-10.6-4.4-11.1-10.1L127.9 78.4zM512 64c-16 0-128 32-128 176v112c0 35.3 28.7 64 64 64h32v128c0 17.7 14.3 32 32 32s32-14.3 32-32V96c0-17.7-14.3-32-32-32z" />
                                        </svg>
                                    </span>
                                    For Foodies
                                </div>
                            </div>

                            <div className={styles.cardContent}>
                                <h2 className={styles.cardTitle}>Order Foods</h2>
                                <p className={styles.cardDescription}>
                                    Discover local culinary gems, order fresh meals,
                                    and get them delivered straight to your door.
                                </p>
                                <div className={styles.cardAction}>
                                    Continue as Customer
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                                <img src={customer_card} alt="customer-card" className={styles.customer_card} />
                            </div>
                        </button>
                    </Link>

                    {/* Seller registration card */}
                    <Link to='/register/seller'>
                        <button className={`${styles.optionCard} ${styles.delay2}`}>
                            <div className={styles.imageWrapper}>
                                <img
                                    src={seller_register}
                                    className={styles.cardImage}
                                    alt="Chef plating food"
                                />
                                <div className={styles.badge}>
                                    <span className={styles.badgeIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="currentColor" d="M53.5 245.1L110.3 131.4C121.2 109.7 143.3 96 167.6 96L472.5 96C496.7 96 518.9 109.7 529.7 131.4L586.5 245.1C590.1 252.3 592 260.2 592 268.3C592 295.6 570.8 318 544 319.9L544 512C544 529.7 529.7 544 512 544C494.3 544 480 529.7 480 512L480 320L384 320L384 496C384 522.5 362.5 544 336 544L144 544C117.5 544 96 522.5 96 496L96 319.9C69.2 318 48 295.6 48 268.3C48 260.3 49.9 252.3 53.5 245.1zM160 320L160 432C160 440.8 167.2 448 176 448L304 448C312.8 448 320 440.8 320 432L320 320L160 320z" /></svg>
                                    </span>
                                    For Sellers
                                </div>
                            </div>

                            <div className={styles.cardContent}>
                                <h2 className={styles.cardTitle}>Become a Seller</h2>
                                <p className={styles.cardDescription}>
                                    Open your digital storefront, manage your menu,
                                    and grow your shop's reach effortlessly.
                                </p>
                                <div className={styles.cardAction}>
                                    Continue as Seller
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                                <img src={seller_card} alt="seller-card" className={styles.seller_card} />
                            </div>
                        </button>
                    </Link>
                </div>
            </div>
        </>
    )
}

export default RegisterPage;