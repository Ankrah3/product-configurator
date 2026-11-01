async function request(path, options) {
  const response = await fetch(`/api${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "The server could not complete the request.");
  return data;
}

export const api = {
  getProduct: () => request("/product"),
  saveConfiguration: (configuration) => request("/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(configuration),
  }),
  getConfigurations: () => request("/configurations"),
  deleteConfiguration: (id) => request(`/configurations/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
