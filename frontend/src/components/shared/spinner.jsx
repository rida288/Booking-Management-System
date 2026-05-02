const Spinner = ({ size = 40 }) => (
  <div style={{ display:'flex', justifyContent:'center', padding:'40px' }}>
    <div style={{
      width: size, height: size,
      border: '4px solid #e0e0e0',
      borderTop: '4px solid #e94560',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default Spinner;