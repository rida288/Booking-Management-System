import { Link } from 'react-router-dom';

const HotelsPage = () => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Hotels</h1>
        <p style={styles.text}>
          This page is under construction. Use the navigation links to explore the app or log in to see hotel listings.
        </p>
        <Link to="/" style={styles.link}>Back to Home</Link>
      </div>
    </div>
  );
};

const styles = {
  wrapper: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f2f5' },
  card: { maxWidth:'640px', padding:'40px', background:'#fff', borderRadius:'16px', boxShadow:'0 10px 30px rgba(0,0,0,0.08)', textAlign:'center' },
  title: { margin:'0 0 16px', fontSize:'32px' },
  text: { color:'#555', lineHeight:1.6, marginBottom:'24px' },
  link: { display:'inline-block', padding:'12px 24px', background:'#e94560', color:'#fff', borderRadius:'8px', textDecoration:'none', fontWeight:600 },
};

export default HotelsPage;
