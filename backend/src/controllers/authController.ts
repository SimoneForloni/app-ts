import { Context } from 'hono';
import { sign } from 'hono/jwt'
import { env } from 'hono/adapter'
import { db } from '../db/db';
import { users } from '../db/schemes/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

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

export const login = async (c: Context) => {
	const { email, password } = await c.req.json()

	try {
		const [user] = await db.select().from(users).where(eq(users.email, email));

		if (!user) {
			return c.json({ error: 'Credenziali non valide' }, 401);
		}

		const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
      return c.json({ error: 'Credenziali non valide' }, 401)
    }

		const payload = {
			id: user.id,
			username: user.username,
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
		}

		const variables = env<{ JWT_SECRET: string }>(c)
		const secret = variables.JWT_SECRET || 'segreto_di_emergenza_cambiami'

		const token = await sign(payload, secret);
		
		return c.json({
      message: 'Login effettuato!',
      token: token,
      user: { id: user.id, username: user.username }
    });
	} catch (error) {
		console.error("ERRORE LOGIN DETTAGLIATO:", error);
		return c.json({ error: 'Errore durante il login' }, 500);
	}
}