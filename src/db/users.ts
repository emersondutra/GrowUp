import { eq, desc } from 'drizzle-orm';
import { db } from './index.ts';
import { users } from './schema.ts';

export async function getAllUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.id));
  } catch (error) {
    console.error('Database getAllUsers failed:', error);
    throw new Error('Failed to retrieve users', { cause: error });
  }
}

export async function getUserById(id: number) {
  try {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  } catch (error) {
    console.error(`Database getUserById(${id}) failed:`, error);
    throw new Error('Failed to retrieve user', { cause: error });
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase()));
    return result[0] || null;
  } catch (error) {
    console.error(`Database getUserByEmail(${email}) failed:`, error);
    return null;
  }
}

export async function createUser(data: {
  fullName: string;
  name: string;
  email: string;
  cpf?: string;
  role?: 'admin' | 'cliente';
  status?: 'ativo' | 'inativo';
  displayName?: string;
  photoUrl?: string;
}) {
  try {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanCpf = data.cpf ? data.cpf.replace(/\D/g, '') : null;
    const cleanName = data.name.trim() || data.fullName.trim().split(' ')[0] || 'Usuário';

    const result = await db
      .insert(users)
      .values({
        fullName: data.fullName.trim(),
        name: cleanName,
        email: cleanEmail,
        cpf: cleanCpf,
        role: data.role || 'cliente',
        status: data.status || 'ativo',
        displayName: data.displayName || data.fullName.trim(),
        photoUrl: data.photoUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database createUser failed:', error);
    throw error;
  }
}

export async function updateUser(
  id: number,
  data: Partial<{
    fullName: string;
    name: string;
    email: string;
    cpf: string;
    role: 'admin' | 'cliente';
    status: 'ativo' | 'inativo';
    displayName: string;
    photoUrl: string;
  }>
) {
  try {
    const updatePayload: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.fullName !== undefined) updatePayload.fullName = data.fullName.trim();
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.email !== undefined) updatePayload.email = data.email.trim().toLowerCase();
    if (data.cpf !== undefined) updatePayload.cpf = data.cpf ? data.cpf.replace(/\D/g, '') : null;
    if (data.role !== undefined) updatePayload.role = data.role;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.displayName !== undefined) updatePayload.displayName = data.displayName;
    if (data.photoUrl !== undefined) updatePayload.photoUrl = data.photoUrl;

    const result = await db
      .update(users)
      .set(updatePayload)
      .where(eq(users.id, id))
      .returning();

    return result[0];
  } catch (error) {
    console.error(`Database updateUser(${id}) failed:`, error);
    throw error;
  }
}

export async function deleteUser(id: number) {
  try {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result[0];
  } catch (error) {
    console.error(`Database deleteUser(${id}) failed:`, error);
    throw error;
  }
}

export async function seedAdminUserIfEmpty() {
  try {
    // Check if Emerson Rocha Dutra exists
    const adminEmail = 'emerson.dutra@gmail.com';
    const existing = await getUserByEmail(adminEmail);
    if (!existing) {
      await db.insert(users).values({
        fullName: 'Emerson Rocha Dutra',
        name: 'Emerson',
        email: adminEmail,
        cpf: '01576230171',
        role: 'admin',
        status: 'ativo',
        displayName: 'Emerson Rocha Dutra',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('Admin user Emerson Rocha Dutra seeded successfully.');
    } else if (existing.role !== 'admin' || existing.cpf !== '01576230171') {
      // Ensure admin privileges and details
      await db
        .update(users)
        .set({
          fullName: 'Emerson Rocha Dutra',
          name: 'Emerson',
          cpf: '01576230171',
          role: 'admin',
          status: 'ativo',
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id));
      console.log('Admin user Emerson Rocha Dutra updated with admin role and CPF.');
    }
  } catch (error) {
    console.error('Failed to seed admin user:', error);
  }
}

export async function getOrCreateUser(uid: string, email: string, displayName?: string, photoUrl?: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    // Check if user already exists by email
    const existing = await getUserByEmail(cleanEmail);
    if (existing) {
      // Link uid if missing
      if (!existing.uid) {
        const updated = await db
          .update(users)
          .set({
            uid,
            displayName: displayName || existing.displayName,
            photoUrl: photoUrl || existing.photoUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existing.id))
          .returning();
        return updated[0];
      }
      return existing;
    }

    const name = displayName?.split(' ')[0] || cleanEmail.split('@')[0];
    const result = await db
      .insert(users)
      .values({
        uid,
        email: cleanEmail,
        fullName: displayName || name,
        name: name,
        role: cleanEmail === 'emerson.dutra@gmail.com' ? 'admin' : 'cliente',
        status: 'ativo',
        displayName: displayName || null,
        photoUrl: photoUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database getOrCreateUser failed:', error);
    throw new Error('Database operation failed. Please try again later.', { cause: error });
  }
}
