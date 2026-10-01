export function replaceItem(list, item) {
  const id = String(item._id);
  const index = list.findIndex((entry) => String(entry._id) === id);
  if (index === -1) return [...list, item];
  const next = list.slice();
  next[index] = item;
  return next;
}

export function removeItem(list, id) {
  const key = String(id);
  return list.filter((entry) => String(entry._id) !== key);
}
