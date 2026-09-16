import { T as C } from '../../theme/tokens';

export const Avatar = ({ name, photo, size = 40, onClick }) => {
  const initial = name && name[0] ? name[0].toUpperCase() : '?';
  const content = photo
    ? <img src={photo} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : initial;
  const className = 'rounded-full flex items-center justify-center font-medium overflow-hidden';
  const style = { width: size, height: size, background: C.primary, color: C.primaryOn, fontSize: size * 0.4 };

  // Sem onClick não é controle: vira span. Além de mais correto pra leitor de
  // tela que um <button disabled>, permite usar o avatar dentro de outro botão
  // — é assim que ele entra na aba de perfil da navegação.
  if (!onClick) {
    return <span className={className} style={{ ...style, display: 'flex', flexShrink: 0 }}>{content}</span>;
  }
  return (
    <button onClick={onClick} className={`${className} transition-transform active:scale-95`} style={{ ...style, cursor: 'pointer' }}>
      {content}
    </button>
  );
};
