import { T as C } from '../../theme/tokens';

/* Título de seção como hierarquia de verdade: tamanho e peso na cor do texto,
   em caixa de frase. Substitui o rótulo decorativo em caixa alta com
   letter-spacing que era usado como muleta acima de cada bloco. */
export const SectionTitle = ({ children, className = '' }) => (
  <h2 className={`text-[15px] font-medium ${className}`} style={{ color: C.text }}>{children}</h2>
);
