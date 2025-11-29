export function filterRoutesByQuery(routes, query) {
  const q = query.toLowerCase();
  return routes.filter(
    (r) =>
      (r.route_number && r.route_number.toLowerCase().includes(q)) ||
      (r.destination && r.destination.toLowerCase().includes(q)) ||
      (r.area && r.area.toLowerCase().includes(q))
  );
}
