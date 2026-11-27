# Perfis de acesso

O portal combina papel, relação com o equipamento e propriedade do pedido. Uma pessoa pode acumular papéis. As permissões abaixo são do MVP fictício.

| Ação | Pessoa sem sessão | Associado | Responsável pelo equipamento |
| --- | --- | --- | --- |
| Solicitar reserva | Autenticação exigida | Pode solicitar recurso elegível | Pode quando também atua como associado |
| Consultar histórico individual | Autenticação exigida | Somente seus pedidos | Somente seus pedidos quando atua como associado |
| Consultar fila de decisão | Autenticação exigida | Sem permissão de decisão | Somente para recursos sob sua responsabilidade |
| Confirmar ou recusar | Autenticação exigida | Sem permissão de decisão | Somente pedido pendente do recurso vinculado |
| Administrar catálogo | Fora do MVP | Fora do MVP | Fora do MVP |

A API deriva identidade da sessão. O frontend pode ocultar ações indisponíveis. No servidor, confirme vínculo ativo e estado antes de decidir e filtre histórico pelo proprietário. Registre autor e horário da decisão persistida. Veja [RAS-02](especificacao.md#requisitos-arquiteturalmente-significativos-ras), CT-05 e CT-07.
