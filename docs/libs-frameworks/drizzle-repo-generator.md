# Prisma Repository Pattern

This project uses custom repository classes with Prisma for clean data access patterns.

## Basic Repository Operations

```ts
import { userRepo } from '~/db/repositories/user.repo';

// Find by ID
const user = await userRepo.findById(id);

// Create new record
const newUser = await userRepo.create(data);

// Update record
const updatedUser = await userRepo.update(id, data);

// Delete record
await userRepo.delete(id);
```

## Advanced Queries

### Finding with Complex Conditions

```ts
// Find with includes (relations)
const user = await userRepo.findById(id, {
  include: { profile: true, documents: true }
});

// Find by email
const user = await userRepo.findByEmail(email);

// Find many with conditions
const users = await userRepo.findMany({
  where: {
    emailVerified: true,
    createdAt: {
      gte: new Date('2024-01-01')
    }
  },
  include: { profile: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0
});

// Count records
const count = await userRepo.count({
  where: { emailVerified: true }
});
```

### Document Repository with Vector Search

```ts
import { documentChunkRepo } from '~/db/repositories/document.repo';

// Vector similarity search
const similarChunks = await documentChunkRepo.findSimilar(
  queryVector, 
  limit: 5, 
  threshold: 0.5
);

// Find chunks by file
const chunks = await documentChunkRepo.findByFileId(fileId);
```

### File Repository Operations

```ts
import { fileRepo } from '~/db/repositories/file.repo';

// Find by key
const file = await fileRepo.findByKey(key);

// Find by client
const files = await fileRepo.findByClientId(clientId);
```

## Transactions

```ts
import { db } from '~/db/client';

await db.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  const profile = await tx.profile.create({ 
    data: { ...profileData, userId: user.id } 
  });
  return { user, profile };
});
```

## Repository Pattern Benefits

- **Type Safety**: Full TypeScript support with Prisma's generated types
- **Clean API**: Simple, consistent interface across all repositories
- **Relations**: Easy handling of related data with `include`
- **Transactions**: Built-in transaction support
- **Vector Search**: Specialized methods for vector operations
- **Flexibility**: Direct access to Prisma's powerful query capabilities

## Available Repositories

- `userRepo` - User management
- `profileRepo` - User profiles
- `fileRepo` - File storage
- `documentRepo` - Document management
- `documentChunkRepo` - Document chunks with vector search
