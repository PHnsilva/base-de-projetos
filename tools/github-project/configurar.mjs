import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const seedFile = new URL("./reservas.json", import.meta.url);
const apiVersion = "2026-03-10";
const duration = 7;

function addDays(start, days) {
  const date = new Date(start + "T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function buildPlan(seed, start) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || Number.isNaN(Date.parse(start)) || addDays(start, 0) !== start) {
    throw new Error("Informe a data inicial no formato AAAA-MM-DD.");
  }
  const sprints = seed.sprints.map((sprint, index) => {
    const startDate = addDays(start, index * duration);
    return { ...sprint, startDate, endDate: addDays(startDate, duration - 1) };
  });
  const dates = new Map(sprints.map((sprint) => [sprint.name, sprint]));
  const items = seed.items.map((item) => {
    const sprint = dates.get(item.sprint);
    if (!sprint || item.start < 0 || item.end < item.start || item.end >= duration) {
      throw new Error("Janela de issue inválida #" + item.issue);
    }
    return {
      ...item, milestone: sprint.milestone,
      startDate: addDays(sprint.startDate, item.start),
      endDate: addDays(sprint.startDate, item.end),
    };
  });
  const byIssue = new Map(items.map((item) => [item.issue, item]));
  if (byIssue.size !== items.length) throw new Error("Há números de issues duplicados.");
  for (const item of items) {
    for (const prerequisite of item.blockedBy) {
      if (!byIssue.has(prerequisite) || byIssue.get(prerequisite).endDate >= item.startDate) {
        throw new Error("Dependência sem precedência no calendário #" + item.issue + " → #" + prerequisite);
      }
    }
  }
  return { ...seed, sprints, items };
}

function gh(endpoint, { method = "GET", data, paginated = false } = {}) {
  const args = ["api", endpoint, "--method", method, "--hostname", "github.com",
    "-H", "Accept: application/vnd.github+json", "-H", "X-GitHub-Api-Version: " + apiVersion];
  if (paginated) args.push("--paginate", "--slurp");
  if (data) args.push("--input", "-");
  const result = spawnSync("gh", args, { encoding: "utf8", input: data ? JSON.stringify(data) : undefined });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(endpoint + " · " + result.stderr.trim());
  if (!result.stdout.trim()) return null;
  const value = JSON.parse(result.stdout);
  if (value.errors?.length) throw new Error(value.errors.map((error) => error.message).join("\n"));
  return paginated ? value.flat() : value;
}

const issueFieldsQuery = "query($id: ID!) { node(id:$id) { ... on ProjectV2Item { " +
  'sprint: fieldValueByName(name:"Sprint") { ... on ProjectV2ItemFieldIterationValue { iterationId } } ' +
  'priority: fieldValueByName(name:"Prioridade") { ... on ProjectV2ItemFieldSingleSelectValue { optionId } } ' +
  'size: fieldValueByName(name:"Tamanho") { ... on ProjectV2ItemFieldSingleSelectValue { optionId } } ' +
  'feature: fieldValueByName(name:"Funcionalidade") { ... on ProjectV2ItemFieldSingleSelectValue { optionId } } ' +
  'weight: fieldValueByName(name:"Peso") { ... on ProjectV2ItemFieldNumberValue { number } } ' +
  'start: fieldValueByName(name:"Início planejado") { ... on ProjectV2ItemFieldDateValue { date } } ' +
  'end: fieldValueByName(name:"Entrega planejada") { ... on ProjectV2ItemFieldDateValue { date } } ' +
  "} } }";

const iterationsQuery = "query($owner:String!, $number:Int!) { user(login:$owner) { " +
  'projectV2(number:$number) { field(name:"Sprint") { ... on ProjectV2IterationField { configuration { ' +
  "iterations {id title startDate duration} completedIterations {id title startDate duration} " +
  "} } } } } }";

