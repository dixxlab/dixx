import { T as C } from '../../theme/tokens';

export const Avatar = ({ name, photo, size = 40, onClick }) => {
  const initial = name && name[0] ? name[0].toUpperCase() : '?';
  return (
    <button onClick={onClick} disabled={!onClick} className="rounded-full flex items-center justify-center font-medium transition-transform active:scale-95 overflow-hidden"
      style={{ width: size, height: size, background: C.primary, color: C.primaryOn, fontSize: size * 0.4, cursor: onClick ? 'pointer' : 'default' }}>
      {photo ? <img src={photo} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
    </button>
  );
};
