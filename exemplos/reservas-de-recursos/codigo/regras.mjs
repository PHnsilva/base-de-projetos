export function faixaFuturaValida(inicio, fim, agora) {
  return [inicio, fim, agora].every(Number.isSafeInteger) && agora < inicio && inicio < fim;
}

export function faixasSobrepostas(uma, outra) {
  return uma.inicio < outra.fim && outra.inicio < uma.fim;
}

export function decidirPedido(pedido, acao, responsavel, confirmados, agora) {
  if (responsavel.papel !== "responsavel" || !responsavel.recursos.includes(pedido.recursoId)) {
    return { erro: "acesso-negado" };
  }
  if (pedido.estado !== "pendente") return { erro: "estado-invalido" };

  const trilha = { decididoPor: responsavel.id, decididoEm: agora };
  if (acao.tipo === "recusar") {
    const motivo = typeof acao.motivo === "string" ? acao.motivo.trim() : "";
    if (!motivo) return { erro: "motivo-obrigatorio" };
    return { pedido: { ...pedido, ...trilha, estado: "recusado", motivo } };
  }
  if (acao.tipo !== "confirmar") return { erro: "acao-invalida" };

  const ocupado = confirmados.some((confirmado) =>
    confirmado.recursoId === pedido.recursoId && faixasSobrepostas(pedido, confirmado),
  );
  if (ocupado) return { erro: "faixa-ocupada" };

  return { pedido: { ...pedido, ...trilha, estado: "confirmado" } };
}
