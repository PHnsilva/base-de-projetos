import { deepEqual, equal } from "node:assert/strict";
import { test } from "node:test";
import { decidirPedido, faixaFuturaValida, faixasSobrepostas } from "./regras.mjs";

const pedido = Object.freeze({ id: "R1", recursoId: "E1", inicio: 200, fim: 300, estado: "pendente" });
const responsavel = { id: "A1", papel: "responsavel", recursos: ["E1"] };
const confirmar = { tipo: "confirmar" };
const agora = 100;

test("CT-01 aceita faixa futura válida", () => equal(faixaFuturaValida(200, 300, agora), true));
test("CT-02 rejeita faixas passadas, invertidas, vazias e inválidas", () => {
  for (const [inicio, fim] of [[90, 300], [100, 300], [300, 200], [200, 200], [NaN, 300]]) {
    equal(faixaFuturaValida(inicio, fim, agora), false);
  }
});
test("CT-03 confirma faixa livre e registra trilha sem mutar o pedido", () => {
  deepEqual(decidirPedido(pedido, confirmar, responsavel, [], agora), {
    pedido: { ...pedido, estado: "confirmado", decididoPor: "A1", decididoEm: agora },
  });
  equal(pedido.estado, "pendente");
});
test("CT-03 exige motivo para recusa e registra o motivo válido", () => {
  deepEqual(decidirPedido(pedido, { tipo: "recusar", motivo: " " }, responsavel, [], agora), {
    erro: "motivo-obrigatorio",
  });
  deepEqual(decidirPedido(pedido, { tipo: "recusar", motivo: " Manutenção " }, responsavel, [], agora), {
    pedido: { ...pedido, estado: "recusado", decididoPor: "A1", decididoEm: agora, motivo: "Manutenção" },
  });
});
test("CT-05 exige papel e vínculo", () => {
  for (const ator of [{ ...responsavel, papel: "associado" }, { ...responsavel, recursos: ["E2"] }]) {
    deepEqual(decidirPedido(pedido, confirmar, ator, [], agora), { erro: "acesso-negado" });
  }
});
test("CT-06 permite intervalos adjacentes e equipamentos distintos", () => {
  const confirmados = [
    { recursoId: "E1", inicio: 100, fim: 200 },
    { recursoId: "E1", inicio: 300, fim: 400 },
    { recursoId: "E2", inicio: 200, fim: 300 },
  ];
  equal(decidirPedido(pedido, confirmar, responsavel, confirmados, agora).pedido.estado, "confirmado");
});
test("RF-03 detecta uma confirmação sobreposta já observada", () => {
  const outra = { recursoId: "E1", inicio: 250, fim: 330 };
  equal(faixasSobrepostas(pedido, outra), true);
  deepEqual(decidirPedido(pedido, confirmar, responsavel, [outra], agora), { erro: "faixa-ocupada" });
});
test("CT-09 preserva a decisão anterior", () => {
  const decidido = { ...pedido, estado: "recusado" };
  deepEqual(decidirPedido(decidido, confirmar, responsavel, [], agora), { erro: "estado-invalido" });
  equal(decidido.estado, "recusado");
});
