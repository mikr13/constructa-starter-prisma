# Installation
```
pnpm add drizzle-repository-generator
```
# How to use
## basic
```ts
import { Repository } from 'drizzle-repository-generator'
const repo = Repository(db, user);
// find
await repo.find({ id }).returnFirst();
// insert
await repo.insert(data);
// upsert
await repo.insert(data, { onConflict: 'update' });
// update
await repo.update(data).where({ id: 1 });
// delete
await repo.delete(where);
```
## complex query
### Finding
```ts
const repo = Repository(db, user, { local });
await repo.with('local').find({ id }).returnFirst();
await repo.with('local').find(['id', '=', 2]).returnFirst();
await repo.with('local').find(eq(/** ... */)).returnFirst();
await repo.with('local').find([
    ['name', 'like', '%john%'],
    ['age', '>', 20],
    // ...
]).returnMany();

// orderBy
await repo.with('local').find({ id }).returnMany({
    offset: 0,
    limit: 100,
    
    orderBy: ['id', 'desc'],
    // or
    orderBy: [
        ['id', 'desc'],
        ['name', 'asc'],
    ],
    // or
    orderBy: [asc(...)]
});
```
### Mutations
```ts
// update
await repo.update(data).where({
    id: 1,
    name: 'john',
});
// delete
await repo.delete([
    'id', '=', 1,
    'name', '=', 'john',
]);
```
## Transaction
```ts
await db.transaction((tx) => {
    const userRepo = Repository(tx, user);
    const sessionRepo = Repository(tx, session);
    await userRepo.insert(user);
    await sessionRepo.insert(session);
})
```

# compatible
- **postgres** implemented only
- **sqlite** considering

# Warn
- primary key have to fixed to be `id` yet. cause every table mapped by this.
- tests are not enough. please open issue whenever finding bugs for appreciate.
