/** @type {import('plop').NodePlopAPI} */
module.exports = function (plop) {
  plop.setHelper("lower", (txt) => String(txt).toLowerCase());

  // PAGE (App Router)
  plop.setGenerator("page", {
    description: "Generează o pagină în app/<name>/page.tsx",
    prompts: [
      { type: "input", name: "name", message: "Numele paginii (ex: dashboard)" },
      { type: "input", name: "title", message: "Titlul paginii (opțional)", default: "{{properCase name}}" },
    ],
    actions: [
      {
        type: "add",
        path: "app/{{dashCase name}}/page.tsx",
        templateFile: "plop-templates/page.hbs",
        abortOnFail: true,
      },
    ],
  });

  // API route
  plop.setGenerator("api", {
    description: "Generează un API route în app/api/<name>/route.ts",
    prompts: [{ type: "input", name: "name", message: "Numele rutei API (ex: ping)" }],
    actions: [
      {
        type: "add",
        path: "app/api/{{dashCase name}}/route.ts",
        templateFile: "plop-templates/api.hbs",
        abortOnFail: true,
      },
    ],
  });

  // COMPONENT
  plop.setGenerator("component", {
    description: "Generează un component React în components/",
    prompts: [{ type: "input", name: "name", message: "Numele componentului (ex: StatCard)" }],
    actions: [
      {
        type: "add",
        path: "components/{{properCase name}}.tsx",
        templateFile: "plop-templates/component.hbs",
        abortOnFail: true,
      },
    ],
  });

  // HOOK
  plop.setGenerator("hook", {
    description: "Generează un hook în hooks/",
    prompts: [{ type: "input", name: "name", message: "Numele hook-ului (ex: Toggle)" }],
    actions: [
      {
        type: "add",
        path: "hooks/use{{properCase name}}.ts",
        templateFile: "plop-templates/hook.hbs",
        abortOnFail: true,
      },
    ],
  });
};
