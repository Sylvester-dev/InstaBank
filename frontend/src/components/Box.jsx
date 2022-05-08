export default function Box({ height, width }) {
    return (
        <div style={{ height: parseFloat(parseInt(height) / 10) + 'rem', width: parseFloat(parseInt(width) / 10) + 'rem' }}></div>
    );
} 