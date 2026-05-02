const colors = {
  PENDING: { bg:'#fff3cd', color:'#856404' },
  CONFIRMED: { bg:'#d1ecf1', color:'#0c5460' },
  COMPLETED: { bg:'#d4edda', color:'#155724' },
  CANCELLED: { bg:'#f8d7da', color:'#721c24' },
  NO_SHOW: { bg:'#e2e3e5', color:'#383d41' },
  OPEN: { bg:'#f8d7da', color:'#721c24' },
  IN_PROGRESS: { bg:'#fff3cd', color:'#856404' },
  RESOLVED: { bg:'#d4edda', color:'#155724' },
};

const StatusBadge = ({ status }) => {
  const style = colors[status] || { bg:'#e2e3e5', color:'#383d41' };
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: '3px 10px', borderRadius: '12px',
      fontSize: '12px', fontWeight: '600'
    }}>
      {status}
    </span>
  );
};

export default StatusBadge;