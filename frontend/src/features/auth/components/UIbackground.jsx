import styles from './UIbackground.module.css';
import mini_leaf from '../../../assets/images/mini_leaf_transparent.webp';
import mini_tomato from '../../../assets/images/tomato-transparent.webp';

function UIbackground() {
    return (
        <>
            <img src={mini_leaf} alt="" className={styles.mini_leaf_1} />
            <img src={mini_tomato} alt="" className={styles.mini_tomato_1} />
            <img src={mini_leaf} alt="" className={styles.mini_leaf_2} />
            <img src={mini_tomato} alt="" className={styles.mini_tomato_2} />
        </>
    )
}

export default UIbackground;