# components/

Design system e UI compartilhada. Camada pura: sem logica de negocio, sem acesso a banco.

- `ui/`, primitives sobre Radix (Button, Input, Dialog, Table, etc.)
- `charts/`, wrappers Recharts usando tokens
- `layout/`, casca da aplicacao (shell, nav, breadcrumbs)
- `feedback/`, toast, empty state, skeleton

Componentes consomem tokens via classes Tailwind. Sem valores literais.
