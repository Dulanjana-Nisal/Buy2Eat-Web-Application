import styles from './RegisterPage.module.css';
import mini_leaf from '../../../assets/images/mini_leaf_transparent.webp';
import mini_tomato from '../../../assets/images/tomato-transparent.webp';
import customer_card from '../../../assets/images/customer-card.svg';
import seller_card from '../../../assets/images/seller-card.svg';

function RegisterPage() {
    const trustItems = [
        { icon: 'shield', label: 'Secure & Trusted', desc: 'Your data is safe with us' },
        { icon: 'bolt', label: 'Fast & Reliable', desc: 'Quick delivery & support' },
        { icon: 'star', label: 'Quality Assured', desc: 'Best food, best experience' },
        { icon: 'support', label: '24/7 Support', desc: "We're here to help" },
    ];

    return (
        <>
            <div className={styles.container}>

                {/* background mini transparent images */}
                <img src={mini_leaf} alt="mini_leaf_image" className={styles.mini_leaf_1} />
                <img src={mini_tomato} alt="mini_tomato_image" className={styles.mini_tomato_1} />
                <img src={mini_leaf} alt="mini_leaf_image" className={styles.mini_leaf_2} />
                <img src={mini_tomato} alt="mini_tomato_image" className={styles.mini_tomato_2} />
                
                <div className={styles.header}>
                    <h1 className={styles.title}>Join <span>Buy2Eat</span> Marketplace</h1>
                    <p className={styles.subtitle}>Tell us how you want to use our platform <span className={styles.heart}>♥</span></p>
                </div>

                <div className={styles.optionsGrid}>
                    <button className={`${styles.optionCard} ${styles.delay1}`}>
                        <div className={styles.imageWrapper}>
                            <img
                                src="https://www.soulsrilanka.com/image/trip/05/01.jpg"
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

                    <button className={`${styles.optionCard} ${styles.delay2}`}>
                        <div className={styles.imageWrapper}>
                            <img
                                src="https://media.istockphoto.com/id/666908954/photo/handsome-chef-pouring-olive-oil-on-meal.jpg?s=612x612&w=0&k=20&c=2dU_sMyn3GM2N81m-tMWQ4y5frBp87GQCflUtauJM4k="
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
                </div>

                {/* <div className={styles.trustBar}>
                    {trustItems.map((item) => (
                        <div key={item.label} className={styles.trustItem}>
                            <div className={styles.trustIconWrap}>
                                {item.icon === 'shield' && (
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.8-3 8.8-7 10-4-1.2-7-5.2-7-10V6l7-3zm0 5l-2.3 5.2L4 13.2l4.4 3.2L7 21l5-2.7L17 21l-.4-4.6 4.4-3.2-5.7-.2L12 8z" /></svg>
                                )}
                                {item.icon === 'bolt' && (
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 13h5l-1 9 9-11h-5l1-9z" /></svg>
                                )}
                                {item.icon === 'star' && (
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 0 6.5 18.7l1.1-6.2L3.1 9.1l6.2-.9L12 2.5z" /></svg>
                                )}
                                {item.icon === 'support' && (
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 1 9 9v4.5A2.5 2.5 0 0 1 18.5 19H17v-5h2.5v-3a7.5 7.5 0 0 0-15 0v3H7v5h-1.5A2.5 2.5 0 0 1 3 16.5V12a9 9 0 0 1 9-9zm-7 11v3h2v-3H5zm12 0v3h2v-3h-2z" /></svg>
                                )}
                            </div>
                            <div className={styles.trustText}>
                                <strong>{item.label}</strong>
                                <span>{item.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.bottomBadge}><span>✓</span> Trusted by thousands of food lovers and local businesses</div> */}
            </div>
        </>
    )
}

export default RegisterPage;