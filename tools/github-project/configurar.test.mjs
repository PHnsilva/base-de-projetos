import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { applyPlan, buildPlan } from "./configurar.mjs";

const seed = JSON.parse(readFileSync(new URL("./reservas.json", import.meta.url)));
const plan = buildPlan(seed, "2027-01-11");
const project = "users/PHnsilva/projectsV2/13";
const repo = "repos/PHnsilva/base-de-projetos";

function mockGitHub(login = "PHnsilva") {
  const fields = [], milestones = [], cards = [], writes = [];
  const issueData = new Map(seed.items.map(({ issue }) => [issue, {
    number: issue, id: 10000 + issue, type: null, milestone: null, labels: [{ name: "exemplo" }], links: [],
  }]));
  const aliases = {
    Sprint: ["sprint", "iterationId"], Prioridade: ["priority", "optionId"],
    Tamanho: ["size", "optionId"], Funcionalidade: ["feature", "optionId"], Peso: ["weight", "number"],
    "Início planejado": ["start", "date"], "Entrega planejada": ["end", "date"],
  };
  let configuration;
  function api(endpoint, { method = "GET", data, paginated } = {}) {
    const path = endpoint.split("?")[0];
    if (method !== "GET" && path !== "graphql") writes.push({ path, method, data });
    if (path === "user") return { login };
    if (path === project && method === "GET") return { number: 13 };
    if (path === project + "/fields") {
      if (method === "GET" && paginated) return fields;
      assert.equal(method, "POST");
      const field = {
        id: 200 + fields.length,
        name: data.name,
        data_type: data.data_type,
        options: data.single_select_options?.map(({ name, color }, i) => ({ name: { raw: name }, color, id: "option-" + i })),
      };
      if (data.name === "Sprint") {
        assert.equal(data.iteration_configuration.duration, 7);
        configuration = {
          iterations: data.iteration_configuration.iterations.map((s, i) => ({
            id: "iteration-" + i, title: s.title, startDate: s.start_date, duration: s.duration,
          })), completedIterations: [],
        };
      }
      fields.push(field);
      return field;
    }
    if (path === repo + "/milestones") {
      if (method === "GET" && paginated) return milestones;
      assert.equal(method, "POST");
      const milestone = { number: milestones.length + 1, ...data };
      milestones.push(milestone);
      return milestone;
    }
    if (path === project + "/items") {
      if (method === "GET" && paginated) return cards;
      assert.equal(method, "POST");
      assert.equal(data.type, "Issue");
      const card = { id: 300 + cards.length, node_id: "card-" + data.id, content: { id: data.id }, values: {} };
      cards.push(card);
      return card;
    }
    if (path.startsWith(project + "/items/") && method === "PATCH") {
      const id = Number(path.split("/").at(-1));
      const card = cards.find((card) => card.id === id);
      for (const { id: fieldId, value } of data.fields) {
        const field = fields.find((field) => field.id === fieldId);
        const [alias, member] = aliases[field.name];
        card.values[alias] = { [member]: value };
      }
      return card;
    }
    if (path === "graphql" && method === "POST") {
      if (data.variables.owner) return { data: { user: { projectV2: { field: { configuration } } } } };
      return { data: { node: cards.find((card) => card.node_id === data.variables.id).values } };
    }
    const match = path.match(/\/issues\/(\d+)(\/dependencies\/blocked_by)?$/);
    if (!match) throw new Error("Rota inesperada " + method + " " + endpoint);
    const issue = issueData.get(Number(match[1]));
    if (match[2]) {
      if (method === "GET" && paginated) return issue.links.map((id) => ({ id }));
      assert.equal(method, "POST");
      issue.links.push(data.issue_id);
      return null;
    }
    if (method === "PATCH") {
      issue.type = { name: data.type };
      issue.milestone = milestones.find((m) => m.number === data.milestone);
    }
    return issue;
  }
  return { api, writes, issueData, cards, milestones };
}

test("o plano tem 4 sprints, 12 issues e 16 bloqueios ordenados", () => {
  assert.equal(plan.sprints.length, 4);
  assert.equal(plan.items.length, 12);
  assert.equal(plan.items.reduce((sum, issue) => sum + issue.blockedBy.length, 0), 16);
  assert.equal(plan.sprints[3].endDate, "2027-02-07");
  assert.throws(() => buildPlan(seed, "2027-02-29"), /data inicial/);
  const broken = structuredClone(seed);
  broken.items[0].blockedBy = [15];
  assert.throws(() => buildPlan(broken, "2027-01-11"), /sem precedência/);
});

test("a configuração preenche dados nativos e é idempotente", () => {
  const service = mockGitHub();
  applyPlan(plan, service.api, () => {});
  assert.equal(service.cards.length, 12);
  assert.equal(service.milestones.length, 2);
  assert.equal(service.issueData.get(4).type.name, "Bug");
  assert.deepEqual(service.issueData.get(4).links, [10005, 10011]);
  assert.equal(service.cards.find((card) => card.content.id === 10004).values.sprint.iterationId, "iteration-1");
  const count = service.writes.length;
  assert.ok(count > 20);
  applyPlan(plan, service.api, () => {});
  assert.equal(service.writes.length, count);
});

test("uma conta diferente é recusada antes de qualquer escrita", () => {
  const service = mockGitHub("conta-diferente");
  assert.throws(() => applyPlan(plan, service.api), /conta proprietária/);
  assert.equal(service.writes.length, 0);
});
