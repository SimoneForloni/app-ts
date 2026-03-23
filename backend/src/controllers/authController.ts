import { Context } from 'hono';
import { db } from '../db/db';
import { users } from '../db/schemes/schema';
import bcrypt from 'bcryptjs';

export const register = async (c: Context) => {
	const body = await c.req.json();
	const { username, email, password } = body;

	try {
		const hashedPassword = await bcrypt.hash(password, 10);

		await db.insert(users).values({
			username,
			email,
			passwordHash: hashedPassword,
		});

		return c.json({ message: 'Utente creato!'}, 201)
	} catch (error) {
		console.error("ERRORE DURANTE LA REGISTRAZIONE:", error);
		return c.json({ error: 'Errore durante la registrazione'}, 500)
	}
}