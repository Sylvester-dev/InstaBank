import Box from '../Box';
import styles from './loading.module.scss'

export default function Loading({ message }) {
    return (
        <div className={styles.backdrop}>
            <div className={styles.loadingContainer}>
                <div className={`${styles.load} ${styles.load1}`}></div>
                <Box width="15" />
                <div className={`${styles.load} ${styles.load2}`}></div>
                <Box width="15" />
                <div className={`${styles.load} ${styles.load3}`}></div>
                <Box width="15" />
                <div className={`${styles.load} ${styles.load4}`}></div>
            </div>
            <Box height="20" />
            <div className={styles.message}>{message}</div>
        </div>
    );
}