export function applyPlan(plan, api = gh, log = console.log) {
  const req = (path, method, data) => api(path, { method, data });
  const list = (path) => api(path + (path.includes("?") ? "&" : "?") + "per_page=100", { paginated: true });
  const graph = (query, variables) => req("graphql", "POST", { query, variables }).data;

  const account = req("user");
  if (account.login.toLowerCase() !== plan.owner.toLowerCase()) {
    throw new Error("Entre na conta proprietária do projeto antes de aplicar.");
  }
  const repository = "repos/" + plan.owner + "/" + plan.repository;
  const project = "users/" + plan.owner + "/projectsV2/" + plan.project;
  req(project);
  const issues = new Map(plan.items.map((item) => {
    const issue = req(repository + "/issues/" + item.issue);
    if (issue.pull_request || !issue.labels.some((label) => label.name === "exemplo")) {
      throw new Error("Issue fora do conjunto didático #" + issue.number);
    }
    return [issue.number, issue];
  }));

  const fields = new Map(list(project + "/fields").map((field) => [field.name, field]));
  const iterations = () => {
    const data = graph(iterationsQuery, { owner: plan.owner, number: plan.project });
    const config = data.user?.projectV2?.field?.configuration;
    if (!config) throw new Error("A configuração de Sprint não pôde ser consultada.");
    return new Map([...config.iterations, ...config.completedIterations].map((sprint) => [sprint.title, sprint]));
  };
  const verifyIterations = (actual) => {
    for (const sprint of plan.sprints) {
      const value = actual.get(sprint.name);
      if (value?.startDate !== sprint.startDate || value?.duration !== duration) {
        throw new Error("Configuração de sprint divergente em " + sprint.name);
      }
    }
  };
  if (fields.has("Sprint")) verifyIterations(iterations());

  const types = [
    ["Sprint", { data_type: "iteration", iteration_configuration: {
      start_date: plan.sprints[0].startDate, duration,
      iterations: plan.sprints.map((sprint) => ({ title: sprint.name, start_date: sprint.startDate, duration })),
    } }],
    ...Object.entries(plan.options).map(([name, values]) => [name, {
      data_type: "single_select",
      single_select_options: values.map(([name, color]) => ({ name, color, description: "" })),
    }]),
    ["Peso", { data_type: "number" }],
    ["Início planejado", { data_type: "date" }],
    ["Entrega planejada", { data_type: "date" }],
  ];
  const optionName = (option) => option.name?.raw ?? option.name;
  function verifyField(name, expected, actual) {
    if (actual.data_type !== expected.data_type || expected.single_select_options?.some((option) =>
      !actual.options?.some((existing) => optionName(existing) === option.name && existing.color === option.color))) {
      throw new Error("Campo incompatível: " + name + ". Confira tipo, nomes e cores no Project.");
    }
  }
  for (const [name, spec] of types) {
    if (fields.has(name)) verifyField(name, spec, fields.get(name));
  }
  for (const [name, spec] of types) {
    if (!fields.has(name)) {
      const created = req(project + "/fields", "POST", { name, ...spec });
      verifyField(name, spec, created);
      fields.set(name, created);
    }
  }
  const sprintValues = iterations();
  verifyIterations(sprintValues);

  const currentMilestones = new Map(list(repository + "/milestones?state=all").map((item) => [item.title, item]));
  for (const sprint of plan.sprints) {
    if (!currentMilestones.has(sprint.milestone)) {
      const last = plan.sprints.filter((item) => item.milestone === sprint.milestone).at(-1);
      currentMilestones.set(sprint.milestone, req(repository + "/milestones", "POST", {
        title: sprint.milestone, description: "Marco do planejamento didático de reservas.",
        due_on: last.endDate + "T23:59:59Z",
      }));
    }
  }

  const cards = new Map(list(project + "/items").filter((card) => card.content?.id).map((card) => [card.content.id, card]));
  const option = (field, name) => fields.get(field).options.find((candidate) => optionName(candidate) === name).id;

  for (const item of plan.items) {
    const issue = issues.get(item.issue);
    const issuePath = repository + "/issues/" + issue.number;
    const milestone = currentMilestones.get(item.milestone).number;
    if (issue.type?.name !== item.type || issue.milestone?.number !== milestone) {
      const updated = req(issuePath, "PATCH", { type: item.type, milestone });
      if (updated.type?.name !== item.type || updated.milestone?.number !== milestone) {
        throw new Error("Tipo ou milestone não confirmado em #" + issue.number);
      }
    }
    const blockedByPath = issuePath + "/dependencies/blocked_by";
    const existingLinks = new Set(list(blockedByPath).map((dependency) => dependency.id));
    const necessaryLinks = item.blockedBy.map((i) => issues.get(i).id);
    for (const blocker of necessaryLinks) {
      if (!existingLinks.has(blocker)) req(blockedByPath, "POST", { issue_id: blocker });
    }
    if (necessaryLinks.some((blocker) => !existingLinks.has(blocker))) {
      const confirmed = new Set(list(blockedByPath).map((dependency) => dependency.id));
      if (necessaryLinks.some((blocker) => !confirmed.has(blocker))) throw new Error("Bloqueio não confirmado em #" + issue.number);
    }
    const card = cards.get(issue.id) ?? req(project + "/items", "POST", { type: "Issue", id: issue.id });
    const values = [
      ["Sprint", "sprint", "iterationId", sprintValues.get(item.sprint).id],
      ["Prioridade", "priority", "optionId", option("Prioridade", item.priority)],
      ["Tamanho", "size", "optionId", option("Tamanho", item.size)],
      ["Funcionalidade", "feature", "optionId", option("Funcionalidade", item.feature)],
      ["Peso", "weight", "number", item.weight],
      ["Início planejado", "start", "date", item.startDate],
      ["Entrega planejada", "end", "date", item.endDate],
    ];
    const readCard = () => graph(issueFieldsQuery, { id: card.node_id }).node;
    const cardValues = readCard();
    const pending = values.filter(([, key, property, value]) => cardValues?.[key]?.[property] !== value);
    if (pending.length) {
      req(project + "/items/" + card.id, "PATCH", { fields: pending.map(([name, , , value]) => ({ id: fields.get(name).id, value })) });
      const updated = readCard();
      if (pending.some(([, key, property, value]) => updated?.[key]?.[property] !== value)) {
        throw new Error("Campos do cartão não confirmados em #" + issue.number);
      }
    }
    log("Conferido #" + issue.number + " · " + item.sprint + " · " + item.type);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { values } = parseArgs({ options: { inicio: { type: "string" }, aplicar: { type: "boolean" } } });
    if (!values.inicio) throw new Error("Uso: node tools/github-project/configurar.mjs --inicio AAAA-MM-DD [--aplicar]");
    const plan = buildPlan(JSON.parse(readFileSync(seedFile, "utf8")), values.inicio);
    if (values.aplicar) applyPlan(plan);
    else console.log(JSON.stringify(plan, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
