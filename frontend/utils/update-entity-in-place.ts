// TODO: fix typing
export function updateEntityInPlace<Entity extends {id?: number}>(current: Entity, next: Entity) {
  // assume current and next have the same properties
  Object.getOwnPropertyNames(current).forEach(prop => {
    if (!next.hasOwnProperty(prop)) {
      // This would be the case when the data in the store is
      // denormalized and a 'Company' instance may have different
      // properties present depending on how it was fetched:
      // through ContactsEndpoint (excludes company.employees),
      // or through CompanyEndpoint (includes company.employees).
      // Editing an employee would assign it's `company` property
      // from one that does not have `employees` to the one that
      // has, and later when the contacts list is re-fetched from
      // the backend the new contact would not have
      // `company.employees` anymore.
      return;
    }
    if (Array.isArray((current as any)[prop])) {
      // assume any array is an entity array
      // assume the arrays are not self-recursive
      updateEntityArrayInPlace(
        (current as any)[prop] as any as Array<{id: number}>,
        (next as any)[prop] as any as Array<{id: number}>);
    } else if (typeof (current as any)[prop] === 'object' && (current as any)[prop] !== null) {
      // assume any object is an entity
      // assume the objects are not self-recursive
      updateEntityInPlace(
        (current as any)[prop] as any as {id: number},
        (next as any)[prop] as any as {id: number});
    } else {
      (current as any)[prop] = (next as any)[prop];
    }
  });
}

export function updateEntityArrayInPlace<Entity extends {id?: number}>(current: Entity[], next: Entity[]) {
  const nextEntityById = new Map<Entity['id'], Entity>();
  next.forEach(entity => nextEntityById.set(entity.id, entity));

  const toRemove: Entity[] = [];
  current.forEach(currentEntity => {
    if (nextEntityById.has(currentEntity.id)) {
      const nextEntity = nextEntityById.get(currentEntity.id)!;
      updateEntityInPlace(currentEntity, nextEntity);
      nextEntityById.delete(currentEntity.id);
    } else {
      toRemove.push(currentEntity);
    }
  });

  // assume it's OK to have a different order of elements in the mutated
  // in-place `current` array and the `next` array
  toRemove.forEach(entity =>
    current.splice(current.indexOf(entity), 1));
  current.push(...nextEntityById.values());
}